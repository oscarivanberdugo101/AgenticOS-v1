import React from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Clock } from 'lucide-react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    onClick={onClick}
    className="group bg-white/[0.02] border border-white/5 p-6 rounded-3xl hover:bg-white/[0.04] hover:border-white/10 transition-colors cursor-pointer relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <ExternalLink size={14} className="text-neon-blue" />
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="size-2 bg-neon-blue rounded-full shadow-[0_0_8px_#00f3ff]"></div>
        <h4 className="text-white text-sm font-medium tracking-tight">{project.title}</h4>
      </div>
      
      <p className="text-[10px] text-neutral-500 line-clamp-2 leading-relaxed">
        {project.description}
      </p>

      <div className="pt-4 flex items-center justify-between border-t border-white/5">
        <div className="flex items-center gap-2 text-neutral-600">
          <Clock size={12} />
          <span className="text-[9px] font-mono uppercase tracking-widest">{project.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-neon-blue" style={{ width: `${project.progress}%` }}></div>
          </div>
          <span className="text-[9px] font-mono text-white">{project.progress}%</span>
        </div>
      </div>
    </div>
  </motion.div>
);
