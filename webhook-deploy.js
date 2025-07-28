#!/usr/bin/env node

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const path = require('path');

// Configuration
const PORT = 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
const DEPLOY_SCRIPT = path.join(__dirname, 'deploy-local.sh');

// Create server
const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      const signature = req.headers['x-hub-signature-256'];
      const payload = JSON.parse(body);
      
      // Verify webhook signature (optional but recommended)
      const expectedSignature = 'sha256=' + crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature && WEBHOOK_SECRET !== 'your-webhook-secret') {
        console.log('❌ Invalid webhook signature');
        res.writeHead(401);
        res.end('Unauthorized');
        return;
      }
      
      // Check if it's a push to main branch
      if (payload.ref === 'refs/heads/main') {
        console.log('🔔 Received push to main branch');
        console.log(`📝 Commit: ${payload.head_commit.message}`);
        
        // Execute deployment script
        exec(DEPLOY_SCRIPT, (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Deployment failed:', error);
            console.error(stderr);
          } else {
            console.log('✅ Deployment output:');
            console.log(stdout);
          }
        });
        
        res.writeHead(200);
        res.end('Deployment triggered');
      } else {
        res.writeHead(200);
        res.end('Not a main branch push');
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end('Webhook server is running');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Webhook server listening on port ${PORT}`);
  console.log(`📌 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🔒 Set WEBHOOK_SECRET environment variable for security`);
});