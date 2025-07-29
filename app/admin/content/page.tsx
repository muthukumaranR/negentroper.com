'use client'

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Plus, Search, FileText, Wrench, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Content, ContentFilter } from '@/lib/cms/types';
import { useContent, useTags } from '@/lib/cms/hooks';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

export default function ContentAdminPage() {
  const [filter, setFilter] = useState<ContentFilter>({});
  const { content, loading, error } = useContent(filter);
  const { tags: allTags } = useTags();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingContent, setEditingContent] = useState<Partial<Content> | null>(null);
  const [contentType, setContentType] = useState<'writing' | 'project'>('writing');
  const [markdown, setMarkdown] = useState('');

  const handleSave = async () => {
    if (!editingContent) return;
    
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: {
            ...editingContent,
            content: markdown,
            date: editingContent.date || new Date().toISOString(),
            tags: editingContent.tags || [],
            draft: editingContent.draft ?? false,
          },
          type: contentType
        })
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      // Refresh content
      window.location.reload();
    } catch (err) {
      console.error('Error saving content:', err);
    }
  };

  const handleDelete = async (id: string, type: 'writing' | 'project') => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const response = await fetch(`/api/content/${id}?type=${type}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      // Refresh content
      window.location.reload();
    } catch (err) {
      console.error('Error deleting content:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">Content Management</h1>
          <motion.button
            onClick={() => {
              setIsCreating(true);
              setEditingContent({
                title: '',
                description: '',
                tags: [],
                draft: true
              });
              setMarkdown('');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            New Content
          </motion.button>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search content..."
              value={filter.search || ''}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="flex-1 bg-transparent outline-none"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter({ ...filter, type: undefined })}
              className={`px-3 py-1 rounded-full text-sm ${
                !filter.type ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter({ ...filter, type: 'writing' })}
              className={`px-3 py-1 rounded-full text-sm ${
                filter.type === 'writing' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              Writings
            </button>
            <button
              onClick={() => setFilter({ ...filter, type: 'project' })}
              className={`px-3 py-1 rounded-full text-sm ${
                filter.type === 'project' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              Projects
            </button>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <div className="grid gap-4">
            {content.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-card rounded-lg border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {item.type === 'writing' ? (
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <Wrench className="w-5 h-5 text-muted-foreground" />
                      )}
                      <h3 className="text-xl font-medium">{item.title}</h3>
                      {item.draft && (
                        <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {item.tags.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 bg-muted rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingContent(item);
                        setContentType(item.type);
                        setMarkdown(''); // Would need to fetch full content
                        setIsCreating(true);
                      }}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.type)}
                      className="p-2 hover:bg-destructive/20 text-destructive rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Editor Modal */}
      {isCreating && editingContent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-light mb-6">
              {editingContent.id ? 'Edit Content' : 'Create New Content'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as any)}
                  className="w-full p-2 bg-muted rounded-lg"
                  disabled={!!editingContent.id}
                >
                  <option value="writing">Writing</option>
                  <option value="project">Project</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editingContent.title || ''}
                  onChange={(e) => setEditingContent({ ...editingContent, title: e.target.value })}
                  className="w-full p-2 bg-muted rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editingContent.description || ''}
                  onChange={(e) => setEditingContent({ ...editingContent, description: e.target.value })}
                  className="w-full p-2 bg-muted rounded-lg h-20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingContent.tags?.join(', ') || ''}
                  onChange={(e) => setEditingContent({ 
                    ...editingContent, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  className="w-full p-2 bg-muted rounded-lg"
                />
              </div>
              
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingContent.draft || false}
                    onChange={(e) => setEditingContent({ ...editingContent, draft: e.target.checked })}
                  />
                  <span>Draft</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingContent.featured || false}
                    onChange={(e) => setEditingContent({ ...editingContent, featured: e.target.checked })}
                  />
                  <span>Featured</span>
                </label>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Content</label>
              <MDEditor
                value={markdown}
                onChange={(val) => setMarkdown(val || '')}
                height={400}
              />
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingContent(null);
                }}
                className="px-4 py-2 bg-muted rounded-lg hover:bg-muted/80"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}