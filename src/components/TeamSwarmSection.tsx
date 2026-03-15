import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Globe, Activity as ActivityIcon, Terminal as TerminalIcon, Code, Bot, User } from 'lucide-react';
import { Project } from '../types';
import { AGENTS } from '../services/agentService';

interface TeamSwarmSectionProps {
  projects: Project[];
}

export const TeamSwarmSection = ({ projects }: TeamSwarmSectionProps) => {
  const isIdle = projects.length === 0;
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '1');
  const [swarmLogs, setSwarmLogs] = useState<{ id: string, agent: string, message: string, type: string, agentId: string, project: string }[]>(
    isIdle ? [] : [
      { id: '1', agentId: 'arquitecto', agent: 'ARCHITECT_CLONE', message: 'Validando consistencia de tipos en el módulo de autenticación.', type: 'arch', project: projects[0]?.title || 'Project' },
      { id: '2', agentId: 'programador', agent: 'DEVELOPER_CLONE', message: 'Implementando hooks reactivos para el estado global.', type: 'logic', project: projects[0]?.title || 'Project' },
      { id: '3', agentId: 'revisor', agent: 'QA_CLONE', message: 'Simulando carga de 10k usuarios concurrentes.', type: 'qa', project: projects[0]?.title || 'Project' },
      { id: '4', agentId: 'revisor', agent: 'SECURITY_CLONE', message: 'Auditando permisos de Firestore en tiempo real.', type: 'sec', project: projects[0]?.title || 'Project' },
    ]
  );
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    sync: isIdle ? 0 : 99.9,
    reduction: isIdle ? 0 : 84,
    optimization: isIdle ? 0 : 92
  });

  const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  useEffect(() => {
    if (isIdle || !selectedProject) return;
    const interval = setInterval(() => {
      const randomAgent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
      const messages = [
        `Sincronizando rama principal de ${selectedProject.title}.`,
        `Detectado posible cuello de botella en el renderizado de ${selectedProject.title}.`,
        `Optimizando consultas a la base de datos para ${selectedProject.title}.`,
        `Refactorizando lógica de validación de esquemas en ${selectedProject.title}.`,
        `Intercambiando contexto de ejecución para reducir errores en ${selectedProject.title}.`,
        `Coordinando despliegue de ${selectedProject.title} en entorno de pruebas.`,
        `Analizando patrones de diseño para escalabilidad de ${selectedProject.title}.`,
        `Validando integridad de datos en el middleware de ${selectedProject.title}.`
      ];
      const types = ['arch', 'logic', 'qa', 'sec'];
      
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        agentId: randomAgent.id,
        agent: `${randomAgent.name.toUpperCase()}_CLONE`,
        message: messages[Math.floor(Math.random() * messages.length)],
        type: types[Math.floor(Math.random() * types.length)],
        project: selectedProject.title
      };

      setActiveAgentId(randomAgent.id);
      setSwarmLogs(prev => [newLog, ...prev.slice(0, 8)]);
      
      setMetrics(prev => ({
        sync: Math.min(100, Math.max(98, prev.sync + (Math.random() - 0.5) * 0.2)),
        reduction: Math.min(100, Math.max(80, prev.reduction + (Math.random() - 0.5) * 1)),
        optimization: Math.min(100, Math.max(85, prev.optimization + (Math.random() - 0.5) * 0.5))
      }));

      setTimeout(() => setActiveAgentId(null), 2000);
    }, 3500);
    return () => clearInterval(interval);
  }, [selectedProjectId, selectedProject?.title]);

  return (
    <div className="max-w-7xl mx-auto w-full space-y-12">
      {/* Systematic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-white/5">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-2 bg-neon-blue rounded-full animate-pulse shadow-[0_0_10px_#00f3ff]"></div>
            <h2 className="text-5xl font-extralight text-white tracking-tighter">Project Swarm</h2>
          </div>
          <p className="text-neutral-500 text-[10px] uppercase tracking-[0.5em] font-black">
            {isIdle ? 'Esperando inicialización de proyecto...' : <>Orquestación de Agentes IA para: <span className="text-white">{selectedProject?.title}</span></>}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Sincronización', value: metrics.sync.toFixed(1), color: isIdle ? 'text-neutral-700' : 'text-emerald-500' },
            { label: 'Reducción Errores', value: metrics.reduction.toFixed(0), color: isIdle ? 'text-neutral-700' : 'text-neon-blue' },
            { label: 'Optimización', value: metrics.optimization.toFixed(0), color: isIdle ? 'text-neutral-700' : 'text-purple-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl min-w-[140px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-2">{stat.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-light text-white">{stat.value}</span>
                <span className={`text-[10px] ${stat.color} mb-1 font-bold tracking-tighter`}>%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Project Selector Sidebar */}
        <div className="space-y-6">
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-6">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">Proyectos en Ejecución</h3>
            <div className="space-y-3">
              {isIdle ? (
                <div className="p-8 border border-dashed border-white/5 rounded-2xl text-center">
                  <p className="text-[9px] text-neutral-600 uppercase font-black tracking-widest">Sin proyectos activos</p>
                </div>
              ) : projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 group ${
                    selectedProjectId === project.id 
                    ? 'bg-neon-blue/10 border-neon-blue/40 shadow-[0_0_20px_rgba(0,243,255,0.1)]' 
                    : 'bg-black/40 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                      selectedProjectId === project.id ? 'text-neon-blue' : 'text-neutral-400'
                    }`}>
                      {project.title}
                    </span>
                    {selectedProjectId === project.id && (
                      <div className="size-1.5 bg-neon-blue rounded-full animate-pulse shadow-[0_0_8px_#00f3ff]"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${selectedProjectId === project.id ? 'bg-neon-blue' : 'bg-neutral-700'}`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-[8px] font-mono text-neutral-600">{project.progress}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-white">
              <ActivityIcon size={16} className="text-neon-blue" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Estado Global</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-neutral-500 uppercase font-black">Carga de Trabajo</span>
                <span className="text-[10px] text-white font-mono">74%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[74%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Neural Network Visualization - Central Hub */}
        <div className="xl:col-span-3 space-y-8">
          <div className="relative aspect-[21/9] bg-black/60 rounded-[2.5rem] border border-white/10 overflow-hidden group shadow-2xl">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20" style={{ 
              backgroundImage: 'radial-gradient(circle, #ffffff10 1px, transparent 1px)', 
              backgroundSize: '30px 30px' 
            }}></div>
            
            {/* Systematic Interaction Area */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full max-w-4xl max-h-[400px]">
                {/* Central Processing Core */}
                <div className="absolute inset-0 m-auto size-48 flex items-center justify-center">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: 360
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-white/5 rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute size-32 bg-neon-blue/20 blur-3xl rounded-full"
                  />
                  <div className="relative z-10 flex flex-col items-center">
                    <Cpu size={32} className="text-neon-blue mb-2 animate-pulse" />
                    <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">{selectedProject?.title}_CORE</span>
                  </div>
                </div>

                {/* Nodes (Agents) in a Systematic Grid/Circle */}
                {AGENTS.map((agent, i) => {
                  const angle = (i * 360) / AGENTS.length;
                  const radius = 180;
                  const x = Math.cos((angle * Math.PI) / 180) * radius;
                  const y = Math.sin((angle * Math.PI) / 180) * radius;
                  const isActive = activeAgentId === agent.id;

                  return (
                    <div key={agent.id} className="absolute inset-0 m-auto pointer-events-none">
                      {/* Connection Line to Core */}
                      <div 
                        className="absolute top-1/2 left-1/2 h-[1px] origin-left transition-all duration-700"
                        style={{ 
                          width: `${radius}px`,
                          transform: `rotate(${angle}deg)`,
                          background: isActive 
                            ? 'linear-gradient(90deg, #00f3ff 0%, transparent 100%)' 
                            : 'rgba(255,255,255,0.05)'
                        }}
                      >
                        {/* Data Stream Particle */}
                        {isActive && (
                          <motion.div 
                            initial={{ left: 0 }}
                            animate={{ left: '100%' }}
                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                            className="absolute top-1/2 -translate-y-1/2 size-1 bg-white rounded-full shadow-[0_0_8px_#fff]"
                          />
                        )}
                      </div>

                      {/* Agent Node */}
                      <motion.div
                        animate={{ 
                          x: x, 
                          y: y,
                          scale: isActive ? 1.2 : 1
                        }}
                        className="absolute inset-0 m-auto size-16 pointer-events-auto"
                      >
                        <div className={`relative size-full rounded-2xl bg-black/80 backdrop-blur-xl border transition-all duration-500 flex items-center justify-center group/node ${
                          isActive ? 'border-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.3)]' : 'border-white/10 hover:border-white/30'
                        }`}>
                          <User size={24} className={`transition-colors duration-500 ${isActive ? 'text-neon-blue' : 'text-neutral-500'}`} />
                          
                          {/* Node Label */}
                          <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                            <p className="text-[8px] font-black text-white uppercase tracking-widest bg-black/60 px-2 py-1 rounded border border-white/5">{agent.name}</p>
                          </div>

                          {/* Activity Pulse */}
                          {isActive && (
                            <motion.div 
                              initial={{ scale: 1, opacity: 0.5 }}
                              animate={{ scale: 2, opacity: 0 }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="absolute inset-0 border border-neon-blue rounded-2xl"
                            />
                          )}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Systematic Overlays */}
            <div className="absolute top-8 left-8 flex flex-col gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] text-white font-black uppercase tracking-widest">Swarm_Status: Active_{selectedProject?.title}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
                <ActivityIcon size={10} className="text-neon-blue" />
                <span className="text-[8px] text-neutral-400 font-black uppercase tracking-widest">Throughput: 1.4k ops/s</span>
              </div>
            </div>

            <div className="absolute bottom-8 right-8">
              <div className="px-6 py-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl">
                <p className="text-[8px] text-neutral-500 uppercase font-black mb-1">Coordinación en Tiempo Real</p>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {AGENTS.slice(0, 3).map((_, i) => (
                      <div key={i} className="size-5 rounded-full bg-white/10 border border-black flex items-center justify-center">
                        <User size={10} className="text-white/40" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-white">Active_Sync_Mesh</span>
                </div>
              </div>
            </div>
          </div>

          {/* Systematic Activity Log */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TerminalIcon size={14} className="text-neon-blue" />
                  <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Protocolo de Interacción: {selectedProject?.title}</h3>
                </div>
                <span className="text-[8px] text-neutral-600 font-mono">v4.2.0_STABLE</span>
              </div>
              
              <div className="space-y-3 h-48 overflow-y-auto custom-scrollbar pr-4">
                <AnimatePresence mode="popLayout">
                  {swarmLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${
                        activeAgentId === log.agentId ? 'bg-neon-blue/5 border-neon-blue/20' : 'bg-white/[0.01] border-white/5'
                      }`}
                    >
                      <div className={`size-6 rounded flex items-center justify-center shrink-0 ${
                        log.type === 'arch' ? 'text-purple-400' :
                        log.type === 'logic' ? 'text-neon-blue' :
                        log.type === 'qa' ? 'text-emerald-400' :
                        'text-amber-400'
                      }`}>
                        <Code size={12} />
                      </div>
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <p className="text-[9px] font-black text-white uppercase tracking-widest shrink-0">{log.agent}</p>
                        <p className="text-[10px] text-neutral-500 truncate text-right">{log.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Optimización IA</h3>
                <div className="space-y-6">
                  {[
                    { label: 'Refactorización', val: 78 },
                    { label: 'Seguridad', val: 94 },
                    { label: 'Performance', val: 88 }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                        <span className="text-neutral-500">{item.label}</span>
                        <span className="text-white">{item.val}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.val}%` }}
                          className="h-full bg-neon-blue"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="mt-8 w-full py-3 bg-white/5 border border-white/10 text-[9px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-xl">
                Ver Reporte Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
