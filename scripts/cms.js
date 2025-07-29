#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(process.cwd(), 'content');

const commands = {
  list: (type) => {
    const dir = path.join(CONTENT_DIR, type || '');
    if (!fs.existsSync(dir)) {
      console.log(`No ${type} found.`);
      return;
    }
    
    const types = type ? [type] : ['writings', 'projects'];
    
    types.forEach(t => {
      const typeDir = path.join(CONTENT_DIR, t);
      if (!fs.existsSync(typeDir)) return;
      
      console.log(`\n📁 ${t.toUpperCase()}`);
      console.log('─'.repeat(50));
      
      const files = fs.readdirSync(typeDir).filter(f => f.endsWith('.md'));
      files.forEach(file => {
        const content = fs.readFileSync(path.join(typeDir, file), 'utf8');
        const { data } = matter(content);
        console.log(`  • ${data.title || file}`);
        console.log(`    ${data.description || 'No description'}`);
        console.log(`    Tags: ${data.tags?.join(', ') || 'none'}`);
        console.log(`    Status: ${data.draft ? '📝 Draft' : '✅ Published'}`);
        console.log('');
      });
    });
  },
  
  new: (type, title) => {
    if (!['writing', 'project'].includes(type)) {
      console.error('Type must be "writing" or "project"');
      return;
    }
    
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dir = path.join(CONTENT_DIR, `${type}s`);
    const filePath = path.join(dir, `${id}.md`);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (fs.existsSync(filePath)) {
      console.error(`File already exists: ${filePath}`);
      return;
    }
    
    const template = type === 'writing' ? writingTemplate(title) : projectTemplate(title);
    fs.writeFileSync(filePath, template);
    
    console.log(`✅ Created ${type}: ${filePath}`);
    console.log(`📝 Edit with: code ${filePath}`);
  },
  
  publish: (type, id) => {
    const filePath = path.join(CONTENT_DIR, `${type}s`, `${id}.md`);
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const { data, content: body } = matter(content);
    
    data.draft = false;
    data.date = data.date || new Date().toISOString();
    
    const updated = matter.stringify(body, data);
    fs.writeFileSync(filePath, updated);
    
    console.log(`✅ Published: ${data.title}`);
  },
  
  tags: () => {
    const tags = new Set();
    
    ['writings', 'projects'].forEach(type => {
      const dir = path.join(CONTENT_DIR, type);
      if (!fs.existsSync(dir)) return;
      
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
      files.forEach(file => {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const { data } = matter(content);
        data.tags?.forEach(tag => tags.add(tag));
      });
    });
    
    console.log('\n🏷️  TAGS');
    console.log('─'.repeat(50));
    Array.from(tags).sort().forEach(tag => {
      console.log(`  • ${tag}`);
    });
  }
};

function writingTemplate(title) {
  return `---
title: ${title}
description: A brief description of your writing.
date: ${new Date().toISOString()}
tags:
  - philosophy
  - creativity
category: essays
featured: false
draft: true
author: Negentroper
excerpt: A compelling excerpt that draws readers in.
readingTime: 5 min
---

# ${title}

## Introduction

Start your writing here...

## Main Content

Develop your ideas...

## Conclusion

Wrap up your thoughts...

---

*This is part of the Negentroper collection.*`;
}

function projectTemplate(title) {
  return `---
title: ${title}
description: A brief description of your project.
date: ${new Date().toISOString()}
tags:
  - programming
  - innovation
category: software
featured: false
draft: true
technologies:
  - TypeScript
  - Node.js
githubUrl: https://github.com/yourusername/project
liveUrl: https://project.example.com
status: in-progress
---

# ${title}

## Overview

Describe what your project does...

## Features

- Feature 1
- Feature 2
- Feature 3

## Technical Details

Explain the implementation...

## Getting Started

\`\`\`bash
git clone https://github.com/yourusername/project
cd project
npm install
npm run dev
\`\`\`

## Future Plans

What's next for this project...

---

*Built with passion by Negentroper.*`;
}

// CLI Interface
const [,, command, ...args] = process.argv;

console.log('\n🚀 Negentroper CMS CLI\n');

switch (command) {
  case 'list':
    commands.list(args[0]);
    break;
  case 'new':
    if (args.length < 2) {
      console.error('Usage: cms new <type> <title>');
      console.error('Example: cms new writing "My New Essay"');
    } else {
      commands.new(args[0], args.slice(1).join(' '));
    }
    break;
  case 'publish':
    if (args.length < 2) {
      console.error('Usage: cms publish <type> <id>');
      console.error('Example: cms publish writing my-new-essay');
    } else {
      commands.publish(args[0], args[1]);
    }
    break;
  case 'tags':
    commands.tags();
    break;
  default:
    console.log('Available commands:');
    console.log('  cms list [type]        - List all content or by type');
    console.log('  cms new <type> <title> - Create new content');
    console.log('  cms publish <type> <id> - Publish draft content');
    console.log('  cms tags               - List all tags');
    console.log('');
    console.log('Types: writing, project');
}

console.log('');