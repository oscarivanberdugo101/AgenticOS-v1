import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ExternalLink, Code, Layout, Smartphone, Monitor, Terminal, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SandboxProps {
  artifacts: Record<string, string>;
}

interface ConsoleMessage {
  type: 'log' | 'error' | 'warn';
  message: string;
  timestamp: number;
}

export const Sandbox: React.FC<SandboxProps> = ({ artifacts }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    generatePreview();
  }, [artifacts]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SANDBOX_CONSOLE') {
        setConsoleMessages(prev => [...prev, {
          type: event.data.method,
          message: event.data.args.map((arg: any) => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '),
          timestamp: Date.now()
        }].slice(-50));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const generatePreview = () => {
    setIsLoading(true);
    setConsoleMessages([]);
    
    // Try to find an entry point
    const htmlFile = Object.entries(artifacts).find(([path]) => path.toLowerCase().includes('index.html'))?.[1] || 
                    Object.entries(artifacts).find(([path]) => path.endsWith('.html'))?.[1];
    
    const cssFiles = Object.entries(artifacts).filter(([path]) => path.endsWith('.css'));
    const jsFiles = Object.entries(artifacts).filter(([path]) => 
      path.endsWith('.js') || path.endsWith('.ts') || path.endsWith('.jsx') || path.endsWith('.tsx')
    );

    // Console override script
    const consoleOverride = `
      <script>
        (function() {
          const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn
          };
          
          function sendToParent(method, args) {
            window.parent.postMessage({
              type: 'SANDBOX_CONSOLE',
              method: method,
              args: Array.from(args)
            }, '*');
          }

          console.log = function() {
            sendToParent('log', arguments);
            originalConsole.log.apply(console, arguments);
          };
          console.error = function() {
            sendToParent('error', arguments);
            originalConsole.error.apply(console, arguments);
          };
          console.warn = function() {
            sendToParent('warn', arguments);
            originalConsole.warn.apply(console, arguments);
          };

          window.onerror = function(message, source, lineno, colno, error) {
            sendToParent('error', [message + ' (at ' + source + ':' + lineno + ':' + colno + ')']);
          };
        })();
      </script>
    `;

    let doc = '';

    if (htmlFile) {
      doc = htmlFile;
      // Inject Console Override
      doc = doc.replace('<head>', `<head>${consoleOverride}`);
      
      // Inject Tailwind if not present
      if (!doc.includes('tailwindcss')) {
        doc = doc.replace('</head>', `<script src="https://cdn.tailwindcss.com"></script></head>`);
      }

      // Inject CSS
      cssFiles.forEach(([path, content]) => {
        const styleTag = `<style data-filename="${path}">${content}</style>`;
        doc = doc.replace('</head>', `${styleTag}</head>`);
      });

      // Inject JS
      jsFiles.forEach(([path, content]) => {
        // Simple attempt to handle React/JSX if needed (very basic)
        const isReact = content.includes('React') || content.includes('jsx');
        const scriptTag = `<script type="${isReact ? 'text/babel' : 'module'}" data-filename="${path}">${content}</script>`;
        
        if (isReact && !doc.includes('babel')) {
          doc = doc.replace('</head>', `<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script></head>`);
        }
        
        doc = doc.replace('</body>', `${scriptTag}</body>`);
      });
    } else {
      // Fallback: Create a basic structure if no HTML is found
      const cssContent = cssFiles.map(([_, content]) => content).join('\n');
      const jsContent = jsFiles.map(([_, content]) => content).join('\n');
      
      doc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${consoleOverride}
            <script src="https://cdn.tailwindcss.com"></script>
            <style>${cssContent}</style>
          </head>
          <body class="bg-neutral-900 text-white p-8">
            <div id="root"></div>
            <script type="module">${jsContent}</script>
            <div class="mt-8 p-4 border border-white/10 rounded-lg bg-black/40">
              <h3 class="text-xs font-black uppercase tracking-widest text-neon-blue mb-2">Sandbox Info</h3>
              <p class="text-[10px] text-neutral-400">No se detectó un archivo index.html. Se ha generado un entorno de ejecución genérico con Tailwind CSS inyectado.</p>
            </div>
          </body>
        </html>
      `;
    }

    setSrcDoc(doc);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="h-full flex flex-col bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden">
      {/* Sandbox Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="size-10 bg-neon-blue/10 border border-neon-blue/20 rounded-xl flex items-center justify-center text-neon-blue">
            <Play size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Sandbox de Ejecución</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Entorno Seguro de Previsualización</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 mr-4">
            <button 
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <Monitor size={14} />
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <Smartphone size={14} />
            </button>
          </div>

          <button 
            onClick={() => setShowConsole(!showConsole)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              showConsole ? 'bg-white text-black border-white' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
            }`}
          >
            <Terminal size={14} />
            Consola
          </button>

          <button 
            onClick={generatePreview}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all"
          >
            <RotateCcw size={14} className={isLoading ? 'animate-spin' : ''} />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Sandbox Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-8 bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <div className="size-16 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-neon-blue uppercase tracking-[0.3em]">Compilando Artefactos...</p>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`relative transition-all duration-500 shadow-2xl border border-white/10 rounded-xl overflow-hidden bg-white ${viewMode === 'desktop' ? 'w-full h-full' : 'w-[375px] h-[667px]'}`}
              >
                <iframe
                  ref={iframeRef}
                  title="Sandbox Preview"
                  srcDoc={srcDoc}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Console Panel */}
        <AnimatePresence>
          {showConsole && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-white/5 bg-black/60 flex flex-col"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-neutral-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Consola de Salida</span>
                </div>
                <button onClick={() => setConsoleMessages([])} className="text-[10px] text-neutral-500 hover:text-white transition-colors">Limpiar</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-2 custom-scrollbar">
                {consoleMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-neutral-700 italic">
                    Esperando salida...
                  </div>
                ) : (
                  consoleMessages.map((msg, i) => (
                    <div key={i} className={`p-2 rounded border ${
                      msg.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      msg.type === 'warn' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-white/5 border-white/5 text-neutral-300'
                    }`}>
                      <div className="flex items-center gap-2 mb-1 opacity-50">
                        {msg.type === 'error' && <AlertCircle size={10} />}
                        <span>[{new Date(msg.timestamp).toLocaleTimeString()}]</span>
                      </div>
                      <pre className="whitespace-pre-wrap break-all">{msg.message}</pre>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
