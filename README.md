# Negentroper CMS

An AI-driven content management system built with Next.js 14, TypeScript, and modern web technologies. This CMS is designed for the negentroper.com website and includes advanced features for content creation, project showcasing, and AI-powered assistance.

## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with OAuth providers (Google, GitHub)
- **AI Integration**: Support for OpenAI and Anthropic APIs
- **Content Management**: Full CRUD operations for writings, pages, and projects
- **Media Management**: Cloudinary integration for image/video handling
- **Theme Support**: Dark/light mode with next-themes
- **State Management**: React Query for server state, Zustand for client state

## 🏗️ Architecture

This project follows the existing negentroper architecture with:

- **Microservices-ready**: API routes structured for easy extraction
- **Event-driven**: Prepared for async messaging patterns
- **AI-first**: Integrated AI capabilities throughout
- **Security by design**: Zero-trust security model

## 📁 Project Structure

```
negentroper-cms/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── writings/          # Writings section
│   ├── projects/          # Projects showcase
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── content/          # Content-specific components
├── lib/                   # Utility libraries
│   ├── database/         # Database schema and connection
│   ├── auth/             # Authentication configuration
│   ├── ai/               # AI service integrations
│   └── utils.ts          # Utility functions
├── providers/             # React context providers
├── services/              # External service integrations
├── types/                 # TypeScript type definitions
└── data/                  # Database migrations and seeds
```

## 🛠️ Installation

1. **Clone and navigate to project**:
   ```bash
   cd negentroper-cms
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Set up the database**:
   ```bash
   # Generate migrations
   npx drizzle-kit generate:pg
   
   # Run migrations
   npx drizzle-kit push:pg
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: NextAuth.js secret key
- `NEXTAUTH_URL`: Your app URL
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: OAuth credentials
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: OAuth credentials
- `OPENAI_API_KEY`: OpenAI API key (optional)
- `ANTHROPIC_API_KEY`: Anthropic API key (optional)
- `CLOUDINARY_*`: Cloudinary credentials for media management

## 🗃️ Database Schema

The database follows the existing negentroper architecture with tables for:

- **Users & Authentication**: OAuth accounts, sessions, preferences
- **Content Management**: Content, revisions, metadata
- **Media Library**: Files, metadata, processing status
- **Projects**: Portfolio items with metadata
- **Taxonomy**: Categories and tags
- **AI Integration**: Prompts, responses, usage tracking

## 🤖 AI Integration

The CMS includes built-in AI capabilities:

- Content generation assistance
- Automatic summarization
- SEO optimization suggestions
- Image alt-text generation

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm run typecheck`: Run TypeScript checks

### Database Operations

- `npx drizzle-kit generate:pg`: Generate migrations
- `npx drizzle-kit push:pg`: Push schema to database
- `npx drizzle-kit studio`: Open Drizzle Studio

## 🚀 Deployment

This project is deployment-ready for:

- **Vercel**: Optimized for Vercel deployment
- **Docker**: Containerization support
- **Kubernetes**: Cloud-native deployment

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Write tests for new features
3. Update documentation as needed
4. Use the provided linting and formatting tools

## 📄 License

This project is part of the negentroper ecosystem and follows the same licensing terms.

## 🙏 Acknowledgments

Built with the existing negentroper architecture and design patterns, leveraging:

- Claude Flow coordination system
- Existing database schema design
- Proven security patterns
- Performance optimization strategies