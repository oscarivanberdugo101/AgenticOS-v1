import React, { useState, useEffect } from 'react';
import { History, Clock, ArrowLeftRight, RotateCcw, ChevronRight, FileCode, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProjectVersion } from '../types';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import * as Diff from 'diff';

interface VersionControlProps {
  projectId: string;
  currentArtifacts: Record<string, string>;
  onRestore: (artifacts: Record<string, string>) => void;
  onRestoreFile: (path: string, content: string) => void;
}

export const VersionControl: React.FC<VersionControlProps> = ({ projectId, currentArtifacts, onRestore, onRestoreFile }) => {
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [diffPath, setDiffPath] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    const q = query(
      collection(db, `projects/${projectId}/versions`),
      orderBy('versionNumber', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const versionsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ProjectVersion));
      setVersions(versionsData);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handleRestore = (version: ProjectVersion) => {
    onRestore(version.artifacts);
    setSelectedVersionId(null);
  };

  const selectedVersion = versions.find(v => v.id === selectedVersionId);

  const renderDiff = (path: string) => {
    if (!selectedVersion) return null;
    const oldContent = selectedVersion.artifacts[path] || '';
    const newContent = currentArtifacts[path] || '';
    const diff = Diff.diffLines(oldContent, newContent);

    return (
      <div className="font-mono text-[10px] leading-relaxed bg-black/60 rounded-xl p-4 overflow-x-auto border border-white/5">
        {diff.map((part, i) => (
          <div 
            key={i} 
            className={`${
              part.added ? 'bg-emerald-500/10 text-emerald-400' : 
              part.removed ? 'bg-rose-500/10 text-rose-400' : 
              'text-neutral-400'
            } px-2`}
          >
            {part.value.split('\n').map((line, j) => (
              line || j < part.value.split('\n').length - 1 ? (
                <div key={j} className="flex gap-4">
                  <span className="w-4 shrink-0 opacity-40 select-none">
                    {part.added ? '+' : part.removed ? '-' : ' '}
                  </span>
                  <span>{line}</span>
                </div>
              ) : null
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="size-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500">
            <History size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Control de Versiones</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Historial de Artefactos y Commits</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-500 uppercase tracking-widest">
            {versions.length} Versiones
          </span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Version List */}
        <div className="w-80 border-r border-white/5 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-neutral-600">
              <Clock size={24} className="mb-2 opacity-20" />
              <p className="text-[10px] uppercase tracking-widest font-black">Sin historial previo</p>
            </div>
          ) : (
            versions.map((version, i) => (
              <motion.button
                key={version.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => {
                  setSelectedVersionId(version.id);
                  setIsComparing(false);
                  setDiffPath(null);
                }}
                className={`w-full p-4 rounded-2xl border transition-all text-left group ${
                  selectedVersionId === version.id 
                    ? 'bg-emerald-500/10 border-emerald-500/40' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                    selectedVersionId === version.id ? 'text-emerald-500' : 'text-neutral-500'
                  }`}>
                    v{version.versionNumber}.0
                  </span>
                  <span className="text-[8px] font-mono text-neutral-700">
                    {new Date(version.timestamp).toLocaleTimeString('en-GB', { hour12: false })}
                  </span>
                </div>
                <p className="text-[11px] text-white font-medium mb-3 line-clamp-2 leading-relaxed">
                  {version.commitMessage || 'Snapshot automático del sistema'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode size={10} className="text-neutral-600" />
                    <span className="text-[8px] font-mono text-neutral-600">
                      {Object.keys(version.artifacts).length} archivos
                    </span>
                  </div>
                  <ChevronRight size={12} className={`transition-transform ${selectedVersionId === version.id ? 'translate-x-1 text-emerald-500' : 'text-neutral-700'}`} />
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Version Details / Comparison */}
        <div className="flex-1 bg-[#0a0a0a] overflow-y-auto custom-scrollbar p-8">
          <AnimatePresence mode="wait">
            {selectedVersion ? (
              <motion.div
                key={selectedVersion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">Versión {selectedVersion.versionNumber}.0</h4>
                    <p className="text-xs text-neutral-500">Generada el {new Date(selectedVersion.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsComparing(!isComparing)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                        isComparing ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <ArrowLeftRight size={14} />
                      {isComparing ? 'Ver Archivos' : 'Comparar Todo'}
                    </button>
                    <button 
                      onClick={() => handleRestore(selectedVersion)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                    >
                      <RotateCcw size={14} />
                      Restaurar Todo
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                    <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-4">
                      {isComparing ? 'Diferencias con la versión actual' : 'Archivos en esta versión'}
                    </h5>
                    
                    <div className="space-y-4">
                      {Object.keys(selectedVersion.artifacts).map((path, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="size-8 bg-white/5 rounded-lg flex items-center justify-center text-neutral-400 group-hover:text-emerald-500 transition-colors">
                                <FileCode size={14} />
                              </div>
                              <span className="text-xs text-neutral-300 font-mono">{path}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isComparing && (
                                <button 
                                  onClick={() => setDiffPath(diffPath === path ? null : path)}
                                  className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${
                                    diffPath === path ? 'bg-white text-black' : 'bg-white/5 text-white hover:bg-white/10'
                                  }`}
                                >
                                  {diffPath === path ? 'Cerrar Diff' : 'Ver Diff'}
                                </button>
                              )}
                              <button 
                                onClick={() => onRestoreFile(path, selectedVersion.artifacts[path])}
                                className="p-2 bg-white/5 hover:bg-emerald-500/20 text-neutral-400 hover:text-emerald-500 rounded-lg transition-all"
                                title="Restaurar solo este archivo"
                              >
                                <RotateCcw size={14} />
                              </button>
                              <CheckCircle2 size={12} className="text-emerald-500/40 ml-2" />
                            </div>
                          </div>
                          
                          {diffPath === path && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              {renderDiff(path)}
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-4">
                <div className="size-20 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center">
                  <History size={32} className="opacity-20" />
                </div>
                <p className="text-xs uppercase tracking-[0.3em] font-black">Selecciona una versión para inspeccionar</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
