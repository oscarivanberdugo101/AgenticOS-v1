import React from 'react';
import { motion } from 'motion/react';
import { Plus, ArrowRight, Terminal, Shield, Cpu } from 'lucide-react';

export const MinimalLanding = ({ onStartProject }: { onStartProject: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto text-center space-y-16 p-8">
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="size-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mx-auto mb-12"
      >
        <Terminal size={32} className="text-neon-blue" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <h1 className="text-7xl font-light tracking-tighter text-white leading-tight">
          Diseña el futuro del <br />
          <span className="text-neon-blue italic serif">Software Autónomo</span>
        </h1>
        <p className="text-neutral-500 uppercase tracking-[0.5em] text-[10px] font-bold">
          Orquestación de Agentes IA de Próxima Generación
        </p>
      </motion.div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
      {[
        { icon: Shield, label: 'Seguridad', desc: 'Auditoría proactiva' },
        { icon: Cpu, label: 'Potencia', desc: 'Modelos locales' },
        { icon: Plus, label: 'Escalable', desc: 'Arquitectura Swarm' },
      ].map((feat, i) => (
        <motion.div
          key={feat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
          className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2"
        >
          <feat.icon size={16} className="text-neutral-500" />
          <p className="text-[10px] font-bold text-white uppercase tracking-widest">{feat.label}</p>
          <p className="text-[9px] text-neutral-600 uppercase tracking-widest">{feat.desc}</p>
        </motion.div>
      ))}
    </div>

    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      onClick={onStartProject}
      className="group flex items-center gap-6 px-10 py-5 bg-white text-black rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-neon-blue transition-all shadow-2xl"
    >
      <Plus size={18} />
      Inicializar Nuevo Proyecto
      <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
    </motion.button>
  </div>
);
