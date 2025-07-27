const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const Logger = require('../utils/logger');

class ProjectRegistry {
  constructor() {
    this.logger = new Logger('Registry');
    this.registryFile = path.resolve(process.env.REGISTRY_FILE || './data/projects.json');
    this.projects = new Map();
    this.watcher = null;
    
    // Ensure data directory exists
    fs.ensureDirSync(path.dirname(this.registryFile));
  }

  async initialize() {
    await this.loadProjects();
    
    if (process.env.REGISTRY_WATCH === 'true') {
      this.setupFileWatcher();
    }
    
    this.logger.info(`Registry initialized with ${this.projects.size} projects`);
  }

  async loadProjects() {
    try {
      if (await fs.pathExists(this.registryFile)) {
        const data = await fs.readJson(this.registryFile);
        
        // Convert array to Map for better performance
        if (Array.isArray(data)) {
          data.forEach(project => {
            this.projects.set(project.subdomain, {
              ...project,
              lastUpdate: new Date(project.lastUpdate || Date.now()),
              status: project.status || 'unknown'
            });
          });
        } else {
          this.logger.warn('Invalid registry format, creating new registry');
          await this.saveProjects();
        }
      } else {
        this.logger.info('No existing registry found, creating new one');
        await this.saveProjects();
      }
    } catch (error) {
      this.logger.error('Failed to load projects:', error);
      throw error;
    }
  }

  async saveProjects() {
    try {
      const projectsArray = Array.from(this.projects.values());
      
      // Create backup if enabled
      if (process.env.REGISTRY_BACKUP === 'true' && await fs.pathExists(this.registryFile)) {
        const backupFile = `${this.registryFile}.backup.${Date.now()}`;
        await fs.copy(this.registryFile, backupFile);
      }
      
      await fs.writeJson(this.registryFile, projectsArray, { spaces: 2 });
      this.logger.debug(`Saved ${projectsArray.length} projects to registry`);
    } catch (error) {
      this.logger.error('Failed to save projects:', error);
      throw error;
    }
  }

  setupFileWatcher() {
    this.watcher = chokidar.watch(this.registryFile);
    
    this.watcher.on('change', async () => {
      this.logger.info('Registry file changed, reloading...');
      try {
        await this.loadProjects();
      } catch (error) {
        this.logger.error('Failed to reload registry:', error);
      }
    });
  }

  async registerProject(projectData) {
    const {
      name,
      subdomain,
      port,
      type = 'web',
      description = '',
      healthCheckPath = '/',
      ssl = false,
      autoStart = false,
      tags = []
    } = projectData;

    // Validation
    if (!name || !subdomain || !port) {
      throw new Error('Missing required fields: name, subdomain, port');
    }

    if (this.projects.has(subdomain)) {
      throw new Error(`Subdomain '${subdomain}' is already registered`);
    }

    const project = {
      name,
      subdomain,
      port: parseInt(port),
      type,
      description,
      healthCheckPath,
      ssl,
      autoStart,
      tags,
      status: 'registered',
      registeredAt: new Date(),
      lastUpdate: new Date()
    };

    this.projects.set(subdomain, project);
    await this.saveProjects();
    
    this.logger.info(`Registered project: ${name} at ${subdomain}.${process.env.BASE_DOMAIN}:${port}`);
    return project;
  }

  async unregisterProject(subdomain) {
    if (!this.projects.has(subdomain)) {
      throw new Error(`Project with subdomain '${subdomain}' not found`);
    }

    const project = this.projects.get(subdomain);
    this.projects.delete(subdomain);
    await this.saveProjects();
    
    this.logger.info(`Unregistered project: ${project.name}`);
    return project;
  }

  async updateProject(subdomain, updates) {
    if (!this.projects.has(subdomain)) {
      throw new Error(`Project with subdomain '${subdomain}' not found`);
    }

    const project = this.projects.get(subdomain);
    const updatedProject = {
      ...project,
      ...updates,
      lastUpdate: new Date()
    };

    this.projects.set(subdomain, updatedProject);
    await this.saveProjects();
    
    this.logger.info(`Updated project: ${project.name}`);
    return updatedProject;
  }

  getProject(subdomain) {
    return this.projects.get(subdomain);
  }

  getAllProjects() {
    return Array.from(this.projects.values());
  }

  getActiveProjects() {
    return Array.from(this.projects.values()).filter(p => 
      p.status === 'active' || p.status === 'healthy'
    );
  }

  getProjectsByType(type) {
    return Array.from(this.projects.values()).filter(p => p.type === type);
  }

  getProjectsByTag(tag) {
    return Array.from(this.projects.values()).filter(p => 
      p.tags && p.tags.includes(tag)
    );
  }

  async setProjectStatus(subdomain, status) {
    if (!this.projects.has(subdomain)) {
      return false;
    }

    const project = this.projects.get(subdomain);
    project.status = status;
    project.lastUpdate = new Date();
    
    this.projects.set(subdomain, project);
    await this.saveProjects();
    
    return true;
  }

  isPortInUse(port) {
    return Array.from(this.projects.values()).some(p => p.port === parseInt(port));
  }

  getNextAvailablePort(startPort = 3001) {
    const usedPorts = new Set(Array.from(this.projects.values()).map(p => p.port));
    
    for (let port = startPort; port <= 9000; port++) {
      if (!usedPorts.has(port)) {
        return port;
      }
    }
    
    return null;
  }

  getStats() {
    const projects = Array.from(this.projects.values());
    const statusCounts = {};
    const typeCounts = {};
    
    projects.forEach(project => {
      statusCounts[project.status] = (statusCounts[project.status] || 0) + 1;
      typeCounts[project.type] = (typeCounts[project.type] || 0) + 1;
    });

    return {
      total: projects.length,
      statusCounts,
      typeCounts,
      lastUpdated: new Date()
    };
  }

  destroy() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}

module.exports = ProjectRegistry;