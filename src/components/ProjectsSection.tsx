import React from 'react';
import { motion } from 'motion/react';
import { Database, FileCode, List as ListIcon, LayoutGrid, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Project } from '../types';

interface ProjectsSectionProps {
  projects: Project[];
  artifacts: Record<string, string>;
  downloadZip: () => void;
  resetProject: () => void;
  setActiveTab: (tab: any) => void;
  activeProjectId?: string | null;
  projectArtifacts?: Record<string, Record<string, string>>;
}

export const ProjectsSection = ({ 
  projects, artifacts, downloadZip, resetProject, setActiveTab,
  activeProjectId, projectArtifacts 
}: ProjectsSectionProps) => {
  return (
    <div className="max-w-7xl mx-auto w-full space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-white/5">
        <div className="space-y-4">
          <h2 className="text-5xl font-extralight text-white tracking-tighter">Proyectos</h2>
          <p className="text-neutral-500 text-[10px] uppercase tracking-[0.5em] font-black">Central de Consolidación de Software</p>
        </div>
        
        <div className="flex flex-wrap gap-6">
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl min-w-[140px]">
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-2">Total Proyectos</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-white">{projects.length}</span>
              <span className="text-[10px] text-emerald-500 mb-1 font-bold">+12%</span>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl min-w-[140px]">
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-2">Agentes Activos</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-white">24</span>
              <span className="text-[10px] text-neon-blue mb-1 font-bold">Live</span>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl min-w-[140px]">
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-2">Salud Sistema</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-light text-white">99.8</span>
              <span className="text-[10px] text-emerald-500 mb-1 font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Repositorio de Artefactos</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-all">
                <ListIcon size={14} />
              </button>
              <button className="p-2 bg-white/5 border border-white/10 rounded-lg text-neutral-500 hover:text-white transition-all">
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(artifacts).length > 0 ? (
              Object.entries(artifacts).map(([path, content], i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white/[0.02] border border-white/5 p-6 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-neon-blue transition-colors">
                      <FileCode size={20} />
                    </div>
                    <div className="size-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                  </div>
                  <h4 className="text-white text-sm font-medium mb-1 truncate">{path}</h4>
                  <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">
                    {path.split('.').pop()?.toUpperCase()} SOURCE
                  </p>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] text-neutral-600 font-mono">{(content as string).length} bytes</span>
                    <button className="text-[9px] text-neon-blue font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver Código
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-2 py-20 text-center space-y-4 bg-white/[0.01] border border-dashed border-white/5 rounded-[2rem]">
                <div className="size-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-neutral-700">
                  <Database size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-white text-sm font-medium">No hay artefactos generados</p>
                  <p className="text-neutral-500 text-xs">Inicia un proyecto con el Director para ver resultados aquí.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Resumen de Entrega</h3>
              <RefreshCw size={14} className="text-neutral-600" />
            </div>
            
            {Object.keys(artifacts).length > 0 ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-neutral-500">Progreso de Compilación</span>
                    <span className="text-white">100%</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-neon-blue shadow-[0_0_10px_#00f3ff]"></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Arquitectura Validada</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-500">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Lógica de Negocio Lista</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-500">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Tests de Seguridad OK</span>
                  </div>
                </div>

                <button 
                  onClick={downloadZip}
                  className="w-full py-4 bg-white text-black text-[9px] font-black uppercase tracking-[0.4em] hover:bg-neon-blue transition-all rounded-xl"
                >
                  Descargar Paquete ZIP
                </button>
                
                <button 
                  onClick={resetProject}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-[0.4em] hover:bg-red-500/20 hover:border-red-500/40 transition-all rounded-xl"
                >
                  Reiniciar Laboratorio
                </button>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-[10px] text-neutral-500 leading-relaxed">
                  El enjambre de agentes está esperando instrucciones para comenzar la fase de desarrollo.
                </p>
                <button 
                  onClick={() => setActiveTab('comms')}
                  className="text-[9px] font-black text-neon-blue uppercase tracking-widest border-b border-neon-blue/30 pb-1"
                >
                  Ir al Director
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
