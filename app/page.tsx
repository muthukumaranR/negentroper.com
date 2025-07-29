'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { DictionaryDefinition } from '@/components/landing/DictionaryDefinition';
import { Timeline } from '@/components/landing/Timeline';
import { FloatingNav } from '@/components/landing/FloatingNav';

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Enhanced animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-2xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.1, 0.3],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 10,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Mouse follower */}
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent rounded-full blur-3xl mix-blend-screen pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{
            type: "tween",
            ease: "linear",
            duration: 0.2,
          }}
        />
      </div>

      {/* Header with enhanced animations */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 pt-8 pb-4"
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.h1
              className="text-3xl tracking-wider text-primary"
              initial={{ letterSpacing: "0.05em" }}
              whileHover={{ letterSpacing: "0.15em" }}
              transition={{ duration: 0.3 }}
            >
              negentroper.com
            </motion.h1>
            <motion.div
              className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-2"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </motion.div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10">
        <section id="home">
          <DictionaryDefinition />
        </section>
        
        {/* Enhanced transition element */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 py-8"
        >
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-border to-transparent relative"
            whileInView={{
              background: [
                "linear-gradient(to right, transparent, rgb(var(--border)), transparent)",
                "linear-gradient(to right, transparent, rgb(var(--primary)), transparent)",
                "linear-gradient(to right, transparent, rgb(var(--border)), transparent)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            viewport={{ once: true }}
          >
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>

        <Timeline />
      </main>

      {/* Enhanced footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 py-12 text-center text-muted-foreground"
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.p
            className="mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            Creating order from chaos, one thought at a time.
          </motion.p>
          <motion.div
            className="w-12 h-px bg-gradient-to-r from-transparent via-muted-foreground to-transparent mx-auto"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          />
        </div>
      </motion.footer>

      {/* Floating Navigation */}
      <FloatingNav />
    </div>
  );
}
