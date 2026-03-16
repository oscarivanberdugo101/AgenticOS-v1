/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal as TerminalIcon, 
  Search, 
  Bell, 
  Settings, 
  FolderOpen, 
  MessageSquare, 
  Users, 
  Calendar, 
  ChevronDown, 
  Plus, 
  Activity as ActivityIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  LayoutGrid, 
  List as ListIcon, 
  Smartphone, 
  Layout, 
  MoreVertical, 
  Code, 
  Database, 
  Cloud, 
  X,
  GripHorizontal,
  Bot,
  Folder,
  FileCode,
  User,
  Zap,
  Rocket,
  Building2,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Globe,
  Send,
  ChevronRight,
  Github,
  MessageCircle,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Project, LogEntry, Activity } from './types';
import { AgentOrchestrator, AGENTS } from './services/agentService';
import { DashboardSection } from './components/DashboardSection';
import { MinimalLanding } from './components/MinimalLanding';
import { ProjectsSection } from './components/ProjectsSection';
import { TeamSwarmSection } from './components/TeamSwarmSection';
import { CommsDirector } from './components/CommsDirector';
import { TutorialSection } from './components/TutorialSection';
import { CodeViewer } from './components/CodeViewer';
import { SidebarItem, SidebarGroup, SidebarSubItem, SidebarFolder } from './components/Sidebar';
import { SerafinaFloatingAgent } from './components/SerafinaFloatingAgent';
import { BotLine } from './components/BotLine';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  addDoc, 
  query, 
  orderBy, 
  getDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';

const INITIAL_PROJECTS: Project[] = [];

const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: '12:44:02', agent: 'AGENT_LOGIC', message: "Synthesizing backend schemas for 'Mobile Finance App'...", type: 'logic' },
  { id: '2', timestamp: '12:44:05', agent: 'AGENT_ARCH', message: 'Refactoring component hierarchy in /src/ui/layout.tsx', type: 'arch' },
  { id: '3', timestamp: '12:44:08', agent: 'AGENT_QA', message: 'Unit test pass: 142/142. Coverage 94.2%.', type: 'qa' },
  { id: '4', timestamp: '12:44:12', agent: 'AGENT_SEC', message: 'Scanning dependencies for CVE vulnerabilities... No issues found.', type: 'sec' },
  { id: '5', timestamp: '12:44:15', agent: 'AGENT_LOGIC', message: 'New node initialized. Memory allocation optimized.', type: 'logic' },
];

const ACTIVITIES: Activity[] = [
  { id: '1', user: 'Alex', initials: 'AL', action: 'modified', target: 'Mobile Finance App', time: '02:14 UTC' },
  { id: '2', user: 'Sarah', initials: 'SR', action: 'approved', target: 'Portal', time: '01:45 UTC' },
];

export default function App() {
  console.log("App component rendering");
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectChats, setProjectChats] = useState<Record<string, {role: 'user' | 'assistant', content: string}[]>>({});
  const [projectStages, setProjectStages] = useState<Record<string, 'discovery' | 'kickoff' | 'development'>>({});
  const [projectBriefs, setProjectBriefs] = useState<Record<string, string | null>>({});
  const [projectKickoffMessages, setProjectKickoffMessages] = useState<Record<string, {agent: string, content: string, color: string}[]>>({});
  const [projectArtifacts, setProjectArtifacts] = useState<Record<string, Record<string, string>>>({});
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [nodeLoad, setNodeLoad] = useState(72);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'running' | 'waiting'>('running');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const sidebarTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSidebarMouseEnter = () => {
    if (sidebarTimeoutRef.current) clearTimeout(sidebarTimeoutRef.current);
    setIsSidebarExpanded(true);
  };

  const handleSidebarMouseLeave = () => {
    sidebarTimeoutRef.current = setTimeout(() => {
      setIsSidebarExpanded(false);
    }, 200);
  };
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
  const [artifacts, setArtifacts] = useState<Record<string, string>>({});
  const [discoveryBrief, setDiscoveryBrief] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [attachments, setAttachments] = useState<{name: string, content: string, type: string}[]>([]);
  const [isDiscoveryComplete, setIsDiscoveryComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'comms' | 'team' | 'tutorial'>('dashboard');
  const [stage, setStage] = useState<'discovery' | 'kickoff' | 'development'>('discovery');
  const [kickoffMessages, setKickoffMessages] = useState<{agent: string, content: string, color: string}[]>([]);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [modelSource, setModelSource] = useState<'cloud' | 'local'>('local'); // Default to local as requested
  const [orchestrator, setOrchestrator] = useState(() => new AgentOrchestrator('local'));
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const dragControls = useDragControls();

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, streamingText]);

  useEffect(() => {
    setOrchestrator(new AgentOrchestrator(modelSource));
  }, [modelSource]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDiscoveryChat();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file as Blob);

      try {
        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        setAttachments(prev => [...prev, { name: (file as File).name, content: data.content, type: (file as File).type }]);
      } catch (err) {
        console.error("File upload error:", err);
      }
    }
  };

  const buildAttachmentsContext = () => {
    if (attachments.length === 0) return "";
    let context = "\n\n--- DOCUMENTOS ADJUNTOS ---\n";
    attachments.forEach(att => {
      context += `ARCHIVO: ${att.name}\nCONTENIDO: ${att.content}\n\n`;
    });
    return context;
  };

  // Load projects from Firebase
  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('lastUpdated', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Project));
      setProjects(projectsData);
    }, (error) => {
      console.error("Firestore Error (projects):", error);
    });

    return () => unsubscribe();
  }, []);

  // Load project-specific data when activeProjectId changes
  useEffect(() => {
    if (!activeProjectId) return;

    // Load chats
    const chatUnsubscribe = onSnapshot(
      query(collection(db, `projects/${activeProjectId}/chats`), orderBy('timestamp', 'asc')),
      (snapshot) => {
        const messages = snapshot.docs.map(doc => doc.data() as {role: 'user' | 'assistant', content: string});
        setProjectChats(prev => ({ ...prev, [activeProjectId]: messages }));
      }
    );

    // Load artifacts
    const artifactUnsubscribe = onSnapshot(
      collection(db, `projects/${activeProjectId}/artifacts`),
      (snapshot) => {
        const artifactsMap: Record<string, string> = {};
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          artifactsMap[data.path] = data.content;
        });
        setProjectArtifacts(prev => ({ ...prev, [activeProjectId]: artifactsMap }));
      }
    );

    // Load project metadata (stage, brief)
    const projectRef = doc(db, 'projects', activeProjectId);
    getDoc(projectRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setProjectStages(prev => ({ ...prev, [activeProjectId]: data.stage || 'discovery' }));
        setProjectBriefs(prev => ({ ...prev, [activeProjectId]: data.brief || null }));
      }
    });

    return () => {
      chatUnsubscribe();
      artifactUnsubscribe();
    };
  }, [activeProjectId]);

  const handleDiscoveryChat = async (messageOverride?: string | React.MouseEvent) => {
    const userMsg = typeof messageOverride === 'string' ? messageOverride : '';
    if (!userMsg || isPipelineRunning) return;
    
    const attContext = buildAttachmentsContext();
    
    const history = activeProjectId ? (projectChats[activeProjectId] || []) : chatMessages;
    const historyContext = history.slice(-5).map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
    const fullMsg = historyContext 
      ? `HISTORIAL RECIENTE:\n${historyContext}\n\nNUEVO MENSAJE:\n${userMsg}${attContext}`
      : userMsg + attContext;

    // Save user message to Firebase if project exists
    if (activeProjectId) {
      addDoc(collection(db, `projects/${activeProjectId}/chats`), {
        role: 'user',
        content: userMsg,
        timestamp: serverTimestamp(),
        projectId: activeProjectId
      });
    }

    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setAttachments([]);
    setIsPipelineRunning(true);
    setActiveAgentId('director');
    setStreamingText("");

    try {
      const result = await orchestrator.runAgent('director', fullMsg, (token) => {
        setStreamingText(prev => prev + token);
      });

      // Save assistant message to Firebase
      if (activeProjectId) {
        addDoc(collection(db, `projects/${activeProjectId}/chats`), {
          role: 'assistant',
          content: result.text,
          timestamp: serverTimestamp(),
          projectId: activeProjectId
        });
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: result.text }]);
      
      if (result.text.includes("DISCOVERY_COMPLETO") || chatMessages.length > 6) {
        const brief = result.text.split("DISCOVERY_COMPLETO")[1]?.trim() || result.text;
        setDiscoveryBrief(brief);
        setIsDiscoveryComplete(true);
        setStage('kickoff');

        if (activeProjectId) {
          setProjectBriefs(prev => ({ ...prev, [activeProjectId]: brief }));
          setProjectStages(prev => ({ ...prev, [activeProjectId]: 'kickoff' }));
          
          // Update project in Firestore
          setDoc(doc(db, 'projects', activeProjectId), {
            brief,
            stage: 'kickoff',
            lastUpdated: new Date().toISOString()
          }, { merge: true });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsPipelineRunning(false);
      setActiveAgentId(null);
      setStreamingText("");
    }
  };

  const runKickoff = async () => {
    const brief = activeProjectId ? (projectBriefs[activeProjectId] || discoveryBrief) : discoveryBrief;
    if (!brief) return;
    setIsPipelineRunning(true);
    setKickoffMessages([]);
    
    const kickoffAgents = AGENTS.filter(a => a.id !== 'director');
    
    for (const agent of kickoffAgents) {
      setActiveAgentId(agent.id);
      const prompt = `Como ${agent.role}, analiza este brief y di cómo vas a contribuir al proyecto: ${brief}`;
      
      try {
        const result = await orchestrator.runAgent(agent.id, prompt, (token) => {
          setStreamingText(prev => prev + token);
        });
        setKickoffMessages(prev => [...prev, { agent: agent.name, content: result.text, color: agent.color }]);
        
        if (activeProjectId) {
          setProjectKickoffMessages(prev => ({
            ...prev,
            [activeProjectId]: [...(prev[activeProjectId] || []), { agent: agent.name, content: result.text, color: agent.color }]
          }));
          
          // Save kickoff message to Firebase
          addDoc(collection(db, `projects/${activeProjectId}/chats`), {
            role: 'assistant',
            content: `[KICKOFF - ${agent.name}]: ${result.text}`,
            timestamp: serverTimestamp(),
            projectId: activeProjectId
          });
        }
        setStreamingText("");
      } catch (err) {
        console.error(err);
      }
    }
    
    setIsPipelineRunning(false);
    setActiveAgentId(null);
  };

  const runPipeline = async () => {
    const brief = activeProjectId ? (projectBriefs[activeProjectId] || discoveryBrief) : discoveryBrief;
    if (!brief || !activeProjectId) return;
    
    setStage('development');
    setProjectStages(prev => ({ ...prev, [activeProjectId]: 'development' }));
    
    // Update stage in Firestore
    setDoc(doc(db, 'projects', activeProjectId), {
      stage: 'development',
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    setIsPipelineRunning(true);
    setArtifacts({});
    
    const devAgents = AGENTS.filter(a => a.id !== 'director');
    
    for (const agent of devAgents) {
      setActiveAgentId(agent.id);
      const prompt = `DESARROLLO: Basado en el brief consolidado: ${brief}. Genera los archivos correspondientes a tu rol (${agent.role}).`;
      
      try {
        const result = await orchestrator.runAgent(agent.id, prompt, (token) => {
          setStreamingText(prev => prev + token);
        });
        
        if (result.files) {
          setArtifacts(prev => ({ ...prev, ...result.files }));
          
          // Save artifacts to Firestore
          for (const [path, content] of Object.entries(result.files)) {
            const artifactId = path.replace(/\//g, '_');
            setDoc(doc(db, `projects/${activeProjectId}/artifacts`, artifactId), {
              projectId: activeProjectId,
              path,
              content,
              timestamp: serverTimestamp()
            });
          }
        }
        setStreamingText("");
      } catch (err) {
        console.error(err);
      }
    }
    
    setIsPipelineRunning(false);
    setActiveAgentId(null);
  };

  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleStartProject = async (config: any) => {
    setGlobalError(null);
    if (!user) {
      setGlobalError("Debes iniciar sesión con Google (arriba a la derecha) para crear un proyecto.");
      throw new Error("User not authenticated");
    }

    const projectId = Math.random().toString(36).substr(2, 9);
    const newProject: Project = {
      id: projectId,
      title: config.name,
      description: config.description,
      status: 'Active',
      icon: 'Layout',
      technologies: [config.frontend, config.backend, config.database, config.styling, ...config.features],
      progress: 0,
      health: 'Healthy',
      lastUpdated: new Date().toISOString(),
      activeAgents: ['director'],
      ownerId: user.uid,
      stage: 'discovery'
    } as any;
    
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore connection timeout")), 8000)
      );
      
      await Promise.race([
        setDoc(doc(db, 'projects', projectId), newProject),
        timeoutPromise
      ]);
      
      setActiveProjectId(projectId);
      setActiveTab('comms');
      setStage('discovery');
      return projectId;
    } catch (err: any) {
      console.error("Error creating project:", err);
      if (err.message === "Firestore connection timeout") {
        setGlobalError("Error: No se pudo conectar a la base de datos. Por favor, asegúrate de haber habilitado 'Firestore Database' en tu consola de Firebase.");
      } else {
        setGlobalError("Error al crear el proyecto. Revisa los permisos de Firebase.");
      }
      throw err;
    }
  };

  const resetProject = () => {
    setDiscoveryBrief(null);
    setIsDiscoveryComplete(false);
    setChatMessages([]);
    setKickoffMessages([]);
    setArtifacts({});
    setStage('discovery');
    orchestrator.reset();
  };

  const downloadZip = async () => {
    const currentArtifacts = activeProjectId ? (projectArtifacts[activeProjectId] || {}) : artifacts;
    if (Object.keys(currentArtifacts).length === 0) return;
    
    try {
      const response = await fetch('/api/export/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifacts: currentArtifacts, projectName: 'multiagent-lab-project' })
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'project.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
    }
  };

  // Simulate live logs and status
  useEffect(() => {
    if (isPipelineRunning) return;
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString('en-GB', { hour12: false }),
        agent: ['AGENT_LOGIC', 'AGENT_ARCH', 'AGENT_QA', 'AGENT_SEC'][Math.floor(Math.random() * 4)],
        message: [
          'Optimizing neural weights...',
          'Syncing repository state...',
          'Validating API endpoints...',
          'Deploying sandbox environment...',
          'Analyzing performance bottlenecks...'
        ][Math.floor(Math.random() * 5)],
        type: ['logic', 'arch', 'qa', 'sec'][Math.floor(Math.random() * 4)] as any
      };
      setLogs(prev => [...prev.slice(-10), newLog]);
      setNodeLoad(prev => Math.min(100, Math.max(0, prev + (Math.random() * 10 - 5))));
      
      // Randomly toggle system status
      if (Math.random() > 0.8) {
        setSystemStatus(prev => prev === 'running' ? 'waiting' : 'running');
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-dark text-neutral-300 antialiased selection:bg-neon-blue/20 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/80 backdrop-blur-2xl px-8 py-5">
        <div className="flex items-center gap-16">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="size-6 bg-white flex items-center justify-center text-black rounded-sm shadow-lg">
                <TerminalIcon size={14} strokeWidth={3} />
              </div>
              <div className={`size-1 rounded-full animate-pulse ${systemStatus === 'running' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}></div>
            </div>
            <h2 className="text-white text-xs font-black tracking-[0.3em] uppercase">Agentic.OS</h2>
          </div>
          <nav className="hidden md:flex items-center gap-10">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'dashboard' ? 'text-white relative' : 'text-neutral-500 hover:text-white'}`}
            >
              Dashboard
              {activeTab === 'dashboard' && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-white"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('projects')}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'projects' ? 'text-white relative' : 'text-neutral-500 hover:text-white'}`}
            >
              Projects
              {activeTab === 'projects' && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-white"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('comms')}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'comms' ? 'text-white relative' : 'text-neutral-500 hover:text-white'}`}
            >
              Director
              {activeTab === 'comms' && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-white"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('team')}
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'team' ? 'text-white relative' : 'text-neutral-500 hover:text-white'}`}
            >
              Team
              {activeTab === 'team' && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-white"></span>}
            </button>
          </nav>
        </div>
        <div className="flex flex-1 justify-end gap-8 items-center">
          <div className="relative hidden sm:block w-full max-w-[280px] group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-white transition-colors" size={16} />
            <input 
              className="w-full bg-transparent border-none py-2 pl-8 pr-4 text-[10px] focus:ring-0 placeholder:text-neutral-700 transition-all uppercase tracking-[0.2em]" 
              placeholder="Search command..."
            />
          </div>
          <div className="flex gap-6 items-center">
            {!user ? (
              <button 
                onClick={handleLogin}
                className="text-[10px] font-black uppercase tracking-widest text-neon-blue hover:text-white transition-colors bg-neon-blue/10 px-4 py-2 rounded-full border border-neon-blue/20"
              >
                Login with Google
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  {user.displayName || 'User'}
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-red-400 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
            <button className="text-neutral-500 hover:text-white transition-all hover:scale-110">
              <Bell size={18} />
            </button>
            <button className="text-neutral-500 hover:text-white transition-all hover:scale-110">
              <Settings size={18} />
            </button>
          </div>
          <div className="h-8 w-8 bg-neutral-900 border border-white/5 overflow-hidden grayscale contrast-125 rounded-full shadow-inner">
            <img 
              alt="User profile" 
              className="h-full w-full object-cover opacity-70 hover:opacity-100 transition-opacity" 
              src={user?.photoURL || 'https://picsum.photos/seed/user/100/100'}
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside 
          className={`hidden lg:flex ${isSidebarExpanded ? 'w-80' : 'w-24'} border-r border-white/5 p-6 flex-col gap-10 bg-black/50 overflow-y-auto overflow-x-hidden transition-all duration-500 ease-in-out z-40`}
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <div className="space-y-8">
            <div>
              <p className={`px-2 text-[9px] font-black uppercase tracking-[0.4em] text-neutral-600 mb-6 transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0'}`}>
                Workspace
              </p>
              <div className="space-y-1">
                <SidebarItem 
                  icon={LayoutGrid} 
                  label="Dashboard" 
                  active={activeTab === 'dashboard'} 
                  onClick={() => setActiveTab('dashboard')}
                  expanded={isSidebarExpanded}
                />
                <SidebarItem 
                  icon={FolderOpen} 
                  label="Proyectos" 
                  active={activeTab === 'projects'} 
                  onClick={() => setActiveTab('projects')}
                  expanded={isSidebarExpanded}
                />
                <SidebarItem 
                  icon={MessageSquare} 
                  label="Director" 
                  active={activeTab === 'comms'} 
                  onClick={() => setActiveTab('comms')}
                  expanded={isSidebarExpanded}
                />
                <SidebarItem 
                  icon={Users} 
                  label="Equipo" 
                  active={activeTab === 'team'}
                  onClick={() => setActiveTab('team')}
                  expanded={isSidebarExpanded}
                />

                <SidebarItem 
                  icon={Globe} 
                  label="Tutorial" 
                  active={activeTab === 'tutorial'}
                  onClick={() => setActiveTab('tutorial')}
                  expanded={isSidebarExpanded}
                />
                
                <div className={`px-4 py-6 mt-4 border-t border-white/5 transition-all duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden pointer-events-none'}`}>
                  <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-4">Model Source</p>
                  <div className="flex bg-white/5 rounded-lg p-1">
                    <button 
                      onClick={() => setModelSource('cloud')}
                      className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-md transition-all ${modelSource === 'cloud' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                    >
                      Cloud
                    </button>
                    <button 
                      onClick={() => setModelSource('local')}
                      className={`flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-md transition-all ${modelSource === 'local' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
                    >
                      Local
                    </button>
                  </div>
                  <p className="text-[7px] text-neutral-600 mt-2 font-mono italic">
                    {modelSource === 'local' ? 'Ollama: Llama3/Qwen2.5' : 'Gemini 1.5/2.0'}
                  </p>
                </div>

                <SidebarItem icon={Calendar} label="Reuniones" onClick={() => {}} expanded={isSidebarExpanded} />
                
                <SidebarFolder icon={Building2} label="Enterprise" expanded={isSidebarExpanded}>
                  <SidebarSubItem label="Startup" onClick={() => {}} expanded={isSidebarExpanded} />
                  <SidebarSubItem label="Spinoff" onClick={() => {}} expanded={isSidebarExpanded} />
                  <SidebarSubItem label="Business Live" onClick={() => {}} expanded={isSidebarExpanded} />
                </SidebarFolder>

                <SidebarFolder icon={Bot} label="Agentes IA" expanded={isSidebarExpanded}>
                  {AGENTS.map(agent => (
                    <SidebarSubItem 
                      key={agent.id} 
                      label={agent.name} 
                      onClick={() => {}}
                      expanded={isSidebarExpanded}
                    />
                  ))}
                </SidebarFolder>
              </div>
            </div>
          </div>
          <div className={`mt-auto p-5 border border-white/5 bg-white/[0.02] rounded-lg shadow-inner transition-all duration-500 ${isSidebarExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-neutral-500">Node Load</p>
              <p className="text-[9px] font-mono text-neutral-400">{Math.round(nodeLoad)}%</p>
            </div>
            <div className="h-[2px] w-full bg-neutral-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                animate={{ width: `${nodeLoad}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          <main className="flex-1 p-10 lg:p-16 overflow-y-auto custom-scrollbar">
            {globalError && (
              <div className="max-w-7xl mx-auto mb-6 bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} />
                  <p className="text-sm font-medium">{globalError}</p>
                </div>
                <button onClick={() => setGlobalError(null)} className="text-red-400 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}
            
              {activeTab === 'dashboard' ? (
                projects.length === 0 ? (
                  <MinimalLanding onStartProject={() => setActiveTab('comms')} />
                ) : (
                  <DashboardSection 
                    projectsCount={projects.length} 
                    onStartProject={() => setActiveTab('comms')}
                  />
                )
              ) : activeTab === 'projects' ? (
              <div className="max-w-7xl mx-auto w-full space-y-12">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-white/5">
                  <div className="space-y-4">
                    <h2 className="text-5xl font-extralight text-white tracking-tighter">Proyectos</h2>
                    <p className="text-neutral-500 text-[10px] uppercase tracking-[0.5em] font-black">Central de Consolidación de Software</p>
                  </div>
                </div>
                
                <CodeViewer 
                  artifacts={activeProjectId ? (projectArtifacts[activeProjectId] || {}) : artifacts}
                  onDownload={downloadZip}
                />
              </div>
            ) : activeTab === 'team' ? (
              <TeamSwarmSection projects={projects} />
            ) : activeTab === 'tutorial' ? (
              <TutorialSection onStart={() => setActiveTab('dashboard')} />
            ) : (
              <CommsDirector 
                stage={activeProjectId ? (projectStages[activeProjectId] || 'discovery') : stage}
                chatMessages={activeProjectId ? (projectChats[activeProjectId] || []) : chatMessages}
                streamingText={streamingText}
                activeAgentId={activeAgentId}
                attachments={attachments}
                setAttachments={setAttachments}
                handleFileUpload={handleFileUpload}
                handleSendMessage={handleDiscoveryChat}
                chatEndRef={chatEndRef}
                discoveryBrief={activeProjectId ? (projectBriefs[activeProjectId] || null) : discoveryBrief}
                startKickoff={runKickoff}
                kickoffMessages={activeProjectId ? (projectKickoffMessages[activeProjectId] || []) : kickoffMessages}
                isPipelineRunning={isPipelineRunning}
                runDevelopmentPipeline={runPipeline}
                projects={projects}
                activeProjectId={activeProjectId}
                onSelectProject={(id) => {
                  setActiveProjectId(id);
                }}
                onStartProject={handleStartProject}
              />
            )}
          </main>

          {/* Movable Terminal */}
          <AnimatePresence>
            {isTerminalOpen && (
              <motion.section 
                drag
                dragControls={dragControls}
                dragListener={false}
                dragMomentum={false}
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                className="absolute bottom-10 left-10 right-10 h-64 glass-effect border border-white/10 rounded-xl shadow-refined overflow-hidden z-[100] terminal-glow"
              >
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div 
                    className="flex items-center gap-4 cursor-grab active:cursor-grabbing flex-1"
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                    <GripHorizontal size={14} className="text-neutral-600" />
                    <div className="flex gap-1.5">
                      <div className="size-2 rounded-full bg-red-500/50"></div>
                      <div className="size-2 rounded-full bg-amber-500/50"></div>
                      <div className="size-2 rounded-full bg-emerald-500/50"></div>
                    </div>
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2 ml-2">
                      <span className="size-1.5 bg-neon-blue animate-pulse rounded-full shadow-[0_0_8px_#00f2ff]"></span>
                      Live Agent Stream
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[9px] font-mono text-neutral-600 tracking-wider">SSH: 192.168.1.104</span>
                    <button 
                      onClick={() => setIsTerminalOpen(false)}
                      className="text-neutral-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 font-mono text-[10px] leading-relaxed space-y-2 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {logs.map((log) => (
                      <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-6"
                      >
                        <span className="text-neutral-700 shrink-0 font-light">{log.timestamp}</span>
                        <span className="text-neon-blue font-bold">[{log.agent}]</span>
                        <span className="text-neutral-400 tracking-wide">{log.message}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {streamingText && (
                    <div className="mt-4 p-4 bg-white/[0.02] border border-white/5 rounded-lg text-neutral-300 whitespace-pre-wrap">
                      <div className="flex items-center gap-2 mb-2 text-neon-blue text-[9px] font-black uppercase tracking-widest">
                        <span className="size-1.5 bg-neon-blue animate-pulse rounded-full"></span>
                        Streaming Output
                      </div>
                      {streamingText}
                    </div>
                  )}

                  <div className="flex gap-6 items-center">
                    <span className="text-neutral-700 shrink-0 font-light">{new Date().toLocaleTimeString('en-GB', { hour12: false })}</span>
                    <span className="text-white opacity-50">&gt;</span>
                    <span className="inline-block w-1.5 h-3 bg-neon-blue animate-pulse shadow-[0_0_8px_#00f2ff]"></span>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Minimalist Re-open Button */}
          <AnimatePresence>
            {!isTerminalOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsTerminalOpen(true)}
                className="absolute bottom-10 right-10 size-12 glass-effect border border-white/10 rounded-full flex items-center justify-center text-white shadow-refined hover:border-neon-blue transition-all group z-[100]"
              >
                <TerminalIcon size={18} className="group-hover:text-neon-blue transition-colors" />
                <span className="absolute -top-1 -right-1 size-3 bg-neon-blue rounded-full animate-pulse shadow-[0_0_8px_#00f2ff]"></span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Right-side Activity Overlay */}
        <aside 
          className={`hidden 2xl:flex flex-col ${isRightSidebarExpanded ? 'w-96' : 'w-24'} bg-black/30 border-l border-white/5 p-8 overflow-y-auto overflow-x-hidden transition-all duration-500 ease-in-out z-40`}
          onMouseEnter={() => setIsRightSidebarExpanded(true)}
          onMouseLeave={() => setIsRightSidebarExpanded(false)}
        >
          <div className={`space-y-10 transition-all duration-500 ${isRightSidebarExpanded ? 'opacity-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <h4 className="text-[9px] font-black text-white uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
              <span className="w-3 h-[1px] bg-white"></span>
              Agent Activity Pipeline
            </h4>
            
            <div className="space-y-6 flex-1">
              {/* Messaging Integration */}
              <div className="mb-8">
                <h5 className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-6">Messaging Integration</h5>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/5 transition-all group">
                    <div className="size-8 bg-sky-500/10 rounded-full flex items-center justify-center text-sky-500">
                      <MessageCircle size={14} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-white font-bold">Telegram Bot</p>
                      <p className="text-[8px] text-neutral-500">Connect to phone</p>
                    </div>
                  </button>
                  <button className="w-full flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/5 transition-all group">
                    <div className="size-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                      <Smartphone size={14} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-white font-bold">WhatsApp</p>
                      <p className="text-[8px] text-neutral-500">Instruction link</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Agent Activity Card 1 */}
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all group">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 bg-neon-blue rounded-full shadow-[0_0_8px_#00f2ff]"></div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">DeepSeek Coder</p>
                  </div>
                  <span className="text-[7px] font-mono text-neutral-500">ACTIVE</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed mb-4">
                  Refactorizando lógica de autenticación para mejorar el tiempo de respuesta en un 15%.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="size-5 rounded-full border border-black bg-neutral-800 flex items-center justify-center text-[7px] font-bold text-neutral-500">
                        {i === 1 ? 'JS' : 'TS'}
                      </div>
                    ))}
                  </div>
                  <span className="text-[8px] font-mono text-neon-blue">84% COMPLETO</span>
                </div>
              </div>

              {/* Agent Activity Card 2 */}
              <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="size-2 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></div>
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Architect Clone</p>
                  </div>
                  <span className="text-[7px] font-mono text-neutral-500">SYNCING</span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed mb-4">
                  Validando consistencia de tipos en el módulo de base de datos distribuida.
                </p>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '45%' }}
                    className="h-full bg-purple-500 shadow-[0_0_10px_#a855f7]"
                  />
                </div>
              </div>

              {/* Recent Artifacts */}
              <div className="pt-6 border-t border-white/5">
                <h5 className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-4">Recent Artifacts</h5>
                <div className="space-y-2">
                  {[
                    { name: 'auth_service.ts', type: 'TS', size: '4.2kb' },
                    { name: 'user_schema.sql', type: 'SQL', size: '1.8kb' },
                    { name: 'api_gateway.js', type: 'JS', size: '12.5kb' }
                  ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="text-[7px] font-bold text-neon-blue bg-neon-blue/10 px-1.5 py-0.5 rounded uppercase">{file.type}</div>
                        <span className="text-[10px] text-neutral-300 group-hover:text-white transition-colors">{file.name}</span>
                      </div>
                      <span className="text-[8px] font-mono text-neutral-600">{file.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 border border-white/5 bg-white/[0.01] rounded-xl shadow-inner">
              <div className="flex items-center gap-3 mb-6">
                <div className={`size-1.5 animate-pulse rounded-full shadow-lg ${systemStatus === 'running' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'}`}></div>
                <h5 className="text-[9px] font-black text-white uppercase tracking-[0.3em]">
                  {systemStatus === 'running' ? 'Active Pipeline' : 'Awaiting Task'}
                </h5>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Artifacts Generated</span>
                  <span className="text-[9px] font-mono text-white">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Active Agents</span>
                  <span className="text-[9px] font-mono text-white">4/7</span>
                </div>
              </div>
              <button className="w-full py-4 border border-neon-blue/20 text-neon-blue text-[9px] font-black uppercase tracking-[0.3em] hover:bg-neon-blue hover:text-black transition-all rounded-sm shadow-lg">
                {systemStatus === 'running' ? 'View Live Logs' : 'Initialize New Task'}
              </button>
            </div>
          </div>

          {/* Collapsed View Icons */}
          <div className={`absolute inset-0 flex flex-col items-center py-12 gap-10 transition-all duration-500 ${isRightSidebarExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          </div>
        </aside>
        
        {/* Serafina Floating Agent */}
        <SerafinaFloatingAgent />
      </div>
    </div>
  );
}
