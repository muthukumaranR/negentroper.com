import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ExternalLink, FileText, Wrench, Search, X } from 'lucide-react';

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  type: 'writing' | 'project';
  link: string;
  tags: string[];
  details?: string;
}

const timelineData: TimelineItem[] = [
  {
    id: '0',
    year: '2025',
    title: 'Negentropic Systems Design',
    description: 'Building anti-entropic systems that create order from chaos.',
    details: 'A comprehensive guide to designing systems that reduce entropy and increase organization, drawing from thermodynamics, information theory, and complex systems.',
    type: 'writing',
    link: '/writings/negentropic-systems',
    tags: ['systems', 'entropy', 'design']
  },
  {
    id: '1',
    year: '2024',
    title: 'The Architecture of Thought',
    description: 'An exploration of cognitive frameworks and mental models for creative thinking.',
    details: 'This deep dive examines how we structure our mental processes to enhance creativity and problem-solving. Through case studies and philosophical inquiry, we explore the scaffolding of human cognition.',
    type: 'writing',
    link: '/writings/architecture-of-thought',
    tags: ['philosophy', 'cognition', 'creativity']
  },
  {
    id: '2',
    year: '2024',
    title: 'Recursive Reality Engine',
    description: 'A meta-programming environment for generating self-modifying creative systems.',
    details: 'Built using advanced algorithmic techniques, this engine creates systems that evolve their own creative processes. A playground for emergent computational creativity.',
    type: 'project',
    link: '/projects/recursive-reality-engine',
    tags: ['programming', 'recursion', 'systems']
  },
  {
    id: '3',
    year: '2023',
    title: 'Entropy and Information',
    description: 'Mathematical poetry at the intersection of thermodynamics and information theory.',
    details: 'Where Claude Shannon meets William Blake. An artistic exploration of how information flows and transforms, expressed through mathematical verse and visual metaphors.',
    type: 'writing',
    link: '/writings/entropy-and-information',
    tags: ['mathematics', 'poetry', 'physics']
  },
  {
    id: '4',
    year: '2023',
    title: 'Pattern Synthesis Lab',
    description: 'Interactive tools for exploring emergent patterns in complex systems.',
    details: 'A collection of interactive visualizations and simulations that reveal the hidden patterns in chaos. Built with WebGL and advanced mathematical modeling.',
    type: 'project',
    link: '/projects/pattern-synthesis-lab',
    tags: ['complexity', 'emergence', 'visualization']
  },
  {
    id: '5',
    year: '2022',
    title: 'Digital Minimalism Manifesto',
    description: 'A framework for intentional technology use in creative practice.',
    details: 'A philosophical treatise on reclaiming attention and intentionality in our digital age. Practical strategies for maintaining creative focus in an attention economy.',
    type: 'writing',
    link: '/writings/digital-minimalism-manifesto',
    tags: ['technology', 'minimalism', 'creativity']
  },
  {
    id: '6',
    year: '2022',
    title: 'Generative Soundscapes',
    description: 'Algorithmic composition tools for creating ambient sonic environments.',
    details: 'An exploration of procedural audio generation using mathematical models of natural phenomena. Creates evolving soundscapes that mirror organic processes.',
    type: 'project',
    link: '/projects/generative-soundscapes',
    tags: ['music', 'algorithms', 'ambient']
  }
];

export function Timeline() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'writing' | 'project'>('all');

  const filteredItems = timelineData.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Standard hover properties for consistency
  const standardHover = {
    whileHover: { y: -4, scale: 1.01 },
    transition: { type: "spring", stiffness: 400, damping: 25, duration: 0.15 } as any
  };

  const buttonHover = {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 25 } as any
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl mb-4">Timeline of Creation</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          A journey through writings and projects that explore the intersection of 
          order and chaos, thought and creation.
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mb-12 max-w-2xl mx-auto"
      >
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search writings and projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          />
          {searchTerm && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
              {...buttonHover}
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {(['all', 'writing', 'project'] as const).map((type) => (
            <motion.button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
              {...buttonHover}
            >
              {type === 'all' ? 'All' : type === 'writing' ? 'Writings' : 'Projects'}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="relative">
        {/* Central timeline line */}
        <div className="absolute left-1/2 transform -translate-x-0.5 w-px h-full bg-gradient-to-b from-primary via-accent to-primary opacity-30"></div>

        <AnimatePresence mode="popLayout">
          <div className="space-y-12">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`relative flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                {/* Timeline dot */}
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />

                {/* Content card */}
                <motion.div
                  className={`w-5/12 ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}
                  onHoverStart={() => setHoveredItem(item.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  {...standardHover}
                >
                  <motion.div
                    className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer"
                    animate={{
                      borderColor: hoveredItem === item.id ? 'rgb(var(--primary) / 0.3)' : 'rgb(var(--border))'
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"
                      animate={{ opacity: hoveredItem === item.id ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                          {item.year}
                        </span>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          {item.type === 'writing' ? (
                            <FileText className="w-4 h-4 text-primary" />
                          ) : (
                            <Wrench className="w-4 h-4 text-accent-foreground" />
                          )}
                        </motion.div>
                      </div>

                      <motion.h3
                        className="text-xl mb-2 hover:text-primary transition-colors duration-200"
                        animate={{ x: hoveredItem === item.id ? 4 : 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        {item.title}
                      </motion.h3>

                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Expanded details on hover */}
                      <AnimatePresence>
                        {hoveredItem === item.id && item.details && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="p-3 bg-muted/50 rounded border-l-2 border-primary overflow-hidden"
                          >
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.details}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag, tagIndex) => (
                          <motion.button
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: tagIndex * 0.05 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.98 }}
                            className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSearchTerm(tag);
                            }}
                          >
                            {tag}
                          </motion.button>
                        ))}
                      </div>

                      <motion.a
                        href={item.link}
                        className="inline-flex items-center gap-2 text-primary hover:underline group"
                        animate={{ x: hoveredItem === item.id ? 8 : 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        <span>
                          {item.type === 'writing' ? 'Read More' : 'View Project'}
                        </span>
                        <motion.div
                          animate={{ rotate: hoveredItem === item.id ? 45 : 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.div>
                      </motion.a>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>

      {/* No results message */}
      {filteredItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground text-lg">No items found matching your criteria.</p>
          <motion.button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
            }}
            className="mt-4 text-primary hover:underline"
            {...buttonHover}
          >
            Clear filters
          </motion.button>
        </motion.div>
      )}

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="text-center mt-20"
      >
        <div className="flex justify-center gap-8">
          <motion.a
            href="/writings"
            className="group flex items-center gap-3 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200"
            {...standardHover}
          >
            <FileText className="w-5 h-5" />
            <span>Explore Writings</span>
          </motion.a>
          
          <motion.a
            href="/projects"
            className="group flex items-center gap-3 bg-accent text-accent-foreground px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors duration-200 border border-border"
            {...standardHover}
          >
            <Wrench className="w-5 h-5" />
            <span>View Projects</span>
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}