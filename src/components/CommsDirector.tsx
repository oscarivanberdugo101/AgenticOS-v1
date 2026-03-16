import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Paperclip, 
  X, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Plus,
  Rocket,
  Activity as ActivityIcon,
  Settings,
  ChevronRight,
  Folder,
  ChevronDown
} from 'lucide-react';
import { AGENTS } from '../services/agentService';
import { Project } from '../types';

interface CommsDirectorProps {
  stage: 'discovery' | 'kickoff' | 'development';
  chatMessages: any[];
  streamingText: string;
  activeAgentId: string | null;
  attachments: any[];
  setAttachments: (attachments: any) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: (msg?: string | React.MouseEvent) => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  discoveryBrief: string | null;
  startKickoff: () => void;
  kickoffMessages: any[];
  isPipelineRunning: boolean;
  runDevelopmentPipeline: () => void;
  projects?: Project[];
  activeProjectId?: string | null;
  onSelectProject?: (id: string) => void;
  onStartProject?: (config: any) => Promise<string>;
}

export const CommsDirector = ({ 
  stage, chatMessages, streamingText, activeAgentId, 
  attachments, setAttachments, handleFileUpload, 
  handleSendMessage, chatEndRef,
  discoveryBrief, startKickoff, kickoffMessages, isPipelineRunning, runDevelopmentPipeline,
  projects = [], activeProjectId, onSelectProject, onStartProject
}: CommsDirectorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localInput, setLocalInput] = useState("");
  const [showConfigForm, setShowConfigForm] = useState(chatMessages.length === 0);
  const [isStarting, setIsStarting] = useState(false);
  const [config, setConfig] = useState({
    name: '',
    description: '',
    frontend: 'Next.js',
    backend: 'Node.js',
    database: 'PostgreSQL',
    styling: 'Tailwind CSS',
    features: [] as string[]
  });

  const handleStartDiscovery = async () => {
    if (!config.name || !config.description) return;
    
    const initialMessage = `Hola, quiero iniciar un nuevo proyecto llamado "${config.name}". 
    
Descripción: ${config.description} 

Stack Tecnológico Seleccionado:
- Frontend: ${config.frontend}
- Backend: ${config.backend}
- Base de Datos: ${config.database}
- Estilizado: ${config.styling}
${config.features.length > 0 ? `- Características adicionales: ${config.features.join(', ')}` : ''}`;

    setIsStarting(true);
    try {
      if (onStartProject) {
        await onStartProject(config);
      }
      
      setShowConfigForm(false);
      
      // Wait a tiny bit for the state to settle, then send the message
      setTimeout(() => {
        handleSendMessage(initialMessage);
      }, 100);
    } catch (err) {
      console.error("Failed to start project:", err);
    } finally {
      setIsStarting(false);
    }
  };

  const toggleFeature = (feature: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(feature) 
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6">
      {stage === 'discovery' && !showConfigForm && projects.length > 0 && (
        <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/20">
              <Folder className="text-neon-blue" size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Contexto del Proyecto</p>
              <div className="relative group">
                <select 
                  value={activeProjectId || ''}
                  onChange={(e) => onSelectProject?.(e.target.value)}
                  className="bg-transparent text-white text-sm font-bold appearance-none pr-8 focus:ring-0 border-none cursor-pointer"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id} className="bg-neutral-900">{p.title}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 pr-4">
            <div className="text-right">
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Estado de Memoria</p>
              <p className="text-[10px] text-emerald-500 font-mono">SINCRONIZADO</p>
            </div>
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
        </div>
      )}

      {stage === 'discovery' && (
        <div className="flex flex-col h-[700px]">
          <AnimatePresence mode="wait">
            {showConfigForm ? (
              <motion.div 
                key="config-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                <div className="w-full max-w-xl bg-white/[0.02] border border-white/10 rounded-[2.5rem] p-12 space-y-8 backdrop-blur-xl shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="size-12 bg-neon-blue/20 border border-neon-blue/40 rounded-2xl flex items-center justify-center">
                      <Settings className="text-neon-blue" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extralight text-white tracking-tight">Configuración Inicial</h2>
                      <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em]">Define los parámetros base del proyecto</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nombre del Proyecto</label>
                      <input 
                        type="text"
                        value={config.name}
                        onChange={(e) => setConfig({...config, name: e.target.value})}
                        placeholder="Ej: E-commerce Global"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Descripción General</label>
                      <textarea 
                        value={config.description}
                        onChange={(e) => setConfig({...config, description: e.target.value})}
                        placeholder="¿Qué quieres construir? Describe la funcionalidad principal..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-sm focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-300 min-h-[120px] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Frontend</label>
                        <select 
                          value={config.frontend}
                          onChange={(e) => setConfig({...config, frontend: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-300 appearance-none"
                        >
                          <option value="Next.js">Next.js</option>
                          <option value="React (Vite)">React (Vite)</option>
                          <option value="Vue.js">Vue.js</option>
                          <option value="Angular">Angular</option>
                          <option value="Svelte">Svelte</option>
                          <option value="None">Sin Frontend</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Backend</label>
                        <select 
                          value={config.backend}
                          onChange={(e) => setConfig({...config, backend: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-300 appearance-none"
                        >
                          <option value="Node.js (Express)">Node.js (Express)</option>
                          <option value="Python (FastAPI)">Python (FastAPI)</option>
                          <option value="Go">Go (Golang)</option>
                          <option value="Rust">Rust</option>
                          <option value="None">Sin Backend</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Base de Datos</label>
                        <select 
                          value={config.database}
                          onChange={(e) => setConfig({...config, database: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-300 appearance-none"
                        >
                          <option value="PostgreSQL">PostgreSQL</option>
                          <option value="MongoDB">MongoDB</option>
                          <option value="SQLite">SQLite</option>
                          <option value="Redis">Redis</option>
                          <option value="Firebase">Firebase</option>
                          <option value="None">Sin DB</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Estilizado</label>
                        <select 
                          value={config.styling}
                          onChange={(e) => setConfig({...config, styling: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-xs focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all duration-300 appearance-none"
                        >
                          <option value="Tailwind CSS">Tailwind CSS</option>
                          <option value="Shadcn UI">Shadcn UI</option>
                          <option value="Material UI">Material UI</option>
                          <option value="CSS Modules">CSS Modules</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest ml-1">Características Adicionales</label>
                      <div className="flex flex-wrap gap-2">
                        {['Autenticación', 'Docker', 'Testing', 'CI/CD', 'PWA', 'SEO'].map((feature) => (
                          <button
                            key={feature}
                            onClick={() => toggleFeature(feature)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                              config.features.includes(feature)
                                ? 'bg-neon-blue/20 border-neon-blue text-neon-blue'
                                : 'bg-white/5 border-white/10 text-neutral-500 hover:border-white/20'
                            }`}
                          >
                            {feature}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleStartDiscovery}
                    disabled={!config.name || !config.description || isStarting}
                    className="w-full py-5 bg-neon-blue text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-white transition-all shadow-[0_0_30px_rgba(0,242,255,0.2)] disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Iniciando...
                      </>
                    ) : (
                      <>
                        Iniciar Consultoría
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-4 custom-scrollbar">
                  {chatMessages.length === 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="w-10 h-10 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                        <User size={20} className="text-neon-blue" />
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none p-5 text-sm text-neutral-300 leading-relaxed shadow-2xl backdrop-blur-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-blue mb-3">Director de Proyectos · Consultoría</p>
                        Bienvenido al Laboratorio. Soy el <strong>Director de Proyectos</strong>. 
                        Mi misión es realizar una consultoría profunda para definir los cimientos de tu software.
                        <br/><br/>
                        ¿Qué visión tienes hoy? Cuéntame los detalles o adjunta tus documentos de referencia.
                      </div>
                    </motion.div>
                  )}
                  {chatMessages.map((msg: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex gap-4 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-white/10 border border-white/20' : 'bg-neon-blue/20 border border-neon-blue/40 shadow-[0_0_15px_rgba(0,242,255,0.2)]'}`}>
                        {msg.role === 'user' ? <User size={20} className="text-white" /> : <User size={20} className="text-neon-blue" />}
                      </div>
                      <div className={`max-w-[75%] p-5 text-sm leading-relaxed shadow-2xl backdrop-blur-sm ${msg.role === 'user' ? 'bg-white/5 border border-white/10 rounded-2xl rounded-tr-none text-white' : 'bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none text-neutral-300'}`}>
                        {msg.role !== 'user' && <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neon-blue mb-2">Director</p>}
                        {msg.content.replace("DISCOVERY_COMPLETO", "")}
                      </div>
                    </motion.div>
                  ))}
                  {activeAgentId === 'director' && streamingText && (
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-neon-blue" />
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tl-none p-5 text-sm text-neutral-300 leading-relaxed shadow-2xl">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neon-blue mb-2">Director escribiendo...</p>
                        {streamingText}
                        <span className="inline-block w-1.5 h-4 bg-neon-blue ml-1 animate-pulse align-middle" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="relative bg-neutral-900/50 p-4 rounded-2xl border border-white/5 shadow-2xl">
                  <div className="mb-2 px-4 flex justify-between items-center">
                    <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Canal de Comunicación Directa</p>
                    <p className="text-[8px] font-black text-neon-blue/60 uppercase tracking-widest animate-pulse">Presiona Enter para enviar</p>
                  </div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {attachments.map((att: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-neon-blue/10 border border-neon-blue/20 rounded-full text-[10px] text-neon-blue">
                        <FileCode size={12} />
                        {att.name}
                        <button 
                          onClick={() => setAttachments((prev: any) => prev.filter((_: any, idx: number) => idx !== i))}
                          className="hover:text-white transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 relative">
                      <textarea 
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (localInput.trim() || attachments.length > 0) {
                              handleSendMessage(localInput);
                              setLocalInput("");
                            }
                          }
                        }}
                        placeholder="Describe tu proyecto o haz una pregunta..."
                        className="w-full bg-transparent border-none focus:ring-0 text-white text-sm py-3 px-4 resize-none min-h-[50px] max-h-[200px] custom-scrollbar"
                      />
                    </div>
                    <div className="flex gap-2 pb-2 pr-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-xl transition-all"
                        title="Adjuntar Archivos"
                      >
                        <Plus size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          handleSendMessage(localInput);
                          setLocalInput("");
                        }}
                        disabled={!localInput.trim() && attachments.length === 0}
                        className="p-2.5 bg-neon-blue text-black rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,242,255,0.3)]"
                        title="Enviar Mensaje (Enter)"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    multiple
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {stage === 'kickoff' && (
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <div className="size-20 bg-neon-blue/20 border border-neon-blue/40 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,242,255,0.2)]">
              <Rocket size={32} className="text-neon-blue" />
            </div>
            <h2 className="text-4xl font-extralight text-white tracking-tighter">Kickoff del Proyecto</h2>
            <p className="text-neutral-500 text-xs uppercase tracking-[0.4em] font-black">Sincronización de Agentes Especialistas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Brief Consolidado</h3>
              <div className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap font-mono bg-black/40 p-6 rounded-2xl border border-white/5 h-[300px] overflow-y-auto custom-scrollbar">
                {discoveryBrief}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] space-y-6">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Confirmación de Agentes</h3>
              <div className="space-y-4 h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {kickoffMessages.map((msg: any, i: number) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="flex gap-4 items-start p-4 bg-white/[0.03] border border-white/5 rounded-2xl"
                  >
                    <div className="size-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${msg.color}20`, border: `1px solid ${msg.color}40` }}>
                      <Bot size={16} style={{ color: msg.color }} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: msg.color }}>{msg.agent}</p>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                ))}
                {activeAgentId && !kickoffMessages.find((m: any) => m.agent === AGENTS.find(a => a.id === activeAgentId)?.name) && (
                  <div className="flex gap-4 items-start p-4 bg-white/[0.03] border border-white/5 rounded-2xl animate-pulse">
                    <div className="size-8 bg-white/10 rounded-lg shrink-0" />
                    <div className="space-y-2 flex-1">
                      <div className="h-2 bg-white/10 rounded w-1/3" />
                      <div className="h-2 bg-white/10 rounded w-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={runDevelopmentPipeline}
              disabled={isPipelineRunning || kickoffMessages.length < 3}
              className="px-12 py-5 bg-neon-blue text-black text-xs font-black uppercase tracking-[0.5em] hover:bg-white transition-all rounded-2xl shadow-[0_0_40px_rgba(0,242,255,0.3)] disabled:opacity-50"
            >
              {isPipelineRunning ? 'Generando Software...' : 'Iniciar Desarrollo'}
            </button>
          </div>
        </div>
      )}

      {stage === 'development' && (
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <div className="size-20 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <ActivityIcon size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-4xl font-extralight text-white tracking-tighter">Fase de Desarrollo</h2>
            <p className="text-neutral-500 text-xs uppercase tracking-[0.4em] font-black">Producción de Artefactos de Software</p>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Pipeline en Ejecución</h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">v1.0.4_PROD</span>
            </div>

            <div className="space-y-8">
              {AGENTS.filter(a => a.id !== 'director').map((agent, i) => {
                const isActive = activeAgentId === agent.id;
                
                return (
                  <div key={agent.id} className="relative">
                    <div className="flex items-center gap-6">
                      <div className={`size-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40 shadow-[0_0_20px_rgba(0,242,255,0.2)] scale-110' : 'bg-white/5 text-neutral-600 border border-white/10'}`}>
                        <Bot size={24} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-end">
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-neutral-600'}`}>
                            {agent.name}
                          </p>
                          <span className="text-[9px] font-mono text-neutral-500">{isActive ? 'PROCESANDO...' : 'EN ESPERA'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: isActive ? '60%' : '0%' }}
                            className={`h-full bg-neon-blue`}
                          />
                        </div>
                      </div>
                    </div>
                    {i < AGENTS.filter(a => a.id !== 'director').length - 1 && (
                      <div className="absolute left-6 top-12 w-[1px] h-8 bg-white/5"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
