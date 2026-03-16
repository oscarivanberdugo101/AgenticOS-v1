import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Sparkles, MessageSquare } from 'lucide-react';

export const SerafinaFloatingAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hola, soy Serafina. Tu asistente de orquestación. ¿En qué puedo ayudarte hoy?' }
  ]);

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-neon-blue/20 rounded-xl flex items-center justify-center">
                  <Bot size={18} className="text-neon-blue" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Serafina AI</p>
                  <p className="text-[8px] text-emerald-500 font-bold uppercase">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div className="h-64 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed ${
                    msg.role === 'user' ? 'bg-neon-blue text-black font-medium' : 'bg-white/5 text-neutral-300'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Pregunta a Serafina..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 px-4 text-[11px] text-white placeholder:text-neutral-600 focus:outline-none focus:border-neon-blue/50"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-neon-blue">
                  <Sparkles size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`size-14 rounded-2xl flex items-center justify-center shadow-2xl transition-colors duration-500 ${
          isOpen ? 'bg-white text-black' : 'bg-neon-blue text-black shadow-[0_0_30px_rgba(0,243,255,0.3)]'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};
