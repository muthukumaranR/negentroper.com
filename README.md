# 🧠 Negentroper.com - AI/Computer Scientist Personal Landing Page

A modern, cyberpunk-themed personal landing page featuring neural network animations, interactive particles, and cutting-edge web technologies.

## 🎨 Features

### Visual Effects
- **Neural Network Background**: Animated nodes and connections with gradient effects
- **Matrix Digital Rain**: Falling binary code with authentic terminal aesthetics
- **Glitch Text Effects**: RGB color separation on headers and titles
- **Interactive Particles**: Mouse-reactive particle system with burst effects
- **Floating Geometries**: Animated geometric shapes with parallax movement

### Technology Stack
- **Frontend**: Next.js 15 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom animations + shadcn/ui
- **Database**: PostgreSQL + Drizzle ORM
- **Deployment**: Docker + Nginx + GitHub Actions
- **Performance**: 95+ Lighthouse score target

### AI Integration
- **Content Generation**: Anthropic Claude + OpenAI integration
- **Research Summaries**: AI-powered paper analysis
- **Code Explanation**: Automated technical documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (for production)

### Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Production Deployment
```bash
# Build and run with Docker
docker-compose up -d

# Check health
curl http://localhost:3000/api/health
```

## 🔧 CI/CD Pipeline

The repository includes a complete GitHub Actions workflow:

- **CI**: TypeScript checking, ESLint, Prettier, security scanning
- **CD**: Docker build, zero-downtime deployment, health checks
- **Monitoring**: Automated rollback, Slack notifications
- **Security**: Vulnerability scanning, security headers

## 📊 Performance

- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1
- **Bundle Size**: <100KB initial JavaScript payload
- **Image Optimization**: WebP/AVIF with responsive loading
- **Caching**: Redis + static generation with ISR

## 🛡️ Security

- **Headers**: CSP, HSTS, XSS protection
- **Rate Limiting**: API protection with LRU cache
- **SSL/TLS**: Proper cipher configuration
- **Container Security**: Non-root execution, vulnerability scanning

## 📁 Project Structure

```
negentroper-cms/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   └── page.tsx           # Landing page
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and configurations
├── public/               # Static assets
├── .github/workflows/    # CI/CD pipelines
├── Dockerfile           # Container configuration
└── docker-compose.yml  # Orchestration
```

## 🌟 Key Components

### Landing Page (`app/page.tsx`)
- Hero section with glitch effects
- Feature grid with terminal windows
- Interactive background effects
- Call-to-action sections

### Background Effects
- **Neural Network**: SVG-based animated visualization
- **Matrix Rain**: CSS-animated falling code
- **Particle System**: Canvas-based interactive particles
- **Geometric Shapes**: Floating animated elements

### UI Components
- **Theme Toggle**: Dark/light mode with system detection
- **Navigation**: Responsive mobile-friendly navbar
- **Particles**: Mouse-reactive particle system
- **Health Dashboard**: System monitoring interface

## 📈 Monitoring & Health

### Health Endpoints
- `GET /api/health` - System health with database status
- `GET /admin/health` - Admin dashboard with metrics

### Metrics Tracked
- Application performance
- Database connection status
- Memory and CPU usage
- Error rates and response times

## 🚀 Deployment

### Environment Variables
```bash
# Copy and configure
cp .env.example .env.local

# Required variables
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
```

### GitHub Secrets
Set these in your repository settings:
- `DEPLOY_HOST` - Your server IP/domain
- `DEPLOY_USER` - SSH deployment user
- `DEPLOY_SSH_KEY` - Private SSH key
- `NEXTAUTH_SECRET` - Authentication secret
- `DATABASE_URL` - Production database URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with 🧠 by Claude Code** - Transforming chaos into digital order through negentropic principles.