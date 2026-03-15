import React from 'react';
import { Bot, Cpu, Terminal, Code, Database, Zap } from 'lucide-react';

const BOTS = [
  { id: 'bot1', icon: Bot, name: 'Agent 01' },
  { id: 'bot2', icon: Cpu, name: 'Agent 02' },
  { id: 'bot3', icon: Terminal, name: 'Agent 03' },
  { id: 'bot4', icon: Code, name: 'Agent 04' },
  { id: 'bot5', icon: Database, name: 'Agent 05' },
  { id: 'bot6', icon: Zap, name: 'Agent 06' },
];

export const BotLine = () => {
  return (
    <div className="flex items-center justify-center gap-8 opacity-40 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-500">
      {BOTS.map((bot) => (
        <div key={bot.id} className="flex flex-col items-center gap-2">
          <bot.icon size={24} className="text-white" />
          <span className="text-[8px] font-mono text-neutral-500 uppercase tracking-widest">{bot.name}</span>
        </div>
      ))}
    </div>
  );
};
