# Negentroper Content Management System

A markdown-based CMS with full support for tags, categories, search, and automatic timeline generation.

## Features

✨ **Markdown-Based Content**: Write in markdown with rich frontmatter support
🏷️ **Advanced Tagging**: Tag content for easy organization and discovery
🔍 **Smart Search**: Filter by type, tags, category, or full-text search
📅 **Auto-Generated Timeline**: Timeline automatically pulls from all content
👁️ **Live Preview**: Real-time markdown preview while editing
📝 **Draft System**: Keep content as drafts until ready to publish
🎨 **Content Types**: Support for writings and projects with different schemas
⚡ **CLI Tools**: Quick content creation and management from terminal

## Content Structure

```
content/
├── writings/          # Essays, articles, thoughts
│   └── *.md
└── projects/         # Project documentation
    └── *.md
```

## Using the CLI

The CMS includes a command-line interface for quick content management:

```bash
# List all content
npm run cms list

# List specific type
npm run cms list writings
npm run cms list projects

# Create new content
npm run cms new writing "The Nature of Entropy"
npm run cms new project "Quantum Garden Simulator"

# Publish a draft
npm run cms publish writing the-nature-of-entropy

# View all tags
npm run cms tags
```

## Content Schema

### Writing Schema

```yaml
---
title: The Architecture of Thought
description: An exploration of cognitive frameworks
date: 2024-11-15
tags:
  - philosophy
  - cognition
  - creativity
category: essays
featured: true
draft: false
author: Negentroper
excerpt: A compelling excerpt...
readingTime: 12 min
---
```

### Project Schema

```yaml
---
title: Recursive Reality Engine
description: A meta-programming environment
date: 2024-10-20
tags:
  - programming
  - generative-art
category: software
featured: true
draft: false
technologies:
  - TypeScript
  - WebAssembly
githubUrl: https://github.com/user/project
liveUrl: https://project.example.com
status: in-progress  # completed | in-progress | planned
---
```

## Admin Interface

Access the admin interface at `/admin/content` to:

- Create and edit content with live preview
- Manage tags and categories
- Toggle draft/published status
- Set featured content
- Search and filter all content

## API Endpoints

### GET /api/content
Fetch content with optional filters:
- `?type=writing|project`
- `?tags=philosophy,creativity`
- `?featured=true`
- `?draft=false`
- `?search=entropy`
- `?limit=10&offset=0`

### GET /api/timeline
Get auto-generated timeline from all published content

### GET /api/tags
Get all unique tags across content

### POST /api/content
Create or update content (requires authentication)

## Timeline Generation

The timeline is automatically generated from:
- All published writings and projects
- Sorted by date (newest first)
- Includes title, description, tags, and type
- Links to appropriate content pages

## Workflow

1. **Create content** using CLI: `npm run cms new writing "My Title"`
2. **Edit markdown** in your favorite editor
3. **Preview** at `/admin/content` or run locally
4. **Publish** when ready: `npm run cms publish writing my-title`
5. **Push to GitHub** to deploy: `git add . && git commit -m "New content" && git push`

## Tips

- Keep titles concise and descriptive
- Use meaningful tags for better organization
- Write compelling descriptions for timeline display
- Set `featured: true` for important content
- Use excerpts for better preview text
- Include reading time estimates for writings
- Add technology stacks for projects

## Deployment

Content updates automatically deploy via GitHub Pages when pushed to main branch.