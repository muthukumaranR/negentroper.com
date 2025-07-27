# Negentroper Proxy System

A powerful subdomain proxy system for routing local projects under `*.negentroper.com` with auto-discovery, SSL termination, health checks, and easy project management.

## Features

- **Reverse Proxy**: Route subdomains to different local ports
- **Auto-Discovery**: Automatically detect running services on local ports
- **SSL Termination**: Let's Encrypt wildcard certificates with auto-renewal
- **Health Checks**: Monitor service health with detailed diagnostics
- **Project Registry**: Simple JSON-based project configuration
- **REST API**: Full API for project management and monitoring
- **CLI Tools**: Easy command-line interface for administration
- **Real-time Monitoring**: Live health and performance metrics

## Quick Start

### 1. Installation

```bash
cd negentroper-proxy
npm install
```

### 2. Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit configuration
nano .env
```

### 3. Setup

```bash
# Run interactive setup wizard
./bin/negentroper-proxy setup

# Or start directly
npm start
```

### 4. DNS Configuration

Point your DNS to this server:
```
*.negentroper.com -> YOUR_SERVER_IP
negentroper.com -> YOUR_SERVER_IP
```

## Usage

### CLI Commands

```bash
# Start the proxy server
./bin/negentroper-proxy start

# Check system status
./bin/negentroper-proxy status

# List all projects
./bin/negentroper-proxy projects list

# Add a new project
./bin/negentroper-proxy projects add "My App" myapp 3001 --type web

# Check project health
./bin/negentroper-proxy projects health myapp

# Auto-discover running services
./bin/negentroper-proxy discovery scan

# Generate SSL certificates
./bin/negentroper-proxy ssl generate
```

### API Endpoints

#### Public Endpoints

- `GET /api/health` - System health status
- `GET /api/projects` - List all projects
- `GET /api/projects/:subdomain` - Get specific project
- `GET /api/projects/:subdomain/health` - Check project health
- `GET /api/discovery/scan` - Trigger discovery scan

#### Admin Endpoints (require API key)

- `POST /api/admin/projects` - Register new project
- `PUT /api/admin/projects/:subdomain` - Update project
- `DELETE /api/admin/projects/:subdomain` - Remove project
- `GET /api/admin/health/check` - Force health check
- `GET /api/admin/stats` - System statistics

### Project Registration

#### Via CLI
```bash
./bin/negentroper-proxy projects add "My API" api 3002 \
  --type api \
  --description "REST API server" \
  --health-path /health \
  --ssl \
  --tags "api,production"
```

#### Via API
```bash
curl -X POST http://localhost:3000/api/admin/projects \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My API",
    "subdomain": "api",
    "port": 3002,
    "type": "api",
    "description": "REST API server",
    "healthCheckPath": "/health",
    "ssl": true,
    "tags": ["api", "production"]
  }'
```

#### Manual Registry
Edit `data/projects.json`:
```json
[
  {
    "name": "My App",
    "subdomain": "myapp",
    "port": 3001,
    "type": "web",
    "description": "My awesome application",
    "healthCheckPath": "/",
    "ssl": true,
    "autoStart": true,
    "tags": ["web", "production"]
  }
]
```

## Configuration

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development
PORT=80
HTTPS_PORT=443
ADMIN_PORT=3000

# Domain Configuration
BASE_DOMAIN=negentroper.com
WILDCARD_DOMAIN=*.negentroper.com

# SSL Configuration
SSL_EMAIL=admin@negentroper.com
SSL_DIR=./ssl
SSL_AUTO_RENEW=true
SSL_STAGING=true

# Discovery Configuration
AUTO_DISCOVERY=true
DISCOVERY_INTERVAL=30000
PORT_RANGE_START=3001
PORT_RANGE_END=9000

# Health Check Configuration
HEALTH_CHECK_INTERVAL=60000
HEALTH_CHECK_TIMEOUT=5000
HEALTH_CHECK_RETRIES=3

# Security Configuration
ADMIN_API_KEY=your-secret-admin-key-here
ENABLE_CORS=true
ENABLE_HELMET=true
```

## Auto-Discovery

The system automatically scans for running services and can auto-register them:

1. **Port Scanning**: Checks ports 3001-9000 for active services
2. **Web Service Detection**: Identifies HTTP services
3. **Framework Detection**: Recognizes Express, Next.js, React, etc.
4. **Auto-Registration**: Optionally registers discovered services

### Discovery Process

1. Scan port range for active services
2. Probe services to identify web servers
3. Detect framework and service type
4. Generate suggested subdomain names
5. Register services (if auto-registration enabled)

## SSL Certificates

### Let's Encrypt Integration

```bash
# Generate wildcard certificate
./bin/negentroper-proxy ssl generate

# Check certificate status
./bin/negentroper-proxy ssl info
```

### Manual Certificate Setup

1. Generate certificates using certbot or similar
2. Place certificates in `ssl/certs/` directory
3. Update SSL configuration in `.env`

### Development Certificates

For development, you can use self-signed certificates:
```bash
openssl req -x509 -newkey rsa:4096 -keyout ssl/private/negentroper.com.key \
  -out ssl/certs/negentroper.com.crt -days 365 -nodes \
  -subj "/CN=*.negentroper.com"
```

## Health Monitoring

### Health Check Features

- **Automatic Checks**: Regular health monitoring
- **Custom Health Paths**: Configure health endpoints per project
- **Retry Logic**: Intelligent retry with exponential backoff
- **Health History**: Track health over time
- **Uptime Statistics**: Calculate uptime percentages
- **Diagnostics**: Detailed health diagnostics and recommendations

### Health Check Configuration

```json
{
  "name": "My API",
  "subdomain": "api",
  "port": 3002,
  "healthCheckPath": "/api/health",
  "healthCheckTimeout": 5000,
  "healthCheckRetries": 3
}
```

## Deployment

### Production Deployment

1. **Server Setup**:
   ```bash
   # Create proxy user
   sudo useradd -r -s /bin/false proxy
   
   # Install to /opt
   sudo cp -r negentroper-proxy /opt/
   sudo chown -R proxy:proxy /opt/negentroper-proxy
   ```

2. **Systemd Service**:
   ```bash
   # Copy service file
   sudo cp config/systemd.service.example /etc/systemd/system/negentroper-proxy.service
   
   # Enable and start
   sudo systemctl enable negentroper-proxy
   sudo systemctl start negentroper-proxy
   ```

3. **Nginx Frontend** (optional):
   ```bash
   # Copy nginx config
   sudo cp config/nginx.conf.example /etc/nginx/sites-available/negentroper-proxy
   sudo ln -s /etc/nginx/sites-available/negentroper-proxy /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 80 443 3000
USER node
CMD ["npm", "start"]
```

## Security

### Security Features

- **API Key Authentication**: Secure admin endpoints
- **CORS Protection**: Configurable CORS policies
- **Security Headers**: Helmet.js integration
- **Rate Limiting**: Built-in rate limiting
- **SSL/TLS**: Strong SSL configuration
- **Input Validation**: Request validation

### Security Configuration

```bash
# Generate secure API key
ADMIN_API_KEY=$(openssl rand -hex 32)

# Enable security features
ENABLE_CORS=true
ENABLE_HELMET=true
RATE_LIMIT=100
```

## Monitoring and Logging

### Logging Configuration

```bash
LOG_LEVEL=info
LOG_FILE=./logs/proxy.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5
```

### Monitoring Endpoints

- `/api/health` - System health
- `/api/admin/stats` - Detailed statistics
- `/api/admin/health/diagnostics/:project` - Project diagnostics

## Troubleshooting

### Common Issues

1. **Port Already in Use**:
   ```bash
   # Check what's using the port
   lsof -i :80
   sudo netstat -tulpn | grep :80
   ```

2. **SSL Certificate Issues**:
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/certs/negentroper.com.crt -text -noout
   ```

3. **Discovery Not Working**:
   ```bash
   # Manual discovery scan
   ./bin/negentroper-proxy discovery scan
   
   # Check logs
   tail -f logs/proxy.log
   ```

4. **Health Checks Failing**:
   ```bash
   # Check specific project health
   ./bin/negentroper-proxy projects health myapp
   
   # Get detailed diagnostics
   curl http://localhost:3000/api/admin/health/diagnostics/myapp
   ```

### Debug Mode

```bash
# Enable verbose logging
LOG_LEVEL=debug ./bin/negentroper-proxy start

# Use CLI verbose mode
./bin/negentroper-proxy --verbose projects list
```

## Development

### Project Structure

```
negentroper-proxy/
├── src/
│   ├── index.js              # Main server
│   ├── proxy/manager.js      # Proxy management
│   ├── registry/registry.js  # Project registry
│   ├── discovery/scanner.js  # Auto-discovery
│   ├── health/checker.js     # Health monitoring
│   ├── ssl/manager.js        # SSL management
│   ├── api/router.js         # REST API
│   └── utils/logger.js       # Logging utility
├── bin/negentroper-proxy     # CLI tool
├── config/                   # Configuration examples
├── data/                     # Project registry
├── ssl/                      # SSL certificates
└── logs/                     # Log files
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Testing

```bash
# Install dev dependencies
npm install

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## License

MIT License - see LICENSE file for details.

## Support

- GitHub Issues: [Report bugs and request features](https://github.com/negentroper/proxy/issues)
- Documentation: [Full documentation](https://docs.negentroper.com/proxy)
- Examples: See `examples/` directory