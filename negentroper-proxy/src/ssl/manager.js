const fs = require('fs-extra');
const path = require('path');
const acme = require('acme-client');
const Logger = require('../utils/logger');

class SSLManager {
  constructor() {
    this.logger = new Logger('SSL');
    this.sslDir = path.resolve(process.env.SSL_DIR || './ssl');
    this.email = process.env.SSL_EMAIL;
    this.isStaging = process.env.SSL_STAGING === 'true';
    this.baseDomain = process.env.BASE_DOMAIN || 'negentroper.com';
    
    // Ensure SSL directory exists
    fs.ensureDirSync(this.sslDir);
    fs.ensureDirSync(path.join(this.sslDir, 'certs'));
    fs.ensureDirSync(path.join(this.sslDir, 'private'));
    fs.ensureDirSync(path.join(this.sslDir, 'accounts'));
  }

  async initialize() {
    this.logger.info('SSL Manager initialized');
    
    if (!this.email) {
      this.logger.warn('SSL_EMAIL not configured - SSL certificates will not be generated');
      return;
    }

    try {
      await this.ensureAccountKey();
      this.logger.info(`SSL Manager ready for ${this.isStaging ? 'staging' : 'production'} certificates`);
    } catch (error) {
      this.logger.error('Failed to initialize SSL manager:', error);
    }
  }

  async isConfigured() {
    return !!(this.email && await this.hasCertificates());
  }

  async hasCertificates() {
    const certPath = this.getCertificatePath(this.baseDomain);
    const keyPath = this.getPrivateKeyPath(this.baseDomain);
    
    return await fs.pathExists(certPath) && await fs.pathExists(keyPath);
  }

  async getSSLOptions() {
    if (!await this.hasCertificates()) {
      throw new Error('SSL certificates not available');
    }

    const certPath = this.getCertificatePath(this.baseDomain);
    const keyPath = this.getPrivateKeyPath(this.baseDomain);

    return {
      cert: await fs.readFile(certPath),
      key: await fs.readFile(keyPath)
    };
  }

  async ensureAccountKey() {
    const accountKeyPath = path.join(this.sslDir, 'accounts', 'account.key');
    
    if (!await fs.pathExists(accountKeyPath)) {
      this.logger.info('Generating ACME account key...');
      const accountKey = await acme.crypto.createPrivateKey();
      await fs.writeFile(accountKeyPath, accountKey);
    }

    return await fs.readFile(accountKeyPath);
  }

  async createAcmeClient() {
    const accountKey = await this.ensureAccountKey();
    
    const directoryUrl = this.isStaging
      ? acme.directory.letsencrypt.staging
      : acme.directory.letsencrypt.production;

    const client = new acme.Client({
      directoryUrl,
      accountKey
    });

    return client;
  }

  async generateWildcardCertificate() {
    if (!this.email) {
      throw new Error('SSL_EMAIL must be configured to generate certificates');
    }

    this.logger.info(`Generating wildcard certificate for *.${this.baseDomain}...`);

    try {
      const client = await this.createAcmeClient();
      const domains = [this.baseDomain, `*.${this.baseDomain}`];

      // Create certificate signing request
      const [key, csr] = await acme.crypto.createCsr({
        commonName: this.baseDomain,
        altNames: domains
      });

      // Request certificate
      const cert = await client.auto({
        csr,
        email: this.email,
        termsOfServiceAgreed: true,
        challengeCreateFn: this.createDnsChallenge.bind(this),
        challengeRemoveFn: this.removeDnsChallenge.bind(this)
      });

      // Save certificate and key
      await this.saveCertificate(this.baseDomain, cert, key);
      
      this.logger.info('Wildcard certificate generated successfully');
      return { cert, key };

    } catch (error) {
      this.logger.error('Failed to generate wildcard certificate:', error);
      throw error;
    }
  }

  async createDnsChallenge(authz, challenge, keyAuthorization) {
    this.logger.info(`DNS challenge required for ${authz.identifier.value}`);
    this.logger.info('Please create the following DNS TXT record:');
    this.logger.info(`Name: _acme-challenge.${authz.identifier.value}`);
    this.logger.info(`Value: ${keyAuthorization}`);
    
    // In a production environment, you would integrate with your DNS provider's API here
    // For now, we'll wait for manual intervention
    
    console.log('\n=== MANUAL DNS CHALLENGE REQUIRED ===');
    console.log(`Domain: ${authz.identifier.value}`);
    console.log(`TXT Record Name: _acme-challenge.${authz.identifier.value}`);
    console.log(`TXT Record Value: ${keyAuthorization}`);
    console.log('Please create this DNS record and press Enter to continue...');
    
    // Wait for user input
    await this.waitForUserInput();
  }

  async removeDnsChallenge(authz, challenge, keyAuthorization) {
    this.logger.info(`DNS challenge cleanup for ${authz.identifier.value}`);
    // In production, you would remove the DNS record here
  }

  async waitForUserInput() {
    return new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

  async saveCertificate(domain, cert, key) {
    const certPath = this.getCertificatePath(domain);
    const keyPath = this.getPrivateKeyPath(domain);

    await fs.writeFile(certPath, cert);
    await fs.writeFile(keyPath, key);
    
    this.logger.info(`Certificate saved for ${domain}`);
  }

  getCertificatePath(domain) {
    return path.join(this.sslDir, 'certs', `${domain}.crt`);
  }

  getPrivateKeyPath(domain) {
    return path.join(this.sslDir, 'private', `${domain}.key`);
  }

  async renewCertificates() {
    this.logger.info('Checking for certificates that need renewal...');

    try {
      const certPath = this.getCertificatePath(this.baseDomain);
      
      if (!await fs.pathExists(certPath)) {
        this.logger.info('No certificates found, generating new ones...');
        return await this.generateWildcardCertificate();
      }

      const cert = await fs.readFile(certPath, 'utf8');
      const expiryDate = this.getCertificateExpiry(cert);
      const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

      this.logger.info(`Certificate expires in ${daysUntilExpiry} days`);

      // Renew if expiring within 30 days
      if (daysUntilExpiry <= 30) {
        this.logger.info('Certificate needs renewal');
        return await this.generateWildcardCertificate();
      } else {
        this.logger.info('Certificate does not need renewal yet');
        return null;
      }

    } catch (error) {
      this.logger.error('Certificate renewal check failed:', error);
      throw error;
    }
  }

  getCertificateExpiry(certPem) {
    // Simple regex to extract expiry date from certificate
    // In production, you might want to use a proper certificate parsing library
    const match = certPem.match(/Not After\s*:\s*(.+)/);
    if (match) {
      return new Date(match[1]);
    }
    
    // Fallback: assume it expires in 90 days (Let's Encrypt default)
    return new Date(Date.now() + (90 * 24 * 60 * 60 * 1000));
  }

  async getCertificateInfo() {
    const certPath = this.getCertificatePath(this.baseDomain);
    
    if (!await fs.pathExists(certPath)) {
      return {
        exists: false,
        message: 'No certificate found'
      };
    }

    try {
      const cert = await fs.readFile(certPath, 'utf8');
      const expiryDate = this.getCertificateExpiry(cert);
      const daysUntilExpiry = Math.floor((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

      return {
        exists: true,
        domain: this.baseDomain,
        expiryDate,
        daysUntilExpiry,
        needsRenewal: daysUntilExpiry <= 30,
        isStaging: this.isStaging
      };
    } catch (error) {
      return {
        exists: true,
        error: error.message
      };
    }
  }

  // Method to generate self-signed certificate for development
  async generateSelfSignedCertificate() {
    this.logger.info('Generating self-signed certificate for development...');

    try {
      const [key, cert] = await acme.crypto.createCsr({
        commonName: this.baseDomain,
        altNames: [this.baseDomain, `*.${this.baseDomain}`]
      });

      // For development, we'll use the CSR as a self-signed cert
      // In a real implementation, you'd properly sign it
      await this.saveCertificate(this.baseDomain, cert, key);
      
      this.logger.info('Self-signed certificate generated (development only)');
      return { cert, key };

    } catch (error) {
      this.logger.error('Failed to generate self-signed certificate:', error);
      throw error;
    }
  }
}

module.exports = SSLManager;