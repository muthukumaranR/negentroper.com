const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { simpleGit } = require('simple-git');
const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET;
const REPO_PATH = process.env.REPO_PATH || process.cwd();
const CONTENT_DIR = process.env.CONTENT_DIR || './content';
const PUBLIC_DIR = process.env.PUBLIC_DIR || './public';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Body parser for GitHub webhooks
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());
app.use(express.static(PUBLIC_DIR));

// Git instance
const git = simpleGit(REPO_PATH);

// Logging utility
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
};

// Verify GitHub webhook signature
const verifySignature = (payload, signature) => {
  if (!WEBHOOK_SECRET) {
    log('warn', 'No webhook secret configured - skipping signature verification');
    return true;
  }
  
  const computedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  const providedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature, 'hex'),
    Buffer.from(providedSignature, 'hex')
  );
};

// Deploy function
const deploy = async () => {
  try {
    log('info', 'Starting deployment...');
    
    // Pull latest changes
    const pullResult = await git.pull('origin', 'main');
    log('info', 'Git pull completed', { files: pullResult.files });
    
    // Process markdown files if needed
    await processMarkdownFiles();
    
    // Restart application (if using PM2 or similar)
    if (process.env.AUTO_RESTART === 'true') {
      const { exec } = require('child_process');
      exec('npm run restart', (error, stdout, stderr) => {
        if (error) {
          log('error', 'Restart failed', { error: error.message });
        } else {
          log('info', 'Application restarted successfully');
        }
      });
    }
    
    log('info', 'Deployment completed successfully');
    return { success: true, message: 'Deployment completed' };
    
  } catch (error) {
    log('error', 'Deployment failed', { error: error.message });
    throw error;
  }
};

// Process markdown files for static serving
const processMarkdownFiles = async () => {
  try {
    const contentExists = await fs.access(CONTENT_DIR).then(() => true).catch(() => false);
    if (!contentExists) {
      log('info', 'Content directory not found, skipping markdown processing');
      return;
    }
    
    const files = await fs.readdir(CONTENT_DIR, { recursive: true });
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    log('info', `Processing ${markdownFiles.length} markdown files`);
    
    for (const file of markdownFiles) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Parse frontmatter and content
      const { frontmatter, body } = parseFrontmatter(content);
      const html = marked(body);
      
      // Create output directory structure
      const outputPath = path.join(PUBLIC_DIR, file.replace('.md', '.html'));
      const outputDir = path.dirname(outputPath);
      
      await fs.mkdir(outputDir, { recursive: true });
      
      // Generate simple HTML page
      const htmlPage = generateHtmlPage(frontmatter, html);
      await fs.writeFile(outputPath, htmlPage);
    }
    
  } catch (error) {
    log('error', 'Failed to process markdown files', { error: error.message });
  }
};

// Simple frontmatter parser
const parseFrontmatter = (content) => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (match) {
    const frontmatterText = match[1];
    const body = match[2];
    
    // Simple YAML-like parsing
    const frontmatter = {};
    frontmatterText.split('\n').forEach(line => {
      const [key, ...value] = line.split(':');
      if (key && value.length) {
        frontmatter[key.trim()] = value.join(':').trim();
      }
    });
    
    return { frontmatter, body };
  }
  
  return { frontmatter: {}, body: content };
};

// Generate HTML page
const generateHtmlPage = (frontmatter, content) => {
  const title = frontmatter.title || 'Negentroper';
  const description = frontmatter.description || '';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        h1, h2, h3 { color: #2c3e50; }
        code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 1rem; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #3498db; margin: 0; padding-left: 1rem; }
        a { color: #3498db; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    ${content}
</body>
</html>`;
};

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const signature = req.get('X-Hub-Signature-256');
    const event = req.get('X-GitHub-Event');
    
    // Verify signature
    if (!verifySignature(req.body, signature)) {
      log('warn', 'Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const payload = JSON.parse(req.body.toString());
    
    log('info', 'Received GitHub webhook', { 
      event, 
      ref: payload.ref, 
      repository: payload.repository?.name 
    });
    
    // Only process push events to main branch
    if (event === 'push' && payload.ref === 'refs/heads/main') {
      const result = await deploy();
      res.json(result);
    } else {
      log('info', 'Webhook ignored - not a push to main branch');
      res.json({ message: 'Event ignored' });
    }
    
  } catch (error) {
    log('error', 'Webhook processing failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Manual deploy endpoint (for testing)
app.post('/deploy', async (req, res) => {
  try {
    const result = await deploy();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// File-based routing for content
app.get('/*', async (req, res) => {
  try {
    const requestPath = req.path === '/' ? '/index.html' : req.path;
    const filePath = path.join(PUBLIC_DIR, requestPath);
    
    // Check if file exists
    try {
      await fs.access(filePath);
      res.sendFile(path.resolve(filePath));
    } catch {
      // Try with .html extension
      const htmlPath = filePath + '.html';
      try {
        await fs.access(htmlPath);
        res.sendFile(path.resolve(htmlPath));
      } catch {
        res.status(404).json({ error: 'Page not found' });
      }
    }
    
  } catch (error) {
    log('error', 'Error serving file', { error: error.message, path: req.path });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  log('info', `GitHub webhook server running on port ${PORT}`);
  log('info', 'Configuration', {
    repoPath: REPO_PATH,
    contentDir: CONTENT_DIR,
    publicDir: PUBLIC_DIR,
    webhookSecretConfigured: !!WEBHOOK_SECRET
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('info', 'Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('info', 'Received SIGINT, shutting down gracefully');
  process.exit(0);
});