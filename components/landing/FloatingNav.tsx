import { motion, useAnimationControls } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Home, BookOpen, Wrench, Github, Twitter } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function FloatingNav() {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const controls = useAnimationControls();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrollY(currentScrollY);
          setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100);
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { icon: Home, href: '#home', label: 'Home', id: 'home' },
    { icon: BookOpen, href: '/writings', label: 'Writings', id: 'writings' },
    { icon: Wrench, href: '/projects', label: 'Projects', id: 'projects' },
  ];

  const socialItems = [
    { icon: Github, href: 'https://github.com', label: 'GitHub', id: 'github' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', id: 'twitter' },
  ];

  const standardHoverProps = {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 25, duration: 0.15 } as any
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: 50 }}
      animate={{ 
        opacity: isVisible ? 1 : 0.6, 
        x: 0
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50"
    >
      <motion.div
        className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-2xl p-2 shadow-lg"
        animate={{
          y: Math.min(scrollY * 0.05, 10),
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col gap-1">
          {/* Navigation Items */}
          {navItems.map((item) => (
            <div key={item.id} className="relative">
              <motion.a
                href={item.href}
                className="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-transparent hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                {...standardHoverProps}
              >
                <item.icon className="w-4 h-4 transition-transform duration-200" />
              </motion.a>
              
              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.9 }}
                animate={{ 
                  opacity: hoveredItem === item.id ? 1 : 0,
                  x: hoveredItem === item.id ? 0 : 8,
                  scale: hoveredItem === item.id ? 1 : 0.9
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
              >
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                  {item.label}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-primary border-t-[3px] border-b-[3px] border-t-transparent border-b-transparent"></div>
                </div>
              </motion.div>
            </div>
          ))}
          
          {/* Theme Toggle */}
          <div className="my-1 flex justify-center">
            <div className="scale-75 origin-center">
              <ThemeToggle />
            </div>
          </div>
          
          {/* Separator */}
          <div className="w-6 h-px bg-border mx-auto my-1"></div>
          
          {/* Social Items */}
          {socialItems.map((item) => (
            <div key={item.id} className="relative">
              <motion.a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                onHoverStart={() => setHoveredItem(item.id)}
                onHoverEnd={() => setHoveredItem(null)}
                {...standardHoverProps}
              >
                <item.icon className="w-4 h-4 transition-transform duration-200" />
              </motion.a>
              
              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.9 }}
                animate={{ 
                  opacity: hoveredItem === item.id ? 1 : 0,
                  x: hoveredItem === item.id ? 0 : 8,
                  scale: hoveredItem === item.id ? 1 : 0.9
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
              >
                <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">
                  {item.label}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-[4px] border-l-primary border-t-[3px] border-b-[3px] border-t-transparent border-b-transparent"></div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.nav>
  );
}