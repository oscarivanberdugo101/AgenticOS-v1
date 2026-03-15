import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileCode, Folder, ChevronRight, ChevronDown, Download, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CodeViewerProps {
  artifacts: Record<string, string>;
  onDownload: () => void;
}

export const CodeViewer = ({ artifacts, onDownload }: CodeViewerProps) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(
    Object.keys(artifacts).length > 0 ? Object.keys(artifacts)[0] : null
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (selectedFile && artifacts[selectedFile]) {
      navigator.clipboard.writeText(artifacts[selectedFile]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx': return 'javascript';
      case 'ts':
      case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      default: return 'text';
    }
  };

  return (
    <div className="flex h-[600px] bg-[#1e1e1e] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Sidebar / File Tree */}
      <div className="w-64 border-r border-white/5 bg-[#252526] flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Explorador</span>
          <Folder size={14} className="text-neutral-500" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {Object.keys(artifacts).map((path) => (
            <button
              key={path}
              onClick={() => setSelectedFile(path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                selectedFile === path 
                  ? 'bg-white/10 text-white' 
                  : 'text-neutral-500 hover:bg-white/5 hover:text-neutral-300'
              }`}
            >
              <FileCode size={14} className={selectedFile === path ? 'text-neon-blue' : ''} />
              <span className="truncate">{path}</span>
            </button>
          ))}
          {Object.keys(artifacts).length === 0 && (
            <div className="p-4 text-center text-[10px] text-neutral-600 italic">
              No hay archivos generados
            </div>
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 bg-[#2d2d2d] border-b border-white/5 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-mono italic">
              {selectedFile || 'Selecciona un archivo'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCopy}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Copiar código"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
            <button 
              onClick={onDownload}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Descargar ZIP"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto custom-scrollbar bg-[#1e1e1e]">
          {selectedFile ? (
            <SyntaxHighlighter
              language={getLanguage(selectedFile)}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '24px',
                fontSize: '13px',
                backgroundColor: 'transparent',
                fontFamily: '"JetBrains Mono", monospace',
              }}
              showLineNumbers
            >
              {artifacts[selectedFile] || ''}
            </SyntaxHighlighter>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-neutral-700 space-y-4">
              <FileCode size={48} strokeWidth={1} />
              <p className="text-sm">Selecciona un archivo para visualizar el código fuente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
