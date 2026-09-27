import React from 'react';
import { SKILLS_DATA } from '../data/portfolioData';
import { 
  Code2, 
  Database, 
  Server, 
  Cpu, 
  Terminal, 
  Layers
} from 'lucide-react';

export const SkillsPage: React.FC = () => {

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 font-mono text-xs mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>backend_infrastructure.py</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#f0f6fc] tracking-tight">
          Technical Skills & Stack
        </h1>
        <p className="text-sm md:text-base text-[#8b949e] mt-2 max-w-3xl leading-relaxed">
          Comprehensive inventory of languages, frameworks, database engines, and development tools I work with.
        </p>
      </div>

      {/* Skills Categories Grid */}
      <div className="space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SKILLS_DATA.map((cat, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#22272e] bg-[#161b22]/40 p-6 hover:border-[#30363d] transition-all"
            >
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 flex items-center justify-center">
                  {idx === 0 && <Server className="w-4 h-4" />}
                  {idx === 1 && <Database className="w-4 h-4" />}
                  {idx === 2 && <Cpu className="w-4 h-4" />}
                  {idx === 3 && <Terminal className="w-4 h-4" />}
                  {idx === 4 && <Layers className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#f0f6fc]">
                    {cat.title}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-[#8b949e] font-mono mb-5 pl-11">
                {cat.subtitle}
              </p>

              <div className="space-y-3">
                {cat.skills.map((skill, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3 rounded-lg bg-[#0d1117] border border-[#21262d] hover:border-sky-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-[#f0f6fc]">
                        {skill.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/60 text-sky-300 border border-sky-800/30">
                        {skill.level}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e] leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
