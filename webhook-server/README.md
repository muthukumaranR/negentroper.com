# GitHub Webhook Deployment Server

A lightweight Node.js server that automatically deploys your negentroper.com content when changes are pushed to the main branch of your GitHub repository.

## Features

- 🔒 **Secure webhook validation** using GitHub's signature verification
- 🚀 **Automatic deployment** on push to main branch
- 📝 **Markdown processing** converts `.md` files to static HTML
- 🛡️ **Security headers** with Helmet.js
- 📊 **Health monitoring** with status endpoints
- 🔄 **Auto-restart** capability for zero-downtime deployments
- 📁 **File-based routing** for simple content serving

## Quick Setup

### 1. Install Dependencies

```bash
cd webhook-server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Start the Server

```bash
npm start
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `GITHUB_WEBHOOK_SECRET` | GitHub webhook secret | Required for security |
| `REPO_PATH` | Path to git repository | Current directory |
| `CONTENT_DIR` | Markdown content directory | `./content` |
| `PUBLIC_DIR` | Static files directory | `./public` |
| `AUTO_RESTART` | Enable auto-restart on deployment | `true` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `localhost:3000` |

### GitHub Webhook Setup

1. Go to your repository settings on GitHub
2. Navigate to "Webhooks" and click "Add webhook"
3. Set the payload URL to: `https://your-domain.com/webhook`
4. Set content type to: `application/json`
5. Generate a secure secret and add it to your `.env` file
6. Select "Just the push event"
7. Ensure the webhook is active

## API Endpoints

### Webhook Endpoint
- **POST** `/webhook` - Receives GitHub webhook events
- Validates signature and processes push events to main branch

### Health Check
- **GET** `/health` - Returns server status
- Response: `{ "status": "healthy", "timestamp": "...", "uptime": 123 }`

### Manual Deployment
- **POST** `/deploy` - Manually trigger deployment
- Useful for testing or forced deployments

### Content Serving
- **GET** `/*` - Serves static files and processed markdown
- Automatically converts markdown to HTML
- Supports file-based routing

## Deployment Process

When a webhook is received, the server:

1. **Validates** the GitHub signature for security
2. **Pulls** the latest changes from the main branch
3. **Processes** markdown files in the content directory
4. **Generates** static HTML pages with proper styling
5. **Restarts** the server (if AUTO_RESTART is enabled)
6. **Logs** the entire process for monitoring

## File Structure

```
webhook-server/
├── server.js          # Main server application
├── deploy.sh          # Deployment script
├── package.json       # Node.js dependencies
├── .env.example       # Environment configuration template
├── README.md          # This file
└── logs/              # Generated log files
```

## Content Processing

The server automatically processes markdown files:

- Parses frontmatter (YAML-like metadata)
- Converts markdown to HTML using marked.js
- Generates complete HTML pages with proper styling
- Supports nested directory structures

### Markdown Format

```markdown
---
title: Page Title
description: Page description for meta tags
---

# Your Content Here

This will be converted to a complete HTML page.
```

## Security Features

- **Webhook signature verification** prevents unauthorized deployments
- **CORS protection** limits cross-origin requests
- **Security headers** via Helmet.js
- **Input validation** on all endpoints
- **Error handling** prevents information leakage

## Monitoring and Logs

- All operations are logged with timestamps
- Health check endpoint for monitoring systems
- Process information available via `/health`
- Deployment logs stored in `deploy.log`

## Production Deployment

### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "webhook-server"

# Set up auto-restart on system reboot
pm2 startup
pm2 save
```

### Using systemd

Create a systemd service file:

```ini
[Unit]
Description=GitHub Webhook Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/webhook-server
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### Common Issues

1. **Webhook signature validation fails**
   - Ensure `GITHUB_WEBHOOK_SECRET` matches GitHub settings
   - Check that the secret is properly URL-encoded

2. **Server won't start**
   - Check if port is already in use
   - Verify all environment variables are set
   - Check file permissions on deploy.sh

3. **Deployment fails**
   - Ensure git repository is properly configured
   - Check write permissions for content and public directories
   - Verify network connectivity to GitHub

### Debug Mode

Set `LOG_LEVEL=debug` in your `.env` file for detailed logging.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.