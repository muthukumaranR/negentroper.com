import { motion } from 'framer-motion';

export function DictionaryDefinition() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto px-6 py-16"
    >
      <div className="relative">
        {/* Pronunciation and word type */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <motion.h1 
            className="text-6xl font-light tracking-tight mb-2"
            whileHover={{ 
              scale: 1.02,
              letterSpacing: "0.1em"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25, duration: 0.15 }}
          >
            negentroper
          </motion.h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="text-lg">/ˈnɛɡˌɛntroʊpər/</span>
            <motion.span 
              className="text-sm bg-accent px-2 py-1 rounded cursor-default"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              noun
            </motion.span>
          </div>
        </motion.div>

        {/* Definition */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="space-y-6"
        >
          <motion.div 
            className="border-l-4 border-primary pl-6 cursor-default"
            whileHover={{ 
              x: 4,
              borderColor: "rgb(var(--primary) / 0.8)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <p className="text-xl leading-relaxed">
              <span className="font-medium">1.</span> The opposite of entropy; a force or principle that creates order, 
              organization, and complexity from chaos and randomness.
            </p>
          </motion.div>
          
          <motion.div 
            className="border-l-4 border-accent pl-6 cursor-default"
            whileHover={{ 
              x: 4,
              borderColor: "rgb(var(--accent) / 0.8)"
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <p className="text-lg text-muted-foreground leading-relaxed">
              <span className="font-medium">2.</span> A conceptual framework for understanding creative and 
              intellectual processes that build meaning, structure, and coherence in a world 
              naturally tending toward disorder.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="italic text-muted-foreground mt-8 text-center cursor-default"
            whileHover={{ 
              scale: 1.02,
              color: "rgb(var(--foreground) / 0.8)"
            }}
          >
            "In the dance between chaos and order, the negentroper finds rhythm."
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}