import { useState, useEffect } from 'react';
import { Content, ContentFilter, TimelineEntry } from './types';

// Client-side hooks for fetching content
export function useContent(filter?: ContentFilter) {
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const params = new URLSearchParams();
        if (filter?.type) params.append('type', filter.type);
        if (filter?.tags) params.append('tags', filter.tags.join(','));
        if (filter?.category) params.append('category', filter.category);
        if (filter?.featured !== undefined) params.append('featured', String(filter.featured));
        if (filter?.draft !== undefined) params.append('draft', String(filter.draft));
        if (filter?.search) params.append('search', filter.search);
        if (filter?.limit) params.append('limit', String(filter.limit));
        if (filter?.offset) params.append('offset', String(filter.offset));

        const response = await fetch(`/api/content?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch content');
        
        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [filter]);

  return { content, loading, error };
}

export function useTimeline() {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await fetch('/api/timeline');
        if (!response.ok) throw new Error('Failed to fetch timeline');
        
        const data = await response.json();
        setTimeline(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  return { timeline, loading, error };
}

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/tags');
        if (!response.ok) throw new Error('Failed to fetch tags');
        
        const data = await response.json();
        setTags(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, loading, error };
}