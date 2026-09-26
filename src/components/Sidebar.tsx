import React, { useState } from 'react';
import { PageId } from '../types/portfolio';
import { PERSONAL_INFO } from '../data/portfolioData';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Copy, 
  Check, 
  Cpu, 
  Layers, 
  Terminal, 
  Code2, 
  Send, 
  User,
  Gamepad2,
  Zap,
  Camera
} from 'lucide-react';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenTerminal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activePage, 
  onNavigate,
  onOpenTerminal 
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const navItems: { id: PageId; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'about', label: 'about', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'projects', label: 'projects', icon: <Layers className="w-3.5 h-3.5" />, badge: '4' },
    { id: 'skills', label: 'skills & architecture', icon: <Code2 className="w-3.5 h-3.5" /> },
    { id: 'memories', label: 'memories & dump', icon: <Camera className="w-3.5 h-3.5" />, badge: 'new' },
    { id: 'bug-smasher', label: 'bug smasher', icon: <Gamepad2 className="w-3.5 h-3.5" />, badge: 'arcade' },
    { id: 'api-explorer', label: 'api playground', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'contact', label: 'contact', icon: <Send className="w-3.5 h-3.5" /> },
  ];

  return (
    <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-[#22272e] bg-[#111315]/95 backdrop-blur-md p-6 lg:p-8 flex flex-col justify-between z-30">
      <div>
        {/* Profile Headshot & Header */}
        <div className="flex items-center gap-4 lg:block">
          <div className="relative group shrink-0 mb-0 lg:mb-5">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-2 border-[#2d333b] group-hover:border-sky-500/70 transition-colors duration-300 shadow-xl shadow-black/60 bg-[#1c2128]">
              <img 
                src={PERSONAL_INFO.avatar} 
                alt={PERSONAL_INFO.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  // Fallback avatar if local image not found
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#111315] rounded-full" title="Available for opportunities" />
          </div>

          <div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#f0f6fc] tracking-tight hover:text-sky-400 transition-colors cursor-pointer"
                onClick={() => onNavigate('about')}>
              {PERSONAL_INFO.name}
            </h1>
            
            <p className="text-xs uppercase tracking-wider text-sky-400 font-mono mt-1 font-semibold">
              {PERSONAL_INFO.title}
            </p>
          </div>
        </div>

        {/* Short Meta Information */}
        <div className="mt-4 text-xs text-[#8b949e] space-y-1.5 font-mono">
          <p className="flex items-center gap-1.5 text-[#a2abb5]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-500" />
            Python · FastAPI · Django · PostgreSQL · React
          </p>
          <p className="text-[#7d8590]">
            {PERSONAL_INFO.location}
          </p>
          
          <div className="flex items-center gap-2 pt-1">
            <button 
              onClick={handleCopyEmail}
              className="text-[#8b949e] hover:text-[#e6edf3] flex items-center gap-1.5 transition-colors group text-[11px]"
              title="Click to copy email"
            >
              <Mail className="w-3 h-3 text-sky-400" />
              <span className="underline decoration-dotted decoration-[#30363d] group-hover:decoration-sky-400">
                {PERSONAL_INFO.email}
              </span>
              {copiedEmail ? (
                <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
              ) : (
                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Page Navigation Links */}
        <nav className="mt-8 lg:mt-10" aria-label="Page Navigation">
          <p className="text-[10px] uppercase font-mono tracking-widest text-[#484f58] mb-3 px-3">
            Pages & Views
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full text-left px-3 py-2 text-sm font-mono tracking-wide rounded-md transition-all flex items-center justify-between group ${
                      isActive 
                        ? 'text-sky-400 bg-sky-500/10 border-l-2 border-sky-400 font-semibold pl-2.5' 
                        : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22] border-l-2 border-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span className={`${isActive ? 'text-sky-400' : 'text-[#6e7681] group-hover:text-sky-400'} transition-colors`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </span>

                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isActive 
                          ? 'bg-sky-400/20 text-sky-300' 
                          : 'bg-[#21262d] text-[#8b949e] group-hover:text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Footer Details & External Links */}
      <div className="mt-8 pt-6 border-t border-[#21262d] space-y-4">
        <div className="flex items-center gap-3">
          <a 
            href={PERSONAL_INFO.github} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors border border-[#30363d]/60"
            title="GitHub profile"
          >
            <Github className="w-4 h-4" />
          </a>
          <a 
            href={PERSONAL_INFO.linkedin} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-sky-400 transition-colors border border-[#30363d]/60"
            title="LinkedIn profile"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a 
            href={PERSONAL_INFO.currentSite} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-emerald-400 transition-colors border border-[#30363d]/60 flex items-center gap-1.5 text-xs font-mono"
            title="Current live portfolio"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">khatrisaphal.com.np</span>
          </a>
        </div>

        {onOpenTerminal && (
          <button
            onClick={onOpenTerminal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#161b22]/70 hover:bg-[#1f242c] text-xs font-mono text-[#8b949e] hover:text-sky-400 border border-[#30363d]/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-sky-400" />
              <span>Interactive CLI</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-[#21262d] rounded text-[#6e7681] border border-[#30363d]">~</kbd>
          </button>
        )}

        <div className="text-[11px] font-mono text-[#6e7681] flex items-center justify-between">
          <span>Python 3.12</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>
      </div>
    </aside>
  );
};
