import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Globe, ShieldCheck, Bot, Plus, Rocket, ArrowRight } from 'lucide-react';

interface DashboardSectionProps {
  projectsCount: number;
  onStartProject?: () => void;
}

const PARTICLES = [...Array(15)].map(() => ({
  x: Math.random() * 1000 - 500,
  y: Math.random() * 1000 - 500,
  targetY: Math.random() * -200 - 100,
  duration: Math.random() * 5 + 5,
  delay: Math.random() * 5
}));

export const DashboardSection = ({ projectsCount, onStartProject }: DashboardSectionProps) => {
  const isIdle = projectsCount === 0;
  const [isHoveringCore, setIsHoveringCore] = useState(false);

  return (
    <div className="max-w-7xl mx-auto w-full h-full flex flex-col items-center justify-center space-y-24 relative overflow-hidden">
      {/* Background Neural Grid Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,243,255,0.05),transparent_70%)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Floating Data Particles */}
      {!isIdle && PARTICLES.map((particle, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: particle.x, 
            y: particle.y,
            opacity: 0 
          }}
          animate={{ 
            y: [null, particle.targetY],
            opacity: [0, 0.3, 0],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: particle.duration, 
            repeat: Infinity,
            ease: "linear",
            delay: particle.delay
          }}
          className="absolute size-1 bg-neon-blue rounded-full blur-[1px]"
        />
      ))}

      {/* Central Atmospheric Pulse */}
      <div className="relative size-[500px] flex items-center justify-center">
        {/* Massive Glow Layers */}
        <motion.div 
          animate={{ scale: isIdle ? 1 : [1, 1.3, 1], opacity: isIdle ? 0.05 : [0.1, 0.25, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute inset-0 bg-neon-blue/20 blur-[120px] rounded-full"
        />
        {!isIdle && (
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            className="absolute inset-20 bg-purple-600/10 blur-[100px] rounded-full"
          />
        )}

        {/* Rotating Energy Rings */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: isIdle ? 40 : 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-[0.5px] border-dashed border-white/10 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: isIdle ? 30 : 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-12 border-[0.5px] border-dashed border-neon-blue/20 rounded-full"
        />

        {/* The Core Orb - Enhanced with CTA */}
        <motion.div 
          onMouseEnter={() => setIsHoveringCore(true)}
          onMouseLeave={() => setIsHoveringCore(false)}
          className="relative size-72 bg-black/60 backdrop-blur-3xl border border-white/20 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,243,255,0.1)] overflow-hidden group cursor-pointer"
          onClick={isIdle ? onStartProject : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue/20 via-transparent to-purple-500/20"></div>
          
          {/* Internal Energy Flow */}
          <motion.div 
            animate={{ 
              background: isIdle 
                ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.02) 0%, transparent 70%)'
                : [
                  'radial-gradient(circle at 50% 50%, rgba(0,243,255,0.1) 0%, transparent 70%)',
                  'radial-gradient(circle at 30% 70%, rgba(168,85,247,0.1) 0%, transparent 70%)',
                  'radial-gradient(circle at 50% 50%, rgba(0,243,255,0.1) 0%, transparent 70%)'
                ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute inset-0"
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <AnimatePresence mode="wait">
              {isIdle && isHoveringCore ? (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <div className="size-16 bg-neon-blue rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                    <Plus size={32} className="text-black" />
                  </div>
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Nuevo Proyecto</p>
                  <p className="text-[8px] text-neon-blue mt-2 font-mono uppercase tracking-widest">Inicializar Pipeline</p>
                </motion.div>
              ) : (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={isIdle ? {} : { 
                      y: [0, -8, 0],
                      filter: ['drop-shadow(0 0 0px #fff)', 'drop-shadow(0 0 10px #00f3ff)', 'drop-shadow(0 0 0px #fff)']
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Cpu size={56} className={`${isIdle ? 'text-neutral-700' : 'text-white'} mb-4`} />
                  </motion.div>
                  <div className="space-y-1">
                    <h3 className="text-5xl font-extralight text-white tracking-tighter">
                      {isIdle ? '00.0' : '99.8'}<span className="text-xl opacity-50">%</span>
                    </h3>
                    <p className={`text-[9px] font-black ${isIdle ? 'text-neutral-700' : 'text-neon-blue'} uppercase tracking-[0.6em]`}>
                      {isIdle ? 'Standby' : 'Integrity'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scanning Line */}
          {!isIdle && (
            <motion.div 
              animate={{ top: ['-20%', '120%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 w-full h-12 bg-gradient-to-b from-transparent via-neon-blue/10 to-transparent"
            />
          )}
        </motion.div>

        {/* Orbiting Status Nodes */}
        {[
          { label: 'Network', val: isIdle ? 'Idle' : 'Active', color: isIdle ? 'bg-neutral-800' : 'bg-emerald-500', angle: 0, icon: <Globe size={10} /> },
          { label: 'Security', val: isIdle ? 'Locked' : 'Shielded', color: isIdle ? 'bg-neutral-800' : 'bg-neon-blue', angle: 120, icon: <ShieldCheck size={10} /> },
          { label: 'Agents', val: isIdle ? 'Waiting' : 'Synced', color: isIdle ? 'bg-neutral-800' : 'bg-purple-500', angle: 240, icon: <Bot size={10} /> },
        ].map((node, i) => {
          const x = Math.cos((node.angle * Math.PI) / 180) * 260;
          const y = Math.sin((node.angle * Math.PI) / 180) * 260;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ x, y, opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.8 + i * 0.2, type: "spring" }}
              className="absolute group cursor-pointer"
            >
              <div className="relative flex flex-col items-center">
                <div className="absolute -inset-4 bg-white/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="size-10 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl flex items-center justify-center mb-3 group-hover:border-white/30 transition-all group-hover:-translate-y-1">
                  <div className={`size-1.5 rounded-full absolute -top-1 -right-1 shadow-[0_0_10px_currentColor]`} style={{ backgroundColor: node.color.replace('bg-', ''), color: node.color.replace('bg-', '') }}></div>
                  <span className="text-white/60 group-hover:text-white transition-colors">{node.icon}</span>
                </div>
                <p className="text-[8px] font-black text-white uppercase tracking-widest mb-0.5">{node.label}</p>
                <p className="text-[10px] font-mono text-neutral-500 group-hover:text-neon-blue transition-colors">{node.val}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Config / Create Entry */}
      {isIdle && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col items-center space-y-8"
        >
          <div className="flex flex-col items-center text-center max-w-md">
            <h2 className="text-2xl font-extralight text-white tracking-tight mb-2">Laboratorio de Desarrollo Autónomo</h2>
            <p className="text-xs text-neutral-500 uppercase tracking-[0.2em] leading-relaxed">
              Inicializa tu primer proyecto para activar los agentes de IA y comenzar la producción de código.
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={onStartProject}
              className="group flex items-center gap-4 px-8 py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-neon-blue transition-all shadow-2xl"
            >
              <Plus size={16} />
              Crear Nuevo Proyecto
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all">
              Ver Tutorial
            </button>
          </div>
        </motion.div>
      )}

      {/* Modern Insight Cards */}
      {!isIdle && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl relative z-10">
          {[
            { label: 'Neural Throughput', value: isIdle ? '0.0' : '1.4k', unit: 'ops/s', desc: 'Optimización de flujo de datos por IA', trend: isIdle ? 'Idle' : '+12%' },
            { label: 'Error Mitigation', value: isIdle ? '00' : '84', unit: '%', desc: 'Reducción proactiva de fallos sistémicos', trend: isIdle ? 'Idle' : 'Stable' },
            { label: 'Active Nodes', value: isIdle ? '0' : '24', unit: 'clones', desc: 'Instancias de agentes en ejecución paralela', trend: isIdle ? 'Idle' : 'Live' },
          ].map((insight, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 + i * 0.2 }}
              className="relative group p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] hover:border-white/10 transition-colors duration-500 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-neon-blue scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
              
              <div className="flex justify-between items-start mb-6">
                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em] group-hover:text-white transition-colors">{insight.label}</p>
                <span className={`text-[8px] font-mono ${isIdle ? 'text-neutral-700 bg-neutral-900' : 'text-neon-blue bg-neon-blue/10'} px-2 py-0.5 rounded-full`}>{insight.trend}</span>
              </div>

              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-extralight text-white tracking-tighter">{insight.value}</span>
                <span className="text-xs font-bold text-neutral-600 uppercase tracking-widest">{insight.unit}</span>
              </div>

              <p className="text-[10px] text-neutral-500 font-medium leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                {insight.desc}
              </p>

              {/* Subtle background graph line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Atmospheric Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none">
        <h1 className="text-[20vw] font-black uppercase tracking-tighter leading-none text-white/[0.02] blur-[2px]">
          OS.CORE
        </h1>
      </div>
    </div>
  );
};

