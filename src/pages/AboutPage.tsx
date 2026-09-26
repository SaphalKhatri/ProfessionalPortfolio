import React, { useState } from 'react';
import { PageId } from '../types/portfolio';
import { PERSONAL_INFO, PROJECTS_DATA, ENGINEERING_PRINCIPLES } from '../data/portfolioData';
import { 
  ArrowRight, 
  Terminal, 
  Database, 
  Server, 
  Cpu, 
  ExternalLink, 
  Github, 
  Code, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers, 
  ChevronDown, 
  ChevronUp,
  Workflow
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: PageId) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);

  const getPrincipleIcon = (id: string) => {
    switch (id) {
      case 'database-first':
        return <Database className="w-4 h-4 text-sky-400" />;
      case 'type-safety':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'fail-fast':
        return <Terminal className="w-4 h-4 text-amber-400" />;
      case 'caching-discipline':
        return <Zap className="w-4 h-4 text-sky-400" />;
      case 'async-concurrency':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'layered-architecture':
        return <Layers className="w-4 h-4 text-teal-400" />;
      default:
        return <Workflow className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Editorial Title Block */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 font-mono text-xs mb-4">
          <Terminal className="w-3.5 h-3.5" />
          <span>backend_developer.py</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#f0f6fc] tracking-tight leading-tight">
          {PERSONAL_INFO.name}
        </h1>
        <p className="text-lg md:text-xl text-sky-400/90 font-serif italic mt-2">
          {PERSONAL_INFO.title} & Distributed Systems Enthusiast
        </p>
      </div>

      {/* Styled Prose Block matching the screenshot highlight style with bold technical terms */}
      <div className="space-y-5 text-base md:text-lg text-[#adbac7] leading-relaxed">
        <p className="bg-[#1c2128]/70 border-l-2 border-sky-500/60 p-4 rounded-r-md text-[#d1d5db]">
          I am a full-stack software developer with a strong backend focus, specializing in <strong className="font-bold text-[#f0f6fc]">Python</strong>, <strong className="font-bold text-[#f0f6fc]">FastAPI</strong>, <strong className="font-bold text-[#f0f6fc]">Django REST Framework</strong>, <strong className="font-bold text-[#f0f6fc]">PostgreSQL</strong>, <strong className="font-bold text-[#f0f6fc]">React</strong>, and <strong className="font-bold text-[#f0f6fc]">Tailwind CSS</strong>. I enjoy building complete, production-oriented applications—from responsive user interfaces and <strong className="font-bold text-[#f0f6fc]">REST APIs</strong> to database architecture, business logic, and asynchronous processing.
        </p>
        
        <p>
          My projects include building a content recommendation system using TF-IDF and cosine similarity, integrating <strong className="font-bold text-[#f0f6fc]">Google Gemini AI with PostgreSQL-based caching</strong>, and designing asynchronous background processing with <strong className="font-bold text-[#f0f6fc]">Celery</strong> and <strong className="font-bold text-[#f0f6fc]">Redis</strong>. On the frontend, I build responsive interfaces using <strong className="font-bold text-[#f0f6fc]">React</strong> and <strong className="font-bold text-[#f0f6fc]">Tailwind CSS</strong> and connect them with backend <strong className="font-bold text-[#f0f6fc]">REST APIs</strong>.
        </p>

        <p className="text-[#8b949e]">
          I am actively seeking software engineering internships and full-time opportunities where I can contribute across the stack, while continuing to strengthen my backend expertise in API development, database design, application architecture, and performance optimization.
        </p>
      </div>

      {/* Direct Page Jump Buttons */}
      <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm font-mono border-y border-[#22272e] py-4">
        <button 
          onClick={() => onNavigate('projects')}
          className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition-colors group"
        >
          <span>Explore Projects</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => onNavigate('skills')}
          className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition-colors group"
        >
          <span>Skills & Architecture</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => onNavigate('bug-smasher')}
          className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition-colors group"
        >
          <span>Bug Smasher (Arcade)</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => onNavigate('contact')}
          className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-1.5 transition-colors group"
        >
          <span>Get in Touch</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Featured Projects Preview Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-[#f0f6fc] tracking-tight">
            Key Systems & Projects
          </h2>
          <button 
            onClick={() => onNavigate('projects')}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 group"
          >
            <span>View all 4 projects</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="space-y-4">
          {PROJECTS_DATA.slice(0, 2).map((project) => (
            <div 
              key={project.id}
              className="p-6 rounded-lg border border-[#22272e] bg-[#161b22]/40 hover:border-[#30363d] transition-all hover:bg-[#161b22]/70 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                <h3 className="text-xl font-serif font-bold text-[#f0f6fc] group-hover:text-sky-300 transition-colors flex items-center gap-2">
                  <span>{project.name}</span>
                </h3>
                <span className="text-xs font-mono text-sky-400/90 bg-sky-950/40 border border-sky-800/30 px-2 py-0.5 rounded w-fit">
                  {project.category}
                </span>
              </div>

              <p className="text-sm text-[#8b949e] mb-4">
                {project.tagline}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech) => (
                  <span key={tech} className="text-xs font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#c9d1d9] border border-[#30363d]/60">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs font-mono pt-3 border-t border-[#22272e]">
                <a 
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => onNavigate('projects')}
                  className="text-[#8b949e] hover:text-[#c9d1d9] flex items-center gap-1 ml-auto"
                >
                  <span>Details & Architecture</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How I Build // Engineering Principles & Standards */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-6">
          <h2 className="text-2xl font-serif font-bold text-[#f0f6fc] tracking-tight">
            How I Build // Engineering Principles
          </h2>
          <span className="text-xs font-mono text-[#6e7681]">
            production invariants & coding standards
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ENGINEERING_PRINCIPLES.map((principle) => {
            const isExpanded = expandedPrinciple === principle.id;

            return (
              <div 
                key={principle.id}
                className={`rounded-xl border transition-all p-5 bg-[#161b22]/50 hover:bg-[#161b22]/80 flex flex-col justify-between ${
                  isExpanded ? 'border-sky-500/50 ring-1 ring-sky-500/20' : 'border-[#22272e] hover:border-[#30363d]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#0d1117] border border-[#2d333b] flex items-center justify-center shrink-0">
                        {getPrincipleIcon(principle.id)}
                      </div>
                      <h3 className="text-base font-serif font-bold text-[#f0f6fc] leading-snug">
                        {principle.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-mono text-sky-400/90 mb-3 italic">
                    &quot;{principle.tagline}&quot;
                  </p>

                  <div className="p-2 rounded bg-[#0d1117] border border-[#21262d] font-mono text-[11px] text-[#8b949e] mb-3">
                    <span className="text-[#6e7681] mr-1.5 block sm:inline">Invariant:</span>
                    <span className="text-[#c9d1d9]">{principle.invariant}</span>
                  </div>

                  <p className="text-xs text-[#adbac7] leading-relaxed mb-4">
                    {principle.description}
                  </p>
                </div>

                <div className="border-t border-[#22272e] pt-3">
                  <button
                    onClick={() => setExpandedPrinciple(isExpanded ? null : principle.id)}
                    className="flex items-center justify-between w-full text-xs font-mono text-sky-400 hover:text-sky-300 py-0.5"
                  >
                    <span>{isExpanded ? 'Hide implementation rules' : 'Inspect implementation rules'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <ul className="mt-3 space-y-1.5 text-xs text-[#adbac7] font-mono animate-fade-in">
                      {principle.rules.map((rule, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-2 bg-[#0d1117] p-2 rounded border border-[#22272e]">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
