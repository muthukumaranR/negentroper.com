# Negentroper CMS Documentation

## Overview

The Negentroper CMS is a modern, markdown-based content management system designed for creative writers and developers. It features automatic timeline generation, rich metadata support, and seamless GitHub Pages integration.

## Table of Contents

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Content Types](#content-types)
4. [CLI Usage](#cli-usage)
5. [Admin Interface](#admin-interface)
6. [API Reference](#api-reference)
7. [Deployment](#deployment)
8. [Best Practices](#best-practices)

## Architecture

### Directory Structure

```
negentroper-cms/
├── content/                  # Markdown content files
│   ├── writings/            # Essays, articles, thoughts
│   └── projects/            # Project documentation
├── lib/cms/                 # CMS core functionality
│   ├── content-manager.ts   # Content CRUD operations
│   ├── types.ts            # TypeScript interfaces
│   └── hooks.ts            # React hooks for data fetching
├── app/
│   ├── api/                # API endpoints
│   │   ├── content/        # Content CRUD API
│   │   ├── timeline/       # Timeline generation API
│   │   └── tags/           # Tag management API
│   └── admin/              # Admin interface
│       └── content/        # Content management UI
├── components/
│   └── landing/
│       └── TimelineCMS.tsx # Timeline component
└── scripts/
    └── cms.js              # CLI tool
```

### Key Features

- **Markdown-First**: All content is stored as markdown files with YAML frontmatter
- **Auto-Timeline**: Timeline automatically generated from all published content
- **Tag System**: Flexible tagging for content organization
- **Draft Support**: Keep content private until ready to publish
- **Search & Filter**: Full-text search and multi-faceted filtering
- **Type Safety**: Full TypeScript support with defined schemas

## Installation

1. **Install Dependencies**
   ```bash
   pnpm add gray-matter remark remark-html @uiw/react-md-editor
   ```

2. **Set Up Content Directories**
   ```bash
   mkdir -p content/{writings,projects}
   ```

3. **Make CLI Executable**
   ```bash
   chmod +x scripts/cms.js
   ```

## Content Types

### Writing Schema

```yaml
---
title: The Architecture of Thought
description: An exploration of cognitive frameworks and mental models
date: 2024-11-15
tags:
  - philosophy
  - cognition
  - creativity
category: essays
featured: true
draft: false
author: Negentroper
excerpt: This deep dive examines how we structure our mental processes
readingTime: 12 min
---

# Your markdown content here...
```

### Project Schema

```yaml
---
title: Recursive Reality Engine
description: A meta-programming environment for creative systems
date: 2024-10-20
tags:
  - programming
  - generative-art
  - systems
category: software
featured: true
draft: false
technologies:
  - TypeScript
  - WebAssembly
  - Three.js
githubUrl: https://github.com/user/project
liveUrl: https://project.example.com
status: in-progress  # Options: completed | in-progress | planned
---

# Your project documentation here...
```

## CLI Usage

The CMS includes a powerful command-line interface for content management:

### List Content

```bash
# List all content
npm run cms list

# List specific type
npm run cms list writings
npm run cms list projects
```

### Create Content

```bash
# Create new writing
npm run cms new writing "The Nature of Entropy"

# Create new project
npm run cms new project "Quantum Garden Simulator"
```

### Publish Content

```bash
# Publish a draft (removes draft flag)
npm run cms publish writing the-nature-of-entropy
npm run cms publish project quantum-garden-simulator
```

### View Tags

```bash
# List all tags across content
npm run cms tags
```

## Admin Interface

Access the web-based admin interface at `/admin/content`.

### Features

- **Visual Editor**: Live markdown preview with syntax highlighting
- **Metadata Management**: Edit all frontmatter fields through UI
- **Search & Filter**: Find content quickly with real-time search
- **Draft Toggle**: Switch between draft and published states
- **Tag Management**: Add and remove tags with autocomplete
- **Bulk Operations**: Select and modify multiple items

### Usage

1. Navigate to `/admin/content`
2. Click "New Content" to create
3. Fill in metadata fields
4. Write markdown in the editor
5. Preview in real-time
6. Save as draft or publish immediately

## API Reference

### GET /api/content

Fetch content with filters.

**Query Parameters:**
- `type`: Filter by content type (`writing` | `project`)
- `tags`: Comma-separated list of tags
- `category`: Filter by category
- `featured`: Show only featured content (`true` | `false`)
- `draft`: Include drafts (`true` | `false`)
- `search`: Full-text search query
- `limit`: Number of results (default: all)
- `offset`: Pagination offset (default: 0)

**Example:**
```
GET /api/content?type=writing&tags=philosophy,creativity&featured=true&limit=10
```

### GET /api/timeline

Get auto-generated timeline entries.

**Response:**
```json
[
  {
    "id": "architecture-of-thought",
    "year": "2024",
    "title": "The Architecture of Thought",
    "description": "An exploration of cognitive frameworks",
    "type": "writing",
    "link": "/writings/architecture-of-thought",
    "tags": ["philosophy", "cognition"],
    "date": "2024-11-15T00:00:00Z"
  }
]
```

### GET /api/tags

Get all unique tags.

**Response:**
```json
["philosophy", "programming", "creativity", "systems", "recursion"]
```

### POST /api/content

Create or update content.

**Request Body:**
```json
{
  "content": {
    "title": "New Essay",
    "description": "Description here",
    "tags": ["tag1", "tag2"],
    "content": "# Markdown content..."
  },
  "type": "writing"
}
```

## Deployment

### Automatic GitHub Pages Deployment

1. **Commit Changes**
   ```bash
   git add content/
   git commit -m "Add new content: Essay title"
   ```

2. **Push to GitHub**
   ```bash
   git push origin main
   ```

3. **Automatic Build**
   - GitHub Actions workflow triggers
   - Next.js builds static site
   - Deploys to GitHub Pages
   - Live at your domain in ~2 minutes

### Manual Deployment

```bash
# Build static site
npm run build

# Files ready in 'out' directory
```

## Best Practices

### Content Guidelines

1. **Titles**: Keep concise and descriptive (3-7 words)
2. **Descriptions**: Write compelling 1-2 sentence summaries
3. **Tags**: Use 3-5 relevant tags per piece
4. **Categories**: Maintain consistent category names
5. **Dates**: Use ISO format (YYYY-MM-DD)

### Writing Tips

- **Excerpts**: Craft custom excerpts for better previews
- **Reading Time**: Calculate accurately (200 words/minute)
- **Featured Content**: Limit to 3-5 pieces
- **Draft Process**: Use drafts for work-in-progress

### Project Documentation

- **Status Updates**: Keep project status current
- **Technology Lists**: Include all major technologies
- **Links**: Provide both GitHub and live demo URLs
- **Screenshots**: Reference images in markdown

### Performance

- **Image Optimization**: Use WebP format, lazy loading
- **Content Length**: Break long pieces into series
- **Tag Limits**: Keep under 10 tags per piece
- **Search Index**: Rebuilds automatically on deploy

## Troubleshooting

### Common Issues

**Content Not Appearing:**
- Check `draft: false` in frontmatter
- Ensure valid YAML syntax
- Verify file has `.md` extension

**Timeline Not Updating:**
- Clear browser cache
- Check build logs in GitHub Actions
- Ensure content has valid date

**Search Not Working:**
- Rebuild search index: restart dev server
- Check for special characters in content
- Verify API endpoint accessibility

### Debug Commands

```bash
# Check content parsing
node -e "console.log(require('./lib/cms/content-manager').ContentManager.getInstance().getAllContent())"

# Verify file structure
find content -name "*.md" -type f

# Test API endpoints
curl http://localhost:3000/api/content
curl http://localhost:3000/api/timeline
```

## Advanced Usage

### Custom Content Types

Extend the type system in `lib/cms/types.ts`:

```typescript
export interface PodcastContent extends ContentMeta {
  type: 'podcast';
  duration: string;
  audioUrl: string;
  transcript?: string;
}
```

### Hooks and Filters

Use the provided React hooks:

```typescript
import { useContent, useTimeline, useTags } from '@/lib/cms/hooks';

// In your component
const { content, loading, error } = useContent({ 
  type: 'writing', 
  featured: true 
});
```

### Extending the CLI

Add custom commands to `scripts/cms.js`:

```javascript
commands.stats = () => {
  // Custom statistics command
  const writings = getWritings().length;
  const projects = getProjects().length;
  console.log(`Total content: ${writings + projects}`);
};
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Submit pull request

## License

MIT License - feel free to use for your own projects!

---

For more information, visit [negentroper.com](https://negentroper.com)