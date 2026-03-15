import React, { useState } from 'react';
import { LucideIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: string | number;
  expanded?: boolean;
}

export const SidebarItem = ({ icon: Icon, label, active, onClick, badge, expanded = true }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
      active 
      ? 'bg-white/5 text-white shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]' 
      : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02]'
    } ${!expanded ? 'justify-center px-0' : ''}`}
    title={!expanded ? label : undefined}
  >
    {active && (
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-neon-blue rounded-r-full shadow-[0_0_10px_#00f3ff] transition-all duration-300 ${!expanded ? 'opacity-0' : 'opacity-100'}`} />
    )}
    <Icon size={18} className={`transition-colors shrink-0 ${active ? 'text-neon-blue' : 'group-hover:text-neutral-300'}`} />
    <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap overflow-hidden ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
      {label}
    </span>
    {badge && expanded && (
      <span className="ml-auto text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-white/60">
        {badge}
      </span>
    )}
  </button>
);

interface SidebarFolderProps {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  expanded?: boolean;
  defaultOpen?: boolean;
}

export const SidebarFolder = ({ icon: Icon, label, children, expanded = true, defaultOpen = false }: SidebarFolderProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.02] ${!expanded ? 'justify-center px-0' : ''}`}
      >
        <Icon size={18} className="transition-colors shrink-0 group-hover:text-neutral-300" />
        <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 whitespace-nowrap overflow-hidden flex-1 text-left ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          {label}
        </span>
        {expanded && (
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={14} className="text-neutral-700" />
          </motion.div>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden ml-6 border-l border-white/5 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarGroup = ({ title, children, expanded = true }: { title: string, children: React.ReactNode, expanded?: boolean }) => (
  <div className="space-y-4">
    <p className={`px-4 text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] transition-opacity duration-300 ${expanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
      {title}
    </p>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

interface SidebarSubItemProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  expanded?: boolean;
}

export const SidebarSubItem: React.FC<SidebarSubItemProps> = ({ label, active, onClick, expanded = true }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest relative group ${
      active ? 'text-neon-blue' : 'text-neutral-600 hover:text-neutral-400'
    } ${!expanded ? 'justify-center px-0' : ''}`}
    title={!expanded ? label : undefined}
  >
    {/* Connection line */}
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-[1px] bg-white/5" />
    
    <div className={`size-1 rounded-full shrink-0 z-10 ${active ? 'bg-neon-blue shadow-[0_0_5px_#00f3ff]' : 'bg-neutral-800 group-hover:bg-neutral-600'}`} />
    <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
      {label}
    </span>
  </button>
);
