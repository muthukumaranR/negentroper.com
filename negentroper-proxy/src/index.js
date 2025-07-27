#!/usr/bin/env node

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const cron = require('node-cron');
require('dotenv').config();

const ProxyManager = require('./proxy/manager');
const ProjectRegistry = require('./registry/registry');
const DiscoveryService = require('./discovery/scanner');
const HealthChecker = require('./health/checker');
const ApiRouter = require('./api/router');
const SSLManager = require('./ssl/manager');
const Logger = require('./utils/logger');

class NegentroperProxy {
  constructor() {
    this.logger = new Logger();
    this.app = express();
    this.httpsApp = express();
    this.proxyManager = new ProxyManager();
    this.registry = new ProjectRegistry();
    this.discovery = new DiscoveryService();
    this.healthChecker = new HealthChecker();
    this.sslManager = new SSLManager();
    this.apiRouter = new ApiRouter(this.registry, this.discovery, this.healthChecker);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupScheduledTasks();
  }

  setupMiddleware() {
    // Security middleware
    if (process.env.ENABLE_HELMET === 'true') {
      this.app.use(helmet());
      this.httpsApp.use(helmet());
    }

    // CORS middleware
    if (process.env.ENABLE_CORS === 'true') {
      const corsOptions = {
        origin: [`https://*.${process.env.BASE_DOMAIN}`, `http://*.${process.env.BASE_DOMAIN}`],
        credentials: true
      };
      this.app.use(cors(corsOptions));
      this.httpsApp.use(cors(corsOptions));
    }

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.httpsApp.use(express.json());
    this.httpsApp.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Admin API routes
    this.app.use('/api', this.apiRouter.getRouter());
    this.httpsApp.use('/api', this.apiRouter.getRouter());

    // Main proxy middleware - must be last
    this.app.use('*', this.createProxyMiddleware());
    this.httpsApp.use('*', this.createProxyMiddleware());
  }

  createProxyMiddleware() {
    return (req, res, next) => {
      const subdomain = this.extractSubdomain(req.headers.host);
      
      if (!subdomain) {
        return this.handleRootDomain(req, res);
      }

      const project = this.registry.getProject(subdomain);
      
      if (!project) {
        return this.handleNotFound(req, res, subdomain);
      }

      if (!this.healthChecker.isHealthy(project.name)) {
        return this.handleUnhealthyService(req, res, project);
      }

      const proxy = createProxyMiddleware({
        target: `http://localhost:${project.port}`,
        changeOrigin: true,
        ws: true, // WebSocket support
        onError: (err, req, res) => {
          this.logger.error(`Proxy error for ${subdomain}:`, err);
          res.status(502).json({
            error: 'Service temporarily unavailable',
            subdomain: subdomain,
            message: 'The requested service is not responding'
          });
        },
        onProxyReq: (proxyReq, req, res) => {
          this.logger.debug(`Proxying ${req.method} ${req.url} to ${project.name}:${project.port}`);
        }
      });

      proxy(req, res, next);
    };
  }

  extractSubdomain(host) {
    if (!host) return null;
    
    const baseDomain = process.env.BASE_DOMAIN || 'negentroper.com';
    const parts = host.split('.');
    
    if (parts.length < 3) return null;
    if (!host.endsWith(baseDomain)) return null;
    
    return parts[0];
  }

  handleRootDomain(req, res) {
    res.json({
      message: 'Negentroper Proxy Server',
      version: '1.0.0',
      projects: this.registry.getActiveProjects().map(p => ({
        name: p.name,
        subdomain: p.subdomain,
        status: this.healthChecker.isHealthy(p.name) ? 'healthy' : 'unhealthy'
      })),
      endpoints: {
        api: '/api',
        health: '/api/health',
        projects: '/api/projects'
      }
    });
  }

  handleNotFound(req, res, subdomain) {
    this.logger.warn(`Project not found for subdomain: ${subdomain}`);
    res.status(404).json({
      error: 'Project not found',
      subdomain: subdomain,
      message: `No project registered for ${subdomain}.${process.env.BASE_DOMAIN}`,
      availableProjects: this.registry.getActiveProjects().map(p => p.subdomain)
    });
  }

  handleUnhealthyService(req, res, project) {
    this.logger.warn(`Unhealthy service: ${project.name}`);
    res.status(503).json({
      error: 'Service unavailable',
      project: project.name,
      message: 'The requested service is currently unhealthy',
      lastHealthCheck: this.healthChecker.getLastCheck(project.name)
    });
  }

  setupScheduledTasks() {
    // Auto-discovery every 30 seconds
    if (process.env.AUTO_DISCOVERY === 'true') {
      cron.schedule('*/30 * * * * *', async () => {
        try {
          await this.discovery.scanAndUpdate();
        } catch (error) {
          this.logger.error('Discovery scan failed:', error);
        }
      });
    }

    // Health checks every minute
    cron.schedule('* * * * *', async () => {
      try {
        await this.healthChecker.checkAll();
      } catch (error) {
        this.logger.error('Health check failed:', error);
      }
    });

    // SSL renewal check daily at 2 AM
    if (process.env.SSL_AUTO_RENEW === 'true') {
      cron.schedule('0 2 * * *', async () => {
        try {
          await this.sslManager.renewCertificates();
        } catch (error) {
          this.logger.error('SSL renewal failed:', error);
        }
      });
    }
  }

  async start() {
    try {
      // Initialize components
      await this.registry.initialize();
      await this.discovery.initialize();
      await this.healthChecker.initialize();
      
      // Initial discovery scan
      if (process.env.AUTO_DISCOVERY === 'true') {
        await this.discovery.scanAndUpdate();
      }

      // Initial health check
      await this.healthChecker.checkAll();

      // Start HTTP server
      const httpPort = process.env.PORT || 80;
      this.httpServer = this.app.listen(httpPort, () => {
        this.logger.info(`HTTP Proxy server started on port ${httpPort}`);
      });

      // Start HTTPS server if SSL is configured
      if (await this.sslManager.isConfigured()) {
        const httpsPort = process.env.HTTPS_PORT || 443;
        const sslOptions = await this.sslManager.getSSLOptions();
        
        this.httpsServer = https.createServer(sslOptions, this.httpsApp);
        this.httpsServer.listen(httpsPort, () => {
          this.logger.info(`HTTPS Proxy server started on port ${httpsPort}`);
        });
      }

      // Graceful shutdown handling
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());

      this.logger.info('Negentroper Proxy System started successfully');
      
    } catch (error) {
      this.logger.error('Failed to start proxy system:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    this.logger.info('Shutting down Negentroper Proxy System...');
    
    if (this.httpServer) {
      this.httpServer.close();
    }
    
    if (this.httpsServer) {
      this.httpsServer.close();
    }
    
    process.exit(0);
  }
}

// Start the proxy system
if (require.main === module) {
  const proxy = new NegentroperProxy();
  proxy.start();
}

module.exports = NegentroperProxy;