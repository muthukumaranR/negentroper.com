import { ContentManager } from './content-manager';
import { Content, TimelineEntry } from './types';

// Static data generation for GitHub Pages deployment
let cachedContent: Content[] | null = null;
let cachedTimeline: TimelineEntry[] | null = null;
let cachedTags: string[] | null = null;

export async function getStaticContent(): Promise<Content[]> {
  if (cachedContent) return cachedContent;
  
  const cms = ContentManager.getInstance();
  cachedContent = await cms.getAllContent({ draft: false });
  return cachedContent;
}

export async function getStaticTimeline(): Promise<TimelineEntry[]> {
  if (cachedTimeline) return cachedTimeline;
  
  const cms = ContentManager.getInstance();
  cachedTimeline = await cms.getTimeline();
  return cachedTimeline;
}

export async function getStaticTags(): Promise<string[]> {
  if (cachedTags) return cachedTags;
  
  const cms = ContentManager.getInstance();
  cachedTags = await cms.getAllTags();
  return cachedTags;
}

// Clear cache for development
export function clearCache() {
  cachedContent = null;
  cachedTimeline = null;
  cachedTags = null;
}