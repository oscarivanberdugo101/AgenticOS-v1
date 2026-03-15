import React from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Play, 
  Cpu, 
  Users, 
  Zap, 
  Shield, 
  ChevronRight,
  Code,
  Terminal,
  Layers
} from 'lucide-react';

interface TutorialSectionProps {
  onStart: () => void;
}

export const TutorialSection = ({ onStart }: TutorialSectionProps) => {
  const steps = [
    {
      icon: <Cpu className="text-neon-blue" />,
      title: "1. Inicialización del Core",
      desc: "Define el nombre, descripción y stack tecnológico de tu proyecto. Esto calibra los modelos de lenguaje para tu caso de uso específico.",
      tip: "Usa descripciones detalladas para mejores resultados arquitectónicos."
    },
    {
      icon: <Users className="text-purple-500" />,
      title: "2. Consultoría con el Director",
      desc: "Interactúa con el Agente Director para refinar los requerimientos. Puedes adjuntar documentos técnicos o diagramas para contexto adicional.",
      tip: "El Director detectará ambigüedades antes de pasar a la fase de construcción."
    },
    {
      icon: <Layers className="text-emerald-500" />,
      title: "3. Sincronización de Especialistas",
      desc: "En la fase de Kickoff, verás cómo los agentes (Arquitecto, Coder, Security) se alinean con el brief consolidado.",
      tip: "Revisa el brief antes de iniciar el desarrollo para asegurar la alineación."
    },
    {
      icon: <Zap className="text-amber-500" />,
      title: "4. Pipeline de Producción",
      desc: "Monitorea el flujo de trabajo autónomo. Los agentes generarán artefactos de software, esquemas de base de datos y lógica de negocio en paralelo.",
      tip: "Observa el panel derecho para ver los archivos generados en tiempo real."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-16 py-10">
      <div className="text-center space-y-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="size-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <BookOpen size={32} className="text-white" />
        </motion.div>
        <h2 className="text-5xl font-extralight text-white tracking-tighter">Manual Operativo OS.CORE</h2>
        <p className="text-neutral-500 text-xs uppercase tracking-[0.4em] font-black">Guía de Desarrollo Autónomo Multi-Agente</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
          >
            <div className="flex gap-6">
              <div className="size-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-white/20 transition-all shrink-0">
                {step.icon}
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-light text-white tracking-tight">{step.title}</h3>
                <p className="text-sm text-neutral-400 leading-relaxed">{step.desc}</p>
                <div className="pt-4 flex items-start gap-3">
                  <div className="size-1.5 bg-neon-blue rounded-full mt-1.5 animate-pulse" />
                  <p className="text-[10px] font-mono text-neutral-500 italic uppercase">Pro-Tip: {step.tip}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-[3rem] p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Terminal size={120} className="text-neon-blue" />
        </div>
        <div className="relative z-10 space-y-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-extralight text-white tracking-tight">¿Listo para inicializar?</h3>
            <p className="text-xs text-neutral-500 uppercase tracking-widest font-black">El entorno está calibrado y esperando instrucciones.</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onStart}
              className="px-8 py-4 bg-neon-blue text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white transition-all shadow-xl flex items-center gap-3"
            >
              Comenzar Ahora
              <ChevronRight size={14} />
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-white/10 transition-all">
              Documentación Técnica
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: <Code size={18} />, label: "Modelos Locales", val: "Ollama Integration" },
          { icon: <Shield size={18} />, label: "Seguridad", val: "Zero-Trust Pipeline" },
          { icon: <Zap size={18} />, label: "Velocidad", val: "Parallel Execution" }
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-4 p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
            <div className="text-neutral-500">{item.icon}</div>
            <div>
              <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{item.label}</p>
              <p className="text-[10px] font-bold text-white uppercase tracking-wider">{item.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
