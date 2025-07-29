'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, FileText, Wrench, Search, X } from 'lucide-react';
import { TimelineEntry } from '@/lib/cms/types';

interface TimelineStaticProps {
  timelineData: TimelineEntry[];
  allTags: string[];
}

export function TimelineStatic({ timelineData, allTags }: TimelineStaticProps) {
  const [selectedItem, setSelectedItem] = useState<TimelineEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredData = timelineData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => item.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const groupedByYear = filteredData.reduce((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = [];
    }
    acc[item.year].push(item);
    return acc;
  }, {} as Record<string, TimelineEntry[]>);

  const years = Object.keys(groupedByYear).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <section className="max-w-6xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-light mb-8 text-center">Journey Through Time</h2>
        
        {/* Search and Filter Bar */}
        <motion.div 
          className="mb-12 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg backdrop-blur-sm border border-border/50">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search timeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <motion.button
                key={tag}
                onClick={() => setSelectedTags(prev => 
                  prev.includes(tag) 
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                )}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <motion.div 
            className="absolute left-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          />

          {years.map((year, yearIndex) => (
            <motion.div
              key={year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: yearIndex * 0.1 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center mb-6">
                <motion.div 
                  className="w-24 text-right pr-8 text-2xl font-light text-primary"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {year}
                </motion.div>
                <motion.div 
                  className="w-3 h-3 bg-primary rounded-full relative z-10"
                  animate={{
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(var(--primary-rgb), 0.4)",
                      "0 0 0 10px rgba(var(--primary-rgb), 0)",
                      "0 0 0 0 rgba(var(--primary-rgb), 0)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: yearIndex * 0.2
                  }}
                />
              </div>

              <div className="ml-32 space-y-4">
                {groupedByYear[year].map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ x: 10 }}
                    className="group"
                  >
                    <motion.div
                      className="p-6 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      layout
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-medium group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <motion.div
                          className="ml-4"
                          whileHover={{ scale: 1.2, rotate: 15 }}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        >
                          {item.type === 'writing' ? (
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Wrench className="w-4 h-4 text-muted-foreground" />
                          )}
                        </motion.div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, tagIndex) => (
                          <motion.span
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: tagIndex * 0.05 }}
                            className="text-xs px-2 py-1 bg-muted rounded-full"
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card rounded-lg p-8 max-w-2xl w-full border border-border shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-medium mb-2">{selectedItem.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedItem.year}</p>
                </div>
                <motion.button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
              
              <p className="text-muted-foreground mb-6">
                {selectedItem.details || selectedItem.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedItem.tags.map(tag => (
                  <span key={tag} className="text-xs px-3 py-1 bg-muted rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              
              <motion.a
                href={selectedItem.link}
                className="inline-flex items-center gap-2 text-primary hover:underline"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                View {selectedItem.type === 'writing' ? 'Writing' : 'Project'}
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}