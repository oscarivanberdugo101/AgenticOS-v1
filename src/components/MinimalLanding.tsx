import React from 'react';
import { motion } from 'motion/react';
import { Plus, ArrowRight } from 'lucide-react';

export const MinimalLanding = ({ onStartProject }: { onStartProject: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full text-center space-y-12 p-8">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="space-y-4"
    >
      <h1 className="text-6xl font-extralight tracking-tighter text-white">
        Bienvenido al <span className="text-neon-blue">Núcleo</span>
      </h1>
      <p className="text-neutral-500 uppercase tracking-[0.3em] text-xs">
        Desarrollo Autónomo de Software
      </p>
    </motion.div>

    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      onClick={onStartProject}
      className="group flex items-center gap-4 px-8 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-neon-blue transition-all shadow-2xl"
    >
      <Plus size={16} />
      Inicializar Nuevo Proyecto
      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
    </motion.button>
  </div>
);
