const portfinder = require('portfinder');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const Logger = require('../utils/logger');

const execAsync = promisify(exec);

class DiscoveryService {
  constructor(registry) {
    this.logger = new Logger('Discovery');
    this.registry = registry;
    this.scanResults = new Map();
    this.lastScan = null;
  }

  async initialize() {
    this.logger.info('Discovery service initialized');
  }

  async scanAndUpdate() {
    const startTime = Date.now();
    this.logger.info('Starting discovery scan...');

    try {
      const activeServices = await this.scanActivePorts();
      const webServices = await this.identifyWebServices(activeServices);
      const projectCandidates = await this.detectProjectStructures();
      
      await this.updateRegistry(webServices, projectCandidates);
      
      this.lastScan = new Date();
      const duration = Date.now() - startTime;
      
      this.logger.info(`Discovery scan completed in ${duration}ms. Found ${webServices.length} web services`);
      
      return {
        activeServices: activeServices.length,
        webServices: webServices.length,
        projectCandidates: projectCandidates.length,
        duration
      };
    } catch (error) {
      this.logger.error('Discovery scan failed:', error);
      throw error;
    }
  }

  async scanActivePorts() {
    const portRange = {
      start: parseInt(process.env.PORT_RANGE_START) || 3001,
      end: parseInt(process.env.PORT_RANGE_END) || 9000
    };

    const activeServices = [];
    const batchSize = 50; // Check ports in batches to avoid overwhelming the system

    for (let start = portRange.start; start <= portRange.end; start += batchSize) {
      const end = Math.min(start + batchSize - 1, portRange.end);
      const batch = await this.checkPortBatch(start, end);
      activeServices.push(...batch);
    }

    return activeServices;
  }

  async checkPortBatch(startPort, endPort) {
    const promises = [];
    
    for (let port = startPort; port <= endPort; port++) {
      promises.push(this.checkPort(port));
    }

    const results = await Promise.allSettled(promises);
    return results
      .map((result, index) => ({ port: startPort + index, ...result }))
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => result.port);
  }

  async checkPort(port) {
    return new Promise((resolve) => {
      const net = require('net');
      const socket = new net.Socket();
      
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 1000);

      socket.connect(port, 'localhost', () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  async identifyWebServices(activePorts) {
    const webServices = [];
    
    for (const port of activePorts) {
      try {
        const serviceInfo = await this.probeWebService(port);
        if (serviceInfo) {
          webServices.push({ port, ...serviceInfo });
        }
      } catch (error) {
        // Not a web service or not responding
        continue;
      }
    }

    return webServices;
  }

  async probeWebService(port) {
    const timeout = parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000;
    
    try {
      // Try HTTP first
      const response = await axios.get(`http://localhost:${port}`, {
        timeout,
        validateStatus: () => true, // Accept any status code
        maxRedirects: 0
      });

      const serviceInfo = {
        protocol: 'http',
        status: response.status,
        headers: response.headers,
        responding: true
      };

      // Try to detect service type and framework
      serviceInfo.framework = this.detectFramework(response.headers, response.data);
      serviceInfo.type = this.detectServiceType(response.headers, response.data);
      
      // Generate potential subdomain name
      serviceInfo.suggestedSubdomain = this.generateSubdomainName(port, serviceInfo);

      return serviceInfo;
    } catch (error) {
      // If HTTP fails, might be HTTPS or non-web service
      return null;
    }
  }

  detectFramework(headers, data) {
    const headerStr = JSON.stringify(headers).toLowerCase();
    const dataStr = (data || '').toLowerCase();

    if (headerStr.includes('express')) return 'express';
    if (headerStr.includes('koa')) return 'koa';
    if (headerStr.includes('fastify')) return 'fastify';
    if (headerStr.includes('next')) return 'nextjs';
    if (headerStr.includes('nuxt')) return 'nuxtjs';
    if (headerStr.includes('gatsby')) return 'gatsby';
    if (headerStr.includes('react')) return 'react';
    if (headerStr.includes('vue')) return 'vue';
    if (headerStr.includes('angular')) return 'angular';
    if (headerStr.includes('svelte')) return 'svelte';
    
    if (dataStr.includes('react')) return 'react';
    if (dataStr.includes('vue')) return 'vue';
    if (dataStr.includes('angular')) return 'angular';
    
    return 'unknown';
  }

  detectServiceType(headers, data) {
    const contentType = headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      return 'api';
    }
    
    if (contentType.includes('text/html')) {
      return 'web';
    }
    
    if (headers['x-powered-by'] || headers['server']) {
      return 'web';
    }
    
    return 'service';
  }

  generateSubdomainName(port, serviceInfo) {
    // Try to detect project name from common patterns
    const possibleNames = [];
    
    // From port number
    possibleNames.push(`app-${port}`);
    
    // From framework
    if (serviceInfo.framework !== 'unknown') {
      possibleNames.push(`${serviceInfo.framework}-${port}`);
    }
    
    // From service type
    possibleNames.push(`${serviceInfo.type}-${port}`);
    
    return possibleNames[0];
  }

  async detectProjectStructures() {
    const candidates = [];
    
    try {
      // Look for common project files in current directory and subdirectories
      const projectFiles = [
        'package.json',
        'Dockerfile',
        'docker-compose.yml',
        'requirements.txt',
        'Gemfile',
        'go.mod',
        'Cargo.toml'
      ];

      for (const file of projectFiles) {
        const projects = await this.findProjectsByFile(file);
        candidates.push(...projects);
      }

      return candidates;
    } catch (error) {
      this.logger.error('Failed to detect project structures:', error);
      return [];
    }
  }

  async findProjectsByFile(filename) {
    try {
      const { stdout } = await execAsync(`find . -name "${filename}" -type f 2>/dev/null | head -20`);
      const files = stdout.trim().split('\n').filter(f => f);
      
      const projects = [];
      
      for (const file of files) {
        try {
          const projectDir = path.dirname(file);
          const projectInfo = await this.analyzeProject(projectDir, filename);
          if (projectInfo) {
            projects.push(projectInfo);
          }
        } catch (error) {
          // Skip this project
          continue;
        }
      }
      
      return projects;
    } catch (error) {
      return [];
    }
  }

  async analyzeProject(projectDir, configFile) {
    const projectPath = path.resolve(projectDir);
    const projectName = path.basename(projectPath);
    
    if (projectName.startsWith('.') || projectName === 'node_modules') {
      return null;
    }

    const project = {
      path: projectPath,
      name: projectName,
      configFile,
      type: this.getProjectType(configFile),
      suggestedSubdomain: this.sanitizeSubdomain(projectName)
    };

    // Try to extract more info from config files
    if (configFile === 'package.json') {
      try {
        const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));
        project.description = packageJson.description;
        project.scripts = packageJson.scripts;
        project.framework = this.detectFrameworkFromPackageJson(packageJson);
        project.defaultPort = this.extractPortFromScripts(packageJson.scripts);
      } catch (error) {
        // Continue without package.json info
      }
    }

    return project;
  }

  getProjectType(configFile) {
    const typeMap = {
      'package.json': 'nodejs',
      'requirements.txt': 'python',
      'Gemfile': 'ruby',
      'go.mod': 'go',
      'Cargo.toml': 'rust',
      'Dockerfile': 'docker',
      'docker-compose.yml': 'docker-compose'
    };
    
    return typeMap[configFile] || 'unknown';
  }

  detectFrameworkFromPackageJson(packageJson) {
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (dependencies['next']) return 'nextjs';
    if (dependencies['nuxt']) return 'nuxtjs';
    if (dependencies['gatsby']) return 'gatsby';
    if (dependencies['react']) return 'react';
    if (dependencies['vue']) return 'vue';
    if (dependencies['@angular/core']) return 'angular';
    if (dependencies['svelte']) return 'svelte';
    if (dependencies['express']) return 'express';
    if (dependencies['koa']) return 'koa';
    if (dependencies['fastify']) return 'fastify';
    
    return 'unknown';
  }

  extractPortFromScripts(scripts) {
    if (!scripts) return null;
    
    const scriptStr = JSON.stringify(scripts);
    const portMatch = scriptStr.match(/(?:port|PORT)[\s=:]+(\d+)/);
    
    return portMatch ? parseInt(portMatch[1]) : null;
  }

  sanitizeSubdomain(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
      .substring(0, 63); // DNS subdomain limit
  }

  async updateRegistry(webServices, projectCandidates) {
    let updatesCount = 0;
    
    // Auto-register discovered web services that aren't already registered
    for (const service of webServices) {
      const existingProject = this.registry.getAllProjects().find(p => p.port === service.port);
      
      if (!existingProject) {
        try {
          await this.registry.registerProject({
            name: `Auto-discovered service on port ${service.port}`,
            subdomain: service.suggestedSubdomain,
            port: service.port,
            type: service.type,
            description: `Auto-discovered ${service.framework} ${service.type}`,
            tags: ['auto-discovered', service.framework, service.type],
            autoStart: false
          });
          updatesCount++;
          this.logger.info(`Auto-registered service: ${service.suggestedSubdomain} on port ${service.port}`);
        } catch (error) {
          this.logger.warn(`Failed to auto-register service on port ${service.port}:`, error.message);
        }
      } else {
        // Update status of existing project
        await this.registry.setProjectStatus(existingProject.subdomain, 'active');
      }
    }
    
    return updatesCount;
  }

  getLastScanResults() {
    return {
      lastScan: this.lastScan,
      results: Array.from(this.scanResults.values())
    };
  }
}

module.exports = DiscoveryService;