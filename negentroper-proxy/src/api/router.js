const express = require('express');
const Logger = require('../utils/logger');

class ApiRouter {
  constructor(registry, discovery, healthChecker) {
    this.logger = new Logger('API');
    this.registry = registry;
    this.discovery = discovery;
    this.healthChecker = healthChecker;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Middleware for API key authentication (admin routes)
    this.router.use('/admin', this.requireApiKey.bind(this));

    // Public routes
    this.router.get('/', this.getApiInfo.bind(this));
    this.router.get('/health', this.getSystemHealth.bind(this));
    this.router.get('/projects', this.getProjects.bind(this));
    this.router.get('/projects/:subdomain', this.getProject.bind(this));
    this.router.get('/projects/:subdomain/health', this.getProjectHealth.bind(this));
    this.router.get('/discovery/scan', this.triggerDiscovery.bind(this));

    // Admin routes (require API key)
    this.router.post('/admin/projects', this.registerProject.bind(this));
    this.router.put('/admin/projects/:subdomain', this.updateProject.bind(this));
    this.router.delete('/admin/projects/:subdomain', this.unregisterProject.bind(this));
    this.router.post('/admin/discovery/scan', this.adminTriggerDiscovery.bind(this));
    this.router.get('/admin/health/check', this.triggerHealthCheck.bind(this));
    this.router.get('/admin/health/diagnostics/:projectName', this.getProjectDiagnostics.bind(this));
    this.router.get('/admin/stats', this.getSystemStats.bind(this));
    this.router.post('/admin/ssl/generate', this.generateSSLCertificate.bind(this));
    this.router.get('/admin/ssl/info', this.getSSLInfo.bind(this));
  }

  requireApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    const expectedKey = process.env.ADMIN_API_KEY;

    if (!expectedKey) {
      return res.status(501).json({
        error: 'Admin API not configured',
        message: 'ADMIN_API_KEY environment variable not set'
      });
    }

    if (!apiKey || apiKey !== expectedKey) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid API key required'
      });
    }

    next();
  }

  async getApiInfo(req, res) {
    res.json({
      name: 'Negentroper Proxy API',
      version: '1.0.0',
      description: 'REST API for managing subdomain proxy system',
      endpoints: {
        public: {
          'GET /': 'API information',
          'GET /health': 'System health status',
          'GET /projects': 'List all projects',
          'GET /projects/:subdomain': 'Get specific project',
          'GET /projects/:subdomain/health': 'Get project health',
          'GET /discovery/scan': 'Trigger discovery scan'
        },
        admin: {
          'POST /admin/projects': 'Register new project',
          'PUT /admin/projects/:subdomain': 'Update project',
          'DELETE /admin/projects/:subdomain': 'Unregister project',
          'GET /admin/health/check': 'Trigger health check',
          'GET /admin/health/diagnostics/:projectName': 'Get detailed diagnostics',
          'GET /admin/stats': 'Get system statistics',
          'POST /admin/ssl/generate': 'Generate SSL certificate',
          'GET /admin/ssl/info': 'Get SSL certificate info'
        }
      },
      authentication: {
        admin: 'API key required via X-API-Key header or api_key query parameter'
      }
    });
  }

  async getSystemHealth(req, res) {
    try {
      const healthSummary = this.healthChecker.getHealthSummary();
      const projectCount = this.registry.getAllProjects().length;
      
      res.json({
        status: 'ok',
        timestamp: new Date(),
        proxy: {
          status: 'running',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: '1.0.0'
        },
        projects: {
          total: projectCount,
          healthy: healthSummary.healthy,
          unhealthy: healthSummary.unhealthy
        },
        health: healthSummary
      });
    } catch (error) {
      this.logger.error('Failed to get system health:', error);
      res.status(500).json({
        error: 'Failed to get system health',
        message: error.message
      });
    }
  }

  async getProjects(req, res) {
    try {
      const { type, status, tag } = req.query;
      let projects = this.registry.getAllProjects();

      // Apply filters
      if (type) {
        projects = projects.filter(p => p.type === type);
      }
      
      if (status) {
        projects = projects.filter(p => p.status === status);
      }
      
      if (tag) {
        projects = projects.filter(p => p.tags && p.tags.includes(tag));
      }

      // Add health status to each project
      const projectsWithHealth = projects.map(project => ({
        ...project,
        health: {
          status: this.healthChecker.isHealthy(project.name) ? 'healthy' : 'unhealthy',
          lastCheck: this.healthChecker.getLastCheck(project.name)
        }
      }));

      res.json({
        projects: projectsWithHealth,
        total: projectsWithHealth.length,
        filters: { type, status, tag }
      });
    } catch (error) {
      this.logger.error('Failed to get projects:', error);
      res.status(500).json({
        error: 'Failed to get projects',
        message: error.message
      });
    }
  }

  async getProject(req, res) {
    try {
      const { subdomain } = req.params;
      const project = this.registry.getProject(subdomain);

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          subdomain
        });
      }

      const healthStatus = this.healthChecker.getHealthStatus(project.name);
      const uptime = this.healthChecker.getUptimeStats(project.name);

      res.json({
        ...project,
        health: healthStatus,
        uptime
      });
    } catch (error) {
      this.logger.error('Failed to get project:', error);
      res.status(500).json({
        error: 'Failed to get project',
        message: error.message
      });
    }
  }

  async getProjectHealth(req, res) {
    try {
      const { subdomain } = req.params;
      const project = this.registry.getProject(subdomain);

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          subdomain
        });
      }

      const healthResult = await this.healthChecker.checkSpecificProject(subdomain);
      const uptime = this.healthChecker.getUptimeStats(project.name);
      const history = this.healthChecker.getHealthHistory(project.name, 10);

      res.json({
        project: {
          name: project.name,
          subdomain: project.subdomain,
          port: project.port
        },
        current: healthResult,
        uptime,
        recentHistory: history
      });
    } catch (error) {
      this.logger.error('Failed to check project health:', error);
      res.status(500).json({
        error: 'Failed to check project health',
        message: error.message
      });
    }
  }

  async triggerDiscovery(req, res) {
    try {
      const results = await this.discovery.scanAndUpdate();
      
      res.json({
        message: 'Discovery scan completed',
        results,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Discovery scan failed:', error);
      res.status(500).json({
        error: 'Discovery scan failed',
        message: error.message
      });
    }
  }

  async registerProject(req, res) {
    try {
      const projectData = req.body;
      const project = await this.registry.registerProject(projectData);
      
      res.status(201).json({
        message: 'Project registered successfully',
        project
      });
    } catch (error) {
      this.logger.error('Failed to register project:', error);
      res.status(400).json({
        error: 'Failed to register project',
        message: error.message
      });
    }
  }

  async updateProject(req, res) {
    try {
      const { subdomain } = req.params;
      const updates = req.body;
      
      const project = await this.registry.updateProject(subdomain, updates);
      
      res.json({
        message: 'Project updated successfully',
        project
      });
    } catch (error) {
      this.logger.error('Failed to update project:', error);
      res.status(400).json({
        error: 'Failed to update project',
        message: error.message
      });
    }
  }

  async unregisterProject(req, res) {
    try {
      const { subdomain } = req.params;
      const project = await this.registry.unregisterProject(subdomain);
      
      res.json({
        message: 'Project unregistered successfully',
        project
      });
    } catch (error) {
      this.logger.error('Failed to unregister project:', error);
      res.status(400).json({
        error: 'Failed to unregister project',
        message: error.message
      });
    }
  }

  async adminTriggerDiscovery(req, res) {
    try {
      const results = await this.discovery.scanAndUpdate();
      const scanResults = this.discovery.getLastScanResults();
      
      res.json({
        message: 'Admin discovery scan completed',
        results,
        lastScan: scanResults,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Admin discovery scan failed:', error);
      res.status(500).json({
        error: 'Admin discovery scan failed',
        message: error.message
      });
    }
  }

  async triggerHealthCheck(req, res) {
    try {
      const results = await this.healthChecker.checkAll();
      
      res.json({
        message: 'Health check completed',
        results,
        summary: this.healthChecker.getHealthSummary(),
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Health check failed:', error);
      res.status(500).json({
        error: 'Health check failed',
        message: error.message
      });
    }
  }

  async getProjectDiagnostics(req, res) {
    try {
      const { projectName } = req.params;
      const diagnostics = await this.healthChecker.getDiagnostics(projectName);
      
      res.json(diagnostics);
    } catch (error) {
      this.logger.error('Failed to get project diagnostics:', error);
      res.status(500).json({
        error: 'Failed to get project diagnostics',
        message: error.message
      });
    }
  }

  async getSystemStats(req, res) {
    try {
      const registryStats = this.registry.getStats();
      const healthSummary = this.healthChecker.getHealthSummary();
      
      res.json({
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          platform: process.platform,
          nodeVersion: process.version
        },
        registry: registryStats,
        health: healthSummary,
        timestamp: new Date()
      });
    } catch (error) {
      this.logger.error('Failed to get system stats:', error);
      res.status(500).json({
        error: 'Failed to get system stats',
        message: error.message
      });
    }
  }

  async generateSSLCertificate(req, res) {
    try {
      // This would integrate with the SSL manager
      res.json({
        message: 'SSL certificate generation not implemented yet',
        note: 'This feature requires integration with SSL manager'
      });
    } catch (error) {
      this.logger.error('Failed to generate SSL certificate:', error);
      res.status(500).json({
        error: 'Failed to generate SSL certificate',
        message: error.message
      });
    }
  }

  async getSSLInfo(req, res) {
    try {
      // This would integrate with the SSL manager
      res.json({
        message: 'SSL information not implemented yet',
        note: 'This feature requires integration with SSL manager'
      });
    } catch (error) {
      this.logger.error('Failed to get SSL info:', error);
      res.status(500).json({
        error: 'Failed to get SSL info',
        message: error.message
      });
    }
  }

  getRouter() {
    return this.router;
  }
}

module.exports = ApiRouter;