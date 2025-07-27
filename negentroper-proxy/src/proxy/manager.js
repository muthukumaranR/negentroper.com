const { createProxyMiddleware } = require('http-proxy-middleware');
const Logger = require('../utils/logger');

class ProxyManager {
  constructor() {
    this.logger = new Logger('ProxyManager');
    this.proxies = new Map();
    this.proxyStats = new Map();
  }

  createProxy(target, options = {}) {
    const proxyOptions = {
      target,
      changeOrigin: true,
      ws: true, // WebSocket support
      followRedirects: true,
      secure: false, // Allow self-signed certificates in development
      timeout: parseInt(process.env.PROXY_TIMEOUT) || 30000,
      ...options,
      
      onError: (err, req, res, target) => {
        this.handleProxyError(err, req, res, target);
      },
      
      onProxyReq: (proxyReq, req, res, options) => {
        this.handleProxyRequest(proxyReq, req, res, options);
      },
      
      onProxyRes: (proxyRes, req, res) => {
        this.handleProxyResponse(proxyRes, req, res);
      }
    };

    return createProxyMiddleware(proxyOptions);
  }

  handleProxyError(err, req, res, target) {
    const host = req.headers.host;
    const url = req.url;
    
    this.logger.error(`Proxy error for ${host}${url}:`, {
      error: err.message,
      code: err.code,
      target: target || 'unknown',
      method: req.method,
      userAgent: req.headers['user-agent']
    });

    // Update stats
    this.updateStats(host, 'error');

    if (!res.headersSent) {
      res.status(502).json({
        error: 'Bad Gateway',
        message: 'The upstream server is not responding',
        timestamp: new Date().toISOString(),
        requestId: this.generateRequestId()
      });
    }
  }

  handleProxyRequest(proxyReq, req, res, options) {
    const host = req.headers.host;
    const startTime = Date.now();
    
    // Add custom headers
    proxyReq.setHeader('X-Forwarded-Proto', req.protocol || 'http');
    proxyReq.setHeader('X-Forwarded-Host', host);
    proxyReq.setHeader('X-Real-IP', req.ip || req.connection.remoteAddress);
    proxyReq.setHeader('X-Negentroper-Proxy', '1.0.0');
    
    // Store request start time for metrics
    req.proxyStartTime = startTime;
    
    this.logger.debug(`Proxying request: ${req.method} ${host}${req.url} -> ${options.target}`);
    
    // Update stats
    this.updateStats(host, 'request');
  }

  handleProxyResponse(proxyRes, req, res) {
    const host = req.headers.host;
    const duration = Date.now() - (req.proxyStartTime || Date.now());
    
    // Add response headers
    proxyRes.headers['X-Negentroper-Proxy'] = '1.0.0';
    proxyRes.headers['X-Response-Time'] = `${duration}ms`;
    
    this.logger.debug(`Proxy response: ${host} -> ${proxyRes.statusCode} (${duration}ms)`);
    
    // Update stats
    this.updateStats(host, 'response', {
      statusCode: proxyRes.statusCode,
      duration
    });
  }

  updateStats(host, type, data = {}) {
    if (!this.proxyStats.has(host)) {
      this.proxyStats.set(host, {
        requests: 0,
        responses: 0,
        errors: 0,
        totalDuration: 0,
        averageDuration: 0,
        statusCodes: {},
        lastAccess: null
      });
    }

    const stats = this.proxyStats.get(host);
    stats.lastAccess = new Date();

    switch (type) {
      case 'request':
        stats.requests++;
        break;
        
      case 'response':
        stats.responses++;
        if (data.duration) {
          stats.totalDuration += data.duration;
          stats.averageDuration = Math.round(stats.totalDuration / stats.responses);
        }
        if (data.statusCode) {
          stats.statusCodes[data.statusCode] = (stats.statusCodes[data.statusCode] || 0) + 1;
        }
        break;
        
      case 'error':
        stats.errors++;
        break;
    }

    this.proxyStats.set(host, stats);
  }

  getStats(host = null) {
    if (host) {
      return this.proxyStats.get(host) || null;
    }
    
    return Array.from(this.proxyStats.entries()).map(([hostname, stats]) => ({
      host: hostname,
      ...stats
    }));
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  // Method to create a proxy for a specific subdomain
  createSubdomainProxy(subdomain, port, options = {}) {
    const target = `http://localhost:${port}`;
    const proxyKey = `${subdomain}:${port}`;
    
    if (this.proxies.has(proxyKey)) {
      this.logger.debug(`Reusing existing proxy for ${subdomain} -> ${target}`);
      return this.proxies.get(proxyKey);
    }

    const proxy = this.createProxy(target, {
      ...options,
      pathRewrite: options.pathRewrite || {},
      router: options.router || {}
    });

    this.proxies.set(proxyKey, proxy);
    this.logger.info(`Created proxy for ${subdomain} -> ${target}`);
    
    return proxy;
  }

  // Method to remove a proxy
  removeProxy(subdomain, port) {
    const proxyKey = `${subdomain}:${port}`;
    
    if (this.proxies.has(proxyKey)) {
      this.proxies.delete(proxyKey);
      this.logger.info(`Removed proxy for ${subdomain}:${port}`);
      return true;
    }
    
    return false;
  }

  // Get all active proxies
  getActiveProxies() {
    return Array.from(this.proxies.keys());
  }

  // Clear all proxy stats
  clearStats() {
    this.proxyStats.clear();
    this.logger.info('Cleared all proxy statistics');
  }

  // Get aggregated stats
  getAggregatedStats() {
    const allStats = this.getStats();
    
    const aggregated = {
      totalHosts: allStats.length,
      totalRequests: 0,
      totalResponses: 0,
      totalErrors: 0,
      averageResponseTime: 0,
      statusCodeDistribution: {},
      errorRate: 0,
      lastUpdate: new Date()
    };

    let totalDuration = 0;
    let responseCount = 0;

    allStats.forEach(stat => {
      aggregated.totalRequests += stat.requests;
      aggregated.totalResponses += stat.responses;
      aggregated.totalErrors += stat.errors;
      
      if (stat.responses > 0) {
        totalDuration += stat.totalDuration;
        responseCount += stat.responses;
      }

      // Merge status codes
      Object.keys(stat.statusCodes).forEach(code => {
        aggregated.statusCodeDistribution[code] = 
          (aggregated.statusCodeDistribution[code] || 0) + stat.statusCodes[code];
      });
    });

    if (responseCount > 0) {
      aggregated.averageResponseTime = Math.round(totalDuration / responseCount);
    }

    if (aggregated.totalRequests > 0) {
      aggregated.errorRate = Math.round((aggregated.totalErrors / aggregated.totalRequests) * 100 * 100) / 100;
    }

    return aggregated;
  }
}

module.exports = ProxyManager;