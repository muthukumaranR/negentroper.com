const axios = require('axios');
const Logger = require('../utils/logger');

class HealthChecker {
  constructor(registry) {
    this.logger = new Logger('Health');
    this.registry = registry;
    this.healthStatus = new Map();
    this.healthHistory = new Map();
    this.checkInterval = parseInt(process.env.HEALTH_CHECK_INTERVAL) || 60000;
    this.checkTimeout = parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000;
    this.maxRetries = parseInt(process.env.HEALTH_CHECK_RETRIES) || 3;
  }

  async initialize() {
    this.logger.info('Health checker initialized');
  }

  async checkAll() {
    if (!this.registry) {
      this.logger.warn('No registry available for health checks');
      return;
    }

    const projects = this.registry.getAllProjects();
    const results = [];

    for (const project of projects) {
      try {
        const result = await this.checkProject(project);
        results.push(result);
      } catch (error) {
        this.logger.error(`Health check failed for ${project.name}:`, error);
        results.push({
          project: project.name,
          subdomain: project.subdomain,
          healthy: false,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    this.logger.debug(`Completed health checks for ${results.length} projects`);
    return results;
  }

  async checkProject(project) {
    const startTime = Date.now();
    
    try {
      const healthResult = await this.performHealthCheck(project);
      const duration = Date.now() - startTime;
      
      const result = {
        project: project.name,
        subdomain: project.subdomain,
        port: project.port,
        healthy: healthResult.healthy,
        status: healthResult.status,
        responseTime: duration,
        timestamp: new Date(),
        details: healthResult.details
      };

      // Update health status
      this.healthStatus.set(project.name, result);
      
      // Update health history
      this.updateHealthHistory(project.name, result);
      
      // Update project status in registry
      if (this.registry) {
        const newStatus = healthResult.healthy ? 'healthy' : 'unhealthy';
        await this.registry.setProjectStatus(project.subdomain, newStatus);
      }

      this.logger.debug(`Health check for ${project.name}: ${healthResult.healthy ? 'HEALTHY' : 'UNHEALTHY'} (${duration}ms)`);
      
      return result;
    } catch (error) {
      this.logger.error(`Health check error for ${project.name}:`, error);
      throw error;
    }
  }

  async performHealthCheck(project) {
    const baseUrl = `http://localhost:${project.port}`;
    const healthPath = project.healthCheckPath || '/';
    const url = `${baseUrl}${healthPath}`;

    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await axios.get(url, {
          timeout: this.checkTimeout,
          validateStatus: (status) => status < 500, // Accept 4xx but not 5xx
          headers: {
            'User-Agent': 'Negentroper-Proxy-Health-Checker/1.0',
            'Accept': '*/*'
          }
        });

        const healthy = response.status >= 200 && response.status < 400;
        
        return {
          healthy,
          status: response.status,
          details: {
            attempt,
            responseTime: response.headers['x-response-time'],
            contentLength: response.headers['content-length'],
            server: response.headers['server'],
            lastModified: response.headers['last-modified']
          }
        };
      } catch (error) {
        lastError = error;
        
        if (attempt < this.maxRetries) {
          // Wait before retry with exponential backoff
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await this.sleep(waitTime);
          continue;
        }
      }
    }

    // All retries failed
    return {
      healthy: false,
      status: lastError.response ? lastError.response.status : 0,
      details: {
        attempts: this.maxRetries,
        error: lastError.code || lastError.message,
        timeout: lastError.code === 'ECONNABORTED'
      }
    };
  }

  updateHealthHistory(projectName, result) {
    if (!this.healthHistory.has(projectName)) {
      this.healthHistory.set(projectName, []);
    }

    const history = this.healthHistory.get(projectName);
    history.push(result);

    // Keep only last 100 entries
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  isHealthy(projectName) {
    const status = this.healthStatus.get(projectName);
    return status ? status.healthy : false;
  }

  getHealthStatus(projectName) {
    return this.healthStatus.get(projectName);
  }

  getAllHealthStatus() {
    return Array.from(this.healthStatus.values());
  }

  getHealthHistory(projectName, limit = 50) {
    const history = this.healthHistory.get(projectName) || [];
    return history.slice(-limit);
  }

  getLastCheck(projectName) {
    const status = this.healthStatus.get(projectName);
    return status ? status.timestamp : null;
  }

  getHealthSummary() {
    const allStatus = this.getAllHealthStatus();
    
    const summary = {
      total: allStatus.length,
      healthy: allStatus.filter(s => s.healthy).length,
      unhealthy: allStatus.filter(s => !s.healthy).length,
      averageResponseTime: 0,
      lastUpdate: new Date()
    };

    if (allStatus.length > 0) {
      const healthyServices = allStatus.filter(s => s.healthy);
      if (healthyServices.length > 0) {
        summary.averageResponseTime = Math.round(
          healthyServices.reduce((sum, s) => sum + s.responseTime, 0) / healthyServices.length
        );
      }
    }

    return summary;
  }

  getUptimeStats(projectName, hours = 24) {
    const history = this.healthHistory.get(projectName) || [];
    const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    const recentHistory = history.filter(entry => entry.timestamp >= cutoff);
    
    if (recentHistory.length === 0) {
      return {
        uptime: 0,
        totalChecks: 0,
        healthyChecks: 0,
        averageResponseTime: 0
      };
    }

    const healthyChecks = recentHistory.filter(entry => entry.healthy);
    
    return {
      uptime: Math.round((healthyChecks.length / recentHistory.length) * 100),
      totalChecks: recentHistory.length,
      healthyChecks: healthyChecks.length,
      averageResponseTime: healthyChecks.length > 0 
        ? Math.round(healthyChecks.reduce((sum, entry) => sum + entry.responseTime, 0) / healthyChecks.length)
        : 0,
      period: `${hours} hours`
    };
  }

  async checkSpecificProject(subdomain) {
    if (!this.registry) {
      throw new Error('Registry not available');
    }

    const project = this.registry.getProject(subdomain);
    if (!project) {
      throw new Error(`Project with subdomain '${subdomain}' not found`);
    }

    return await this.checkProject(project);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get detailed diagnostics for a project
  async getDiagnostics(projectName) {
    const status = this.getHealthStatus(projectName);
    const history = this.getHealthHistory(projectName, 10);
    const uptime = this.getUptimeStats(projectName);
    
    if (!status) {
      return {
        error: 'No health data available',
        projectName
      };
    }

    const project = this.registry.getAllProjects().find(p => p.name === projectName);
    
    return {
      project: {
        name: projectName,
        subdomain: project?.subdomain,
        port: project?.port,
        type: project?.type
      },
      currentStatus: status,
      uptime,
      recentHistory: history,
      diagnostics: {
        isResponding: status.healthy,
        lastResponseTime: status.responseTime,
        consecutiveFailures: this.getConsecutiveFailures(projectName),
        recommendations: this.generateRecommendations(status, uptime)
      }
    };
  }

  getConsecutiveFailures(projectName) {
    const history = this.healthHistory.get(projectName) || [];
    let failures = 0;
    
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].healthy) {
        break;
      }
      failures++;
    }
    
    return failures;
  }

  generateRecommendations(status, uptime) {
    const recommendations = [];
    
    if (!status.healthy) {
      recommendations.push('Service is currently unhealthy - check if process is running');
    }
    
    if (status.responseTime > 5000) {
      recommendations.push('High response time detected - consider performance optimization');
    }
    
    if (uptime.uptime < 95) {
      recommendations.push('Low uptime detected - investigate recurring issues');
    }
    
    if (this.getConsecutiveFailures(status.project) > 5) {
      recommendations.push('Multiple consecutive failures - service may need restart');
    }
    
    return recommendations;
  }
}

module.exports = HealthChecker;