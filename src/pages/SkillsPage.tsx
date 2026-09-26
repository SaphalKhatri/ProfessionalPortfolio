import React, { useState } from 'react';
import { SKILLS_DATA } from '../data/portfolioData';
import { 
  Code2, 
  Database, 
  Server, 
  Cpu, 
  Terminal, 
  ShieldCheck, 
  Layers, 
  Play, 
  RefreshCw, 
  CheckCircle2,
  GitBranch,
  ArrowRight
} from 'lucide-react';

interface ArchitectureNode {
  id: string;
  name: string;
  tech: string;
  role: string;
  invariants: string[];
  latency: string;
}

export const SkillsPage: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('fastapi');
  const [simulatingFlow, setSimulatingFlow] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(-1);

  const architectureNodes: ArchitectureNode[] = [
    {
      id: 'ingress',
      name: 'Ingress & TLS Proxy',
      tech: 'NGINX / Cloudflare Gateway',
      role: 'SSL/TLS termination, HTTP/2 multiplexing, rate-limiting, and reverse proxy routing to FastAPI instances.',
      invariants: ['Strict TLS 1.3 only', 'Gzip/Brotli compression', 'IP connection throttling (20 req/s burst limit)'],
      latency: '< 0.8 ms'
    },
    {
      id: 'fastapi',
      name: 'FastAPI ASGI App Cluster',
      tech: 'Python 3.12 + Uvicorn + uvloop',
      role: 'Asynchronous event loop execution, Pydantic v2 request serialization, dependency injection, and business logic routing.',
      invariants: ['Non-blocking cooperative async coroutines', 'Strict Pydantic payload validation', 'OpenAPI 3.1 auto-generation'],
      latency: '2.4 ms'
    },
    {
      id: 'redis',
      name: 'In-Memory Cache & Broker',
      tech: 'Redis 7.2 + aioredis',
      role: 'Database query caching, sub-millisecond session state, atomic token bucket rate-limiting, and Celery task broker queue.',
      invariants: ['Atomic Lua scripts for counters', 'LRU cache eviction policy', 'AOF persistence for queue safety'],
      latency: '< 0.4 ms'
    },
    {
      id: 'postgres',
      name: 'Primary Relational Database',
      tech: 'PostgreSQL 16 / Supabase',
      role: 'Persistent storage for user entities, recipe databases, embeddings metadata, and audit logs with strict relational integrity.',
      invariants: ['Full ACID transaction isolation', 'Foreign key cascades & B-tree indexes', 'Connection pooling via PgBouncer/SQLAlchemy'],
      latency: '3.8 ms'
    },
    {
      id: 'celery',
      name: 'Async Background Workers',
      tech: 'Celery + Redis Broker + Prefork',
      role: 'Offloaded heavy I/O operations, batch embeddings generation, report rendering, and external AI synthesis without blocking client requests.',
      invariants: ['Dead Letter Queue (DLQ) automated retry with exponential backoff', 'Idempotent task execution IDs', 'Isolated worker memory'],
      latency: 'Async / 120 ms'
    }
  ];

  const currentNode = architectureNodes.find((n) => n.id === selectedNode) || architectureNodes[1];

  const handleSimulateRequest = () => {
    if (simulatingFlow) return;
    setSimulatingFlow(true);
    setActiveStep(0);
    setSelectedNode(architectureNodes[0].id);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        const next = prev + 1;
        if (next < architectureNodes.length) {
          setSelectedNode(architectureNodes[next].id);
          return next;
        } else {
          clearInterval(stepInterval);
          setTimeout(() => {
            setSimulatingFlow(false);
            setActiveStep(-1);
          }, 800);
          return prev;
        }
      });
    }, 900);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 font-mono text-xs mb-3">
          <Code2 className="w-3.5 h-3.5" />
          <span>backend_infrastructure.py</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#f0f6fc] tracking-tight">
          Technical Skills & System Architecture
        </h1>
        <p className="text-sm md:text-base text-[#8b949e] mt-2 max-w-3xl leading-relaxed">
          Comprehensive inventory of languages, database engines, asynchronous paradigms, and microservice topologies I implement in production environments.
        </p>
      </div>

      {/* Interactive Backend Topology */}
      <div className="rounded-xl border border-[#22272e] bg-[#161b22]/50 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#f0f6fc] tracking-tight">
              Production Architecture Topology
            </h2>
            <p className="text-xs text-[#8b949e] font-mono mt-0.5">
              Click any node to inspect system invariants, or simulate an incoming HTTP request flow.
            </p>
          </div>

          <button
            onClick={handleSimulateRequest}
            disabled={simulatingFlow}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-mono transition-all ${
              simulatingFlow
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 cursor-wait'
                : 'bg-[#21262d] hover:bg-sky-500/20 text-[#c9d1d9] hover:text-sky-300 border border-[#30363d]'
            }`}
          >
            {simulatingFlow ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Tracing Request Flow...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-sky-400" />
                <span>Trace Live Request Flow</span>
              </>
            )}
          </button>
        </div>

        {/* Nodes Flow Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 mb-6">
          {architectureNodes.map((node, idx) => {
            const isSelected = selectedNode === node.id;
            const isStepActive = activeStep === idx;

            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`p-3.5 rounded-lg border text-left transition-all relative ${
                  isStepActive
                    ? 'border-sky-400 bg-sky-500/20 shadow-lg shadow-sky-500/10 ring-2 ring-sky-400/40'
                    : isSelected
                    ? 'border-sky-500/60 bg-[#1c2128] text-white'
                    : 'border-[#22272e] bg-[#0d1117] text-[#8b949e] hover:border-[#30363d] hover:text-[#c9d1d9]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-semibold text-[#6e7681]">
                    0{idx + 1}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isStepActive ? 'bg-sky-400 text-[#111315] font-bold' : 'bg-[#21262d] text-sky-300'
                  }`}>
                    {node.latency}
                  </span>
                </div>
                <div className="font-serif font-bold text-xs text-[#f0f6fc] truncate">
                  {node.name}
                </div>
                <div className="text-[11px] font-mono text-[#8b949e] truncate mt-0.5">
                  {node.tech}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Node Invariant Inspector */}
        <div className="p-5 rounded-lg bg-[#0d1117] border border-[#22272e] animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#22272e] pb-3 mb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                Node Specification
              </span>
              <h3 className="text-lg font-serif font-bold text-[#f0f6fc]">
                {currentNode.name} <span className="text-xs font-mono text-[#8b949e] font-normal">({currentNode.tech})</span>
              </h3>
            </div>
            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standard p99: {currentNode.latency}</span>
            </div>
          </div>

          <p className="text-xs text-[#adbac7] font-mono leading-relaxed mb-4">
            {currentNode.role}
          </p>

          <div>
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#6e7681] mb-2">
              Guaranteed Invariants & Configurations:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {currentNode.invariants.map((inv, idx) => (
                <div key={idx} className="p-2.5 rounded bg-[#161b22] border border-[#21262d] text-xs font-mono text-[#c9d1d9] flex items-start gap-2">
                  <span className="text-sky-400 mt-0.5">›</span>
                  <span>{inv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skills Categories Grid */}
      <div className="space-y-8">
        <h2 className="text-2xl font-serif font-bold text-[#f0f6fc] tracking-tight">
          Comprehensive Skill Breakdown
        </h2>

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
