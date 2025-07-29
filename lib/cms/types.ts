export interface ContentMeta {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  category?: string;
  featured?: boolean;
  draft?: boolean;
  author?: string;
  coverImage?: string;
}

export interface WritingContent extends ContentMeta {
  type: 'writing';
  readingTime?: string;
  excerpt?: string;
}

export interface ProjectContent extends ContentMeta {
  type: 'project';
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  status?: 'completed' | 'in-progress' | 'planned';
}

export interface TimelineEntry {
  id: string;
  year: string;
  title: string;
  description: string;
  type: 'writing' | 'project';
  link: string;
  tags: string[];
  details?: string;
  date: string;
}

export type Content = WritingContent | ProjectContent;

export interface ContentFilter {
  type?: 'writing' | 'project' | 'timeline';
  tags?: string[];
  category?: string;
  featured?: boolean;
  draft?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}