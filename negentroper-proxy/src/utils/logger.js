const winston = require('winston');
const path = require('path');
const fs = require('fs-extra');

class Logger {
  constructor(component = 'App') {
    this.component = component;
    
    if (!Logger.instance) {
      Logger.instance = this.createLogger();
    }
    
    this.logger = Logger.instance;
  }

  createLogger() {
    // Ensure logs directory exists
    const logDir = path.dirname(process.env.LOG_FILE || './logs/proxy.log');
    fs.ensureDirSync(logDir);

    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, component, ...meta }) => {
        const comp = component ? `[${component}]` : '';
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level} ${comp} ${message} ${metaStr}`;
      })
    );

    const logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'negentroper-proxy' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: consoleFormat
        }),
        
        // File transport
        new winston.transports.File({
          filename: process.env.LOG_FILE || './logs/proxy.log',
          maxsize: this.parseSize(process.env.LOG_MAX_SIZE || '10m'),
          maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
          tailable: true
        })
      ]
    });

    // Add error file for errors only
    logger.add(new winston.transports.File({
      filename: path.join(path.dirname(process.env.LOG_FILE || './logs/proxy.log'), 'error.log'),
      level: 'error',
      maxsize: this.parseSize(process.env.LOG_MAX_SIZE || '10m'),
      maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
      tailable: true
    }));

    return logger;
  }

  parseSize(sizeStr) {
    const units = {
      'b': 1,
      'k': 1024,
      'm': 1024 * 1024,
      'g': 1024 * 1024 * 1024
    };

    const match = sizeStr.toLowerCase().match(/^(\d+)([bkmg]?)$/);
    if (!match) return 10 * 1024 * 1024; // Default 10MB

    const size = parseInt(match[1]);
    const unit = match[2] || 'b';
    
    return size * units[unit];
  }

  info(message, meta = {}) {
    this.logger.info(message, { component: this.component, ...meta });
  }

  error(message, meta = {}) {
    this.logger.error(message, { component: this.component, ...meta });
  }

  warn(message, meta = {}) {
    this.logger.warn(message, { component: this.component, ...meta });
  }

  debug(message, meta = {}) {
    this.logger.debug(message, { component: this.component, ...meta });
  }

  verbose(message, meta = {}) {
    this.logger.verbose(message, { component: this.component, ...meta });
  }

  silly(message, meta = {}) {
    this.logger.silly(message, { component: this.component, ...meta });
  }
}

module.exports = Logger;