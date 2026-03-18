import React from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, 
  Globe, 
  ShieldCheck, 
  Bot, 
  Plus, 
  ArrowRight, 
  Activity, 
  Layers, 
  Zap,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface DashboardSectionProps {
  projectsCount: number;
  onStartProject?: () => void;
}

export const DashboardSection = ({ projectsCount, onStartProject }: DashboardSectionProps) => {
  const stats = [
    { label: 'Proyectos Activos', value: projectsCount, icon: Layers, color: 'text-blue-400' },
    { label: 'Agentes en Swarm', value: '7', icon: Bot, color: 'text-purple-400' },
    { label: 'Carga del Sistema', value: '24%', icon: Cpu, color: 'text-emerald-400' },
    { label: 'Uptime Global', value: '99.9%', icon: Activity, color: 'text-neon-blue' },
  ];

  const recentActivity = [
    { id: 1, agent: 'Arquitecto', task: 'Estructura de API definida', time: 'hace 2 min', status: 'success' },
    { id: 2, agent: 'Desarrollador', task: 'Implementación de Auth completada', time: 'hace 15 min', status: 'success' },
    { id: 3, agent: 'Revisor', task: 'Auditoría de seguridad en proceso', time: 'hace 45 min', status: 'pending' },
    { id: 4, agent: 'Director', task: 'Nuevo proyecto inicializado', time: 'hace 1 hora', status: 'success' },
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-12 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-light text-white tracking-tight">Panel de Control</h1>
          <p className="text-neutral-500 text-[10px] uppercase tracking-[0.4em] font-bold">Estado Operativo del Ecosistema de Agentes</p>
        </div>
        <button 
          onClick={onStartProject}
          className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-neon-blue transition-all shadow-lg group"
        >
          <Plus size={14} />
          Nuevo Proyecto
          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[8px] font-mono text-neutral-600 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-3xl font-light text-white mb-1">{stat.value}</p>
            <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Overview Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck size={120} className="text-white" />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Integridad del Núcleo</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                      <span>Eficiencia de Agentes</span>
                      <span>94%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '94%' }}
                        className="h-full bg-neon-blue"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                      <span>Seguridad de Código</span>
                      <span>98%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '98%' }}
                        className="h-full bg-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="size-24 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                    <svg className="absolute inset-0 size-24 -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-neon-blue"
                        strokeDasharray={276}
                        strokeDashoffset={276 * (1 - 0.85)}
                      />
                    </svg>
                    <span className="text-xl font-light text-white">85%</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Optimización</p>
                    <p className="text-[9px] text-neutral-500 leading-relaxed">El sistema está operando en parámetros óptimos de producción.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-6">
              <div className="size-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Zap size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Respuesta Rápida</p>
                <p className="text-[9px] text-neutral-500">Latencia media de agentes: 1.2s</p>
              </div>
            </div>
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-6">
              <div className="size-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Globe size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Nodos Globales</p>
                <p className="text-[9px] text-neutral-500">4 regiones activas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Actividad Reciente</h3>
              <Clock size={14} className="text-neutral-600" />
            </div>

            <div className="space-y-6">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="relative">
                    <div className={`size-2 rounded-full mt-1.5 ${item.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                    {item.id !== recentActivity.length && (
                      <div className="absolute top-4 left-1 w-[1px] h-10 bg-white/5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">{item.agent}</span>
                      <span className="text-[8px] text-neutral-600 font-mono">{item.time}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 group-hover:text-neutral-200 transition-colors">{item.task}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-10 py-3 border border-white/5 rounded-xl text-[9px] font-bold text-neutral-500 uppercase tracking-widest hover:bg-white/5 transition-all">
              Ver Historial Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


