import React, { useState } from 'react';
import { 
  Zap, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  Code, 
  Server,
  Layers
} from 'lucide-react';

interface EndpointConfig {
  id: string;
  name: string;
  method: 'GET' | 'POST';
  path: string;
  description: string;
  defaultPayload?: string;
  generateResponse: (payload?: any) => { status: number; body: object; latency: number };
}

export const ApiExplorerPage: React.FC = () => {
  const endpoints: EndpointConfig[] = [
    {
      id: 'movie-rec',
      name: 'Movie Similarity Recommender',
      method: 'POST',
      path: '/api/v1/recommend',
      description: 'Generates top-k content-based recommendations using TF-IDF sparse matrix cosine similarity.',
      defaultPayload: JSON.stringify({
        movie_title: "Interstellar",
        top_k: 4,
        include_similarity_scores: true
      }, null, 2),
      generateResponse: (p) => {
        const title = p?.movie_title || "Interstellar";
        const k = p?.top_k || 4;
        return {
          status: 200,
          latency: Math.floor(Math.random() * 8) + 9, // ~9-17ms
          body: {
            status: "success",
            query_title: title,
            vectorizer: "TfidfVectorizer(max_features=5000, ngram_range=(1,2))",
            similarity_algorithm: "CosineSimilarity_NumPy",
            execution_time_ms: 11.2,
            results: [
              { rank: 1, title: "Gravity", similarity_score: 0.819, genres: ["Sci-Fi", "Thriller"], year: 2013 },
              { rank: 2, title: "The Martian", similarity_score: 0.794, genres: ["Sci-Fi", "Adventure"], year: 2015 },
              { rank: 3, title: "Contact", similarity_score: 0.761, genres: ["Drama", "Sci-Fi"], year: 1997 },
              { rank: 4, title: "Arrival", similarity_score: 0.748, genres: ["Drama", "Mystery", "Sci-Fi"], year: 2016 }
            ].slice(0, k)
          }
        };
      }
    },
    {
      id: 'coffee-ai',
      name: 'Coffee Recipe (DB-First + Gemini)',
      method: 'POST',
      path: '/api/v1/recipes/search-or-generate',
      description: 'Queries PostgreSQL for cached drink recipe; falls back to Gemini 2.5 Flash on miss and persists result.',
      defaultPayload: JSON.stringify({
        drink_name: "Nitro Cold Brew with Himalayan Pink Salt",
        brew_equipment: "Nitro Keg / Siphon",
        sweetness_level: "light"
      }, null, 2),
      generateResponse: (p) => {
        const name = p?.drink_name || "Nitro Cold Brew";
        const isMiss = true;
        return {
          status: 200,
          latency: isMiss ? 340 : 6,
          body: {
            recipe_id: "rec_c0ff33_99a",
            drink_name: name,
            cache_hit: false,
            source: "google_gemini_2_5_flash_structured",
            db_persisted: true,
            recipe_details: {
              grind_profile: "Coarse burr grind",
              ratio: "1:8 cold brew concentrate",
              steep_time_hours: 18,
              infusion_gas: "Pure N2 at 45 PSI",
              flavor_notes: ["Dark cacao", "Saline floral sweetness", "Stout-like microfoam"]
            },
            telemetry: {
              sql_commit_time_ms: 4.8,
              model_latency_ms: 332.1
            }
          }
        };
      }
    },
    {
      id: 'task-dispatch',
      name: 'Celery Distributed Task Dispatcher',
      method: 'POST',
      path: '/api/v1/tasks/dispatch',
      description: 'Enqueues asynchronous batch jobs into Redis broker with dead-letter queue (DLQ) safeguards.',
      defaultPayload: JSON.stringify({
        task_name: "tasks.compute_vector_embeddings",
        payload: { batch_size: 500, dataset: "kaggle_movies_2026" },
        priority: "high"
      }, null, 2),
      generateResponse: (p) => ({
        status: 202,
        latency: 14,
        body: {
          task_id: "celery_uuid_8fa99c01_b124",
          status: "ENQUEUED",
          queue: "high_priority_queue",
          broker: "redis://127.0.0.1:6379/0",
          estimated_execution_ms: 850
        }
      })
    },
    {
      id: 'health-check',
      name: 'System Health & Cache Diagnostics',
      method: 'GET',
      path: '/api/v1/health',
      description: 'Returns real-time cluster health, PostgreSQL connection pool metrics, and Redis cache hit ratios.',
      generateResponse: () => ({
        status: 200,
        latency: 3,
        body: {
          status: "OPERATIONAL",
          service: "khatrisaphal-backend-core",
          environment: "production",
          python_version: "3.12.3",
          database: {
            engine: "PostgreSQL 16.2",
            pool_size: 20,
            active_connections: 3,
            ping_ms: 1.1
          },
          cache: {
            engine: "Redis 7.2.4",
            hit_ratio: 0.942,
            uptime_seconds: 864200
          }
        }
      })
    }
  ];

  const [activeEndpointId, setActiveEndpointId] = useState<string>(endpoints[0].id);
  const activeEndpoint = endpoints.find((e) => e.id === activeEndpointId) || endpoints[0];

  const [payloadText, setPayloadText] = useState<string>(activeEndpoint.defaultPayload || '');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const handleSelectEndpoint = (id: string) => {
    setActiveEndpointId(id);
    const selected = endpoints.find((e) => e.id === id);
    if (selected) {
      setPayloadText(selected.defaultPayload || '');
      setResponseOutput(null);
    }
  };

  const handleExecute = () => {
    setIsExecuting(true);
    let parsedPayload = null;
    if (activeEndpoint.method === 'POST') {
      try {
        parsedPayload = JSON.parse(payloadText);
      } catch (err) {
        setResponseOutput({
          status: 422,
          latency: 2,
          body: {
            error: "Unprocessable Entity",
            detail: "Invalid JSON body provided to endpoint."
          }
        });
        setIsExecuting(false);
        return;
      }
    }

    setTimeout(() => {
      const resp = activeEndpoint.generateResponse(parsedPayload);
      setResponseOutput(resp);
      setIsExecuting(false);
    }, 280);
  };

  const handleCopyCurl = () => {
    const curl = activeEndpoint.method === 'POST'
      ? `curl -X POST "https://api.khatrisaphal.com.np${activeEndpoint.path}" \\\n  -H "Content-Type: application/json" \\\n  -d '${payloadText.replace(/\n/g, '')}'`
      : `curl -X GET "https://api.khatrisaphal.com.np${activeEndpoint.path}"`;

    navigator.clipboard.writeText(curl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-sky-950/60 border border-sky-800/40 text-sky-400 font-mono text-xs mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>openapi_contract_testbed.py</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#f0f6fc] tracking-tight">
          API Contract Playground
        </h1>
        <p className="text-sm md:text-base text-[#8b949e] mt-2 max-w-3xl leading-relaxed">
          Interactive REST client executing simulated requests against production schemas for Saphal's Movie Recommendation ML API, Coffee Gemini Caching API, and Celery Distributed Task Dispatcher.
        </p>
      </div>

      {/* Main Explorer Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoint Selector Column */}
        <div className="lg:col-span-4 space-y-2">
          <p className="text-[11px] font-mono uppercase tracking-wider text-[#6e7681] px-2 mb-2">
            Available Endpoints
          </p>
          {endpoints.map((ep) => {
            const isSelected = ep.id === activeEndpointId;
            return (
              <button
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep.id)}
                className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-sky-500/60 bg-[#1c2128] text-white shadow-lg shadow-sky-500/5'
                    : 'border-[#22272e] bg-[#161b22]/40 text-[#8b949e] hover:border-[#30363d] hover:text-[#c9d1d9]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {ep.method}
                  </span>
                  <span className="text-xs font-mono text-[#f0f6fc] truncate">
                    {ep.path}
                  </span>
                </div>
                <div className="text-xs font-serif text-[#adbac7] truncate">
                  {ep.name}
                </div>
              </button>
            );
          })}
        </div>

        {/* Execution Column */}
        <div className="lg:col-span-8 rounded-xl border border-[#22272e] bg-[#161b22]/50 p-6 space-y-6">
          {/* Header of Endpoint */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#22272e] pb-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  activeEndpoint.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {activeEndpoint.method}
                </span>
                <span className="text-[#f0f6fc] font-semibold">{activeEndpoint.path}</span>
              </div>
              <p className="text-xs text-[#8b949e] mt-1 font-serif">
                {activeEndpoint.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCurl}
                className="text-xs font-mono text-[#8b949e] hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#21262d] border border-[#30363d] transition-colors"
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>cURL</span>
                  </>
                )}
              </button>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded text-xs font-mono font-bold bg-sky-500 hover:bg-sky-400 text-[#0d1117] transition-all shadow-md shadow-sky-500/20"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Request Payload Editor (if POST) */}
          {activeEndpoint.method === 'POST' && (
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#8b949e] mb-2">
                Request JSON Payload
              </label>
              <textarea
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                rows={7}
                className="w-full bg-[#0d1117] border border-[#22272e] rounded-lg p-3 text-xs font-mono text-amber-200/90 focus:outline-none focus:border-sky-500/60 resize-none"
              />
            </div>
          )}

          {/* Response Inspector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8b949e]">
                Response Payload
              </span>
              {responseOutput && (
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    HTTP {responseOutput.status} OK
                  </span>
                  <span className="text-[#6e7681]">
                    Latency: <strong className="text-sky-400">{responseOutput.latency} ms</strong>
                  </span>
                </div>
              )}
            </div>

            <pre className="p-4 rounded-lg bg-[#0d1117] border border-[#22272e] text-xs font-mono text-sky-200/90 overflow-x-auto min-h-[160px] leading-relaxed">
              {responseOutput ? (
                JSON.stringify(responseOutput.body, null, 2)
              ) : (
                <span className="text-[#6e7681] italic">
                  Press 'Send Request' to execute this contract against simulated FastAPI backend...
                </span>
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
