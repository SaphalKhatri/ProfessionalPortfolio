import React, { useState } from 'react';
import { PROJECTS_DATA } from '../data/portfolioData';
import { ProjectItem } from '../types/portfolio';
import { 
  Github, 
  ExternalLink, 
  Terminal, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Zap, 
  Database,
  Code
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const categories = ['All', 'Machine Learning & AI', 'FastAPI & AI Integration', 'Distributed Systems & Tasks', 'Full Stack & APIs'];

  const filteredProjects = selectedCategory === 'All'
    ? PROJECTS_DATA
    : PROJECTS_DATA.filter((p) => p.category === selectedCategory);

  const handleCopyCurl = (path: string, project: ProjectItem) => {
    const endpoint = project.endpointsSample?.find((e) => e.path === path);
    const curlCommand = endpoint?.method === 'POST'
      ? `curl -X POST "https://api.khatrisaphal.com.np${path}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(endpoint.samplePayload || {})}'`
      : `curl -X GET "https://api.khatrisaphal.com.np${path}"`;

    navigator.clipboard.writeText(curlCommand);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 font-mono text-xs mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>production_showcases.py</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#f0f6fc] tracking-tight">
          Featured Projects & Architectures
        </h1>
        <p className="text-sm md:text-base text-[#8b949e] mt-2 max-w-3xl leading-relaxed">
          Production systems, machine learning recommendation services, and async task pipelines architected with Python, FastAPI, PostgreSQL, and modern distributed tooling.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#22272e] pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              selectedCategory === cat
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 font-medium'
                : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#161b22] border border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      <div className="space-y-8">
        {filteredProjects.map((project) => {
          const isExpanded = expandedProjectId === project.id;

          return (
            <div
              key={project.id}
              className="rounded-xl border border-[#22272e] bg-[#161b22]/50 hover:border-[#30363d] transition-all p-6 md:p-8"
            >
              {/* Top metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 bg-sky-950/60 border border-sky-800/30 px-2.5 py-0.5 rounded mr-3">
                    {project.category}
                  </span>
                  <span className="text-xs font-mono text-[#6e7681]">
                    Backend Service
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-xs font-mono text-[#c9d1d9] hover:text-white transition-colors border border-[#30363d]"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>View Repository</span>
                    <ExternalLink className="w-3 h-3 text-[#8b949e]" />
                  </a>
                </div>
              </div>

              {/* Title & Tagline */}
              <h2 className="text-2xl font-serif font-bold text-[#f0f6fc] tracking-tight mb-2">
                {project.name}
              </h2>
              <p className="text-sm text-sky-300/90 font-serif italic mb-5">
                {project.tagline}
              </p>

              {/* Metrics Pill Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-[#0d1117]/80 p-3.5 rounded-lg border border-[#21262d]">
                {project.metrics.map((m, idx) => (
                  <div key={idx} className="border-l border-[#30363d] pl-3 py-0.5">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-[#6e7681]">
                      {m.label}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bullets */}
              <div className="mb-6 space-y-2">
                {project.description.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-[#adbac7] leading-relaxed">
                    <span className="text-sky-400 font-mono mt-0.5">•</span>
                    <span>{bullet}</span>
                  </div>
                ))}
              </div>

              {/* Tech Stack Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-mono px-2.5 py-1 rounded bg-[#21262d] text-[#c9d1d9] border border-[#30363d]/60"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Expandable Architecture & Endpoint Deep Dive */}
              <div className="border-t border-[#22272e] pt-4">
                <button
                  onClick={() => setExpandedProjectId(isExpanded ? null : project.id)}
                  className="flex items-center gap-2 text-xs font-mono text-sky-400 hover:text-sky-300 transition-colors py-1"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>
                    {isExpanded ? 'Hide Architecture & API Spec' : 'Inspect Architecture & OpenAPI Spec'}
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-[#22272e]/60 space-y-6 animate-fade-in">
                    {/* Architecture Highlights */}
                    <div>
                      <h4 className="text-xs font-mono uppercase tracking-wider text-[#8b949e] mb-3">
                        Internal Architecture & Invariants:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {project.architectureHighlights.map((hl, i) => (
                          <div
                            key={i}
                            className="p-3 rounded bg-[#0d1117] border border-[#22272e] text-xs text-[#adbac7] font-mono leading-relaxed"
                          >
                            <span className="text-sky-400 mr-2">›</span>
                            {hl}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Endpoints Samples */}
                    {project.endpointsSample && project.endpointsSample.length > 0 && (
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider text-[#8b949e] mb-3">
                          API Contract & Sample Responses:
                        </h4>
                        <div className="space-y-4">
                          {project.endpointsSample.map((ep, eIdx) => (
                            <div key={eIdx} className="rounded-lg bg-[#0d1117] border border-[#22272e] overflow-hidden">
                              <div className="p-3 bg-[#161b22] border-b border-[#22272e] flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 font-mono text-xs">
                                  <span className={`px-2 py-0.5 rounded font-bold ${
                                    ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                                  }`}>
                                    {ep.method}
                                  </span>
                                  <span className="text-[#f0f6fc]">{ep.path}</span>
                                </div>

                                <button
                                  onClick={() => handleCopyCurl(ep.path, project)}
                                  className="text-[11px] font-mono text-[#8b949e] hover:text-white flex items-center gap-1.5 px-2 py-1 rounded bg-[#21262d] transition-colors"
                                >
                                  {copiedPath === ep.path ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied cURL!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy cURL</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="p-4 text-xs font-mono space-y-3">
                                <p className="text-[#8b949e] text-[11px]">
                                  {ep.description}
                                </p>

                                {ep.samplePayload && (
                                  <div>
                                    <span className="text-[10px] text-[#6e7681] uppercase tracking-wider block mb-1">
                                      Request Body (JSON)
                                    </span>
                                    <pre className="p-2.5 rounded bg-[#111315] text-amber-200/90 overflow-x-auto text-[11px]">
                                      {JSON.stringify(ep.samplePayload, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                <div>
                                  <span className="text-[10px] text-[#6e7681] uppercase tracking-wider block mb-1">
                                    Response (200 OK)
                                  </span>
                                  <pre className="p-2.5 rounded bg-[#111315] text-sky-200/90 overflow-x-auto text-[11px]">
                                    {JSON.stringify(ep.sampleResponse, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
