import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { 
  Content, 
  ContentFilter, 
  WritingContent, 
  ProjectContent,
  TimelineEntry 
} from './types';

const CONTENT_PATH = path.join(process.cwd(), 'content');

export class ContentManager {
  private static instance: ContentManager;
  
  private constructor() {}
  
  static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager();
    }
    return ContentManager.instance;
  }

  async getAllContent(filter?: ContentFilter): Promise<Content[]> {
    const writings = await this.getWritings();
    const projects = await this.getProjects();
    
    let allContent: Content[] = [...writings, ...projects];
    
    // Apply filters
    if (filter) {
      if (filter.type && filter.type !== 'timeline') {
        allContent = allContent.filter(item => item.type === filter.type);
      }
      
      if (filter.tags && filter.tags.length > 0) {
        allContent = allContent.filter(item => 
          filter.tags!.some(tag => item.tags.includes(tag))
        );
      }
      
      if (filter.category) {
        allContent = allContent.filter(item => item.category === filter.category);
      }
      
      if (filter.featured !== undefined) {
        allContent = allContent.filter(item => item.featured === filter.featured);
      }
      
      if (filter.draft !== undefined) {
        allContent = allContent.filter(item => item.draft === filter.draft);
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        allContent = allContent.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
    }
    
    // Sort by date (newest first)
    allContent.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Apply pagination
    if (filter?.offset !== undefined || filter?.limit !== undefined) {
      const start = filter.offset || 0;
      const end = filter.limit ? start + filter.limit : undefined;
      allContent = allContent.slice(start, end);
    }
    
    return allContent;
  }

  async getTimeline(): Promise<TimelineEntry[]> {
    const allContent = await this.getAllContent({ draft: false });
    
    return allContent.map(item => ({
      id: item.id,
      year: new Date(item.date).getFullYear().toString(),
      title: item.title,
      description: item.description,
      type: item.type,
      link: item.type === 'writing' ? `/writings/${item.id}` : `/projects/${item.id}`,
      tags: item.tags,
      details: 'excerpt' in item ? item.excerpt : item.description,
      date: item.date
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getWritings(): Promise<WritingContent[]> {
    const dir = path.join(CONTENT_PATH, 'writings');
    if (!fs.existsSync(dir)) return [];
    
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.md'));
    
    const writings = await Promise.all(
      files.map(async file => {
        const filePath = path.join(dir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        const processedContent = await remark().use(html).process(content);
        const contentHtml = processedContent.toString();
        
        return {
          title: data.title || 'Untitled',
          description: data.description || '',
          date: data.date || new Date().toISOString(),
          tags: data.tags || [],
          category: data.category,
          featured: data.featured,
          draft: data.draft,
          author: data.author,
          coverImage: data.coverImage,
          ...data,
          id: file.replace('.md', ''),
          type: 'writing' as const,
          content: contentHtml,
          readingTime: this.calculateReadingTime(content),
          excerpt: data.excerpt || content.substring(0, 150) + '...'
        } as WritingContent;
      })
    );
    
    return writings;
  }

  async getProjects(): Promise<ProjectContent[]> {
    const dir = path.join(CONTENT_PATH, 'projects');
    if (!fs.existsSync(dir)) return [];
    
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.md'));
    
    const projects = await Promise.all(
      files.map(async file => {
        const filePath = path.join(dir, file);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        const processedContent = await remark().use(html).process(content);
        const contentHtml = processedContent.toString();
        
        return {
          title: data.title || 'Untitled',
          description: data.description || '',
          date: data.date || new Date().toISOString(),
          tags: data.tags || [],
          category: data.category,
          featured: data.featured,
          draft: data.draft,
          author: data.author,
          coverImage: data.coverImage,
          technologies: data.technologies,
          githubUrl: data.githubUrl,
          liveUrl: data.liveUrl,
          status: data.status,
          ...data,
          id: file.replace('.md', ''),
          type: 'project' as const,
          content: contentHtml
        } as ProjectContent;
      })
    );
    
    return projects;
  }

  async getContentById(id: string, type: 'writing' | 'project'): Promise<Content | null> {
    const dir = path.join(CONTENT_PATH, type === 'writing' ? 'writings' : 'projects');
    const filePath = path.join(dir, `${id}.md`);
    
    if (!fs.existsSync(filePath)) return null;
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();
    
    if (type === 'writing') {
      return {
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        category: data.category,
        featured: data.featured,
        draft: data.draft,
        author: data.author,
        coverImage: data.coverImage,
        ...data,
        id,
        type: 'writing' as const,
        content: contentHtml,
        readingTime: this.calculateReadingTime(content),
        excerpt: data.excerpt || content.substring(0, 150) + '...'
      } as WritingContent;
    } else {
      return {
        title: data.title || 'Untitled',
        description: data.description || '',
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        category: data.category,
        featured: data.featured,
        draft: data.draft,
        author: data.author,
        coverImage: data.coverImage,
        technologies: data.technologies,
        githubUrl: data.githubUrl,
        liveUrl: data.liveUrl,
        status: data.status,
        ...data,
        id,
        type: 'project' as const,
        content: contentHtml
      } as ProjectContent;
    }
  }

  async getAllTags(): Promise<string[]> {
    const allContent = await this.getAllContent();
    const tagSet = new Set<string>();
    
    allContent.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag));
    });
    
    return Array.from(tagSet).sort();
  }

  async saveContent(content: Partial<Content> & { content: string }, type: 'writing' | 'project'): Promise<void> {
    const dir = path.join(CONTENT_PATH, type === 'writing' ? 'writings' : 'projects');
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const { content: markdownContent, ...frontmatter } = content;
    const fileContent = matter.stringify(markdownContent || '', frontmatter);
    
    const filename = `${content.id || this.generateId(content.title || 'untitled')}.md`;
    const filePath = path.join(dir, filename);
    
    fs.writeFileSync(filePath, fileContent);
  }

  async deleteContent(id: string, type: 'writing' | 'project'): Promise<void> {
    const dir = path.join(CONTENT_PATH, type === 'writing' ? 'writings' : 'projects');
    const filePath = path.join(dir, `${id}.md`);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  private calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  }

  private generateId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}