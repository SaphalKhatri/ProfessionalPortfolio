import React, { useState, useEffect, useRef } from 'react';
import { X, Terminal as TerminalIcon, Maximize2, Minimize2, Camera, ExternalLink } from 'lucide-react';
import { PERSONAL_INFO, PROJECTS_DATA, SKILLS_DATA } from '../data/portfolioData';
import { MEMORIES_DATA, GOOGLE_DRIVE_FOLDER_URL } from '../data/memoriesData';
import { PageId } from '../types/portfolio';

interface TerminalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: PageId) => void;
}

interface CommandHistoryItem {
  command: string;
  output: React.ReactNode;
}

export const TerminalDrawer: React.FC<TerminalDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      command: 'system-init',
      output: (
        <div className="space-y-1 text-zinc-400">
          <p className="text-sky-400 font-semibold">
            Python 3.12.3 (CPython Linux x86_64) [FastAPI + AsyncIO + uvloop]
          </p>
          <p>Welcome to Saphal Kumar Khatri's backend shell. Type <span className="text-zinc-200">help</span> to list commands, or <span className="text-zinc-200">python -c &quot;import this&quot;</span>.</p>
        </div>
      )
    }
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [commandList, setCommandList] = useState<string[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmd: string) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setCommandList((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const parts = trimmed.split(' ');
    const root = parts[0].toLowerCase();

    let output: React.ReactNode = null;

    switch (root) {
      case 'help':
        output = (
          <div className="space-y-1 text-zinc-300 font-mono text-xs">
            <p className="text-sky-400 font-bold mb-1">Available Commands:</p>
            <p><span className="text-emerald-400 w-28 inline-block">bio</span> Print engineer summary & background</p>
            <p><span className="text-emerald-400 w-28 inline-block">skills</span> List core backend & distributed stack</p>
            <p><span className="text-emerald-400 w-28 inline-block">projects</span> List top production systems</p>
            <p><span className="text-emerald-400 w-28 inline-block">memories</span> Photo dump & Google Drive college archive</p>
            <p><span className="text-emerald-400 w-28 inline-block">curl &lt;url&gt;</span> Simulated HTTP curl client (e.g. curl /health)</p>
            <p><span className="text-emerald-400 w-28 inline-block">python</span> Interactive Python command runner</p>
            <p><span className="text-emerald-400 w-28 inline-block">contact</span> Output email and direct coordinates</p>
            <p><span className="text-emerald-400 w-28 inline-block">clear</span> Clear terminal buffer</p>
            <p><span className="text-emerald-400 w-28 inline-block">exit</span> Close terminal session</p>
          </div>
        );
        break;

      case 'bio':
        output = (
          <div className="space-y-2 text-zinc-300 text-xs font-mono">
            <p className="font-bold text-zinc-100">{PERSONAL_INFO.name} — {PERSONAL_INFO.title}</p>
            <p>{PERSONAL_INFO.bioParagraphs[0]}</p>
            <p>{PERSONAL_INFO.bioParagraphs[1]}</p>
          </div>
        );
        break;

      case 'skills':
        output = (
          <div className="space-y-2 text-zinc-300 text-xs font-mono">
            {SKILLS_DATA.map((c) => (
              <div key={c.title}>
                <span className="text-sky-400 font-semibold">{c.title}: </span>
                <span className="text-zinc-400">{c.skills.map((s) => s.name).join(' · ')}</span>
              </div>
            ))}
          </div>
        );
        break;

      case 'projects':
        output = (
          <div className="space-y-1.5 text-zinc-300 text-xs font-mono">
            {PROJECTS_DATA.map((p) => (
              <div key={p.id}>
                <span className="text-emerald-400 font-semibold">{p.name}</span>
                <span className="text-zinc-400"> — {p.tagline}</span>
              </div>
            ))}
          </div>
        );
        break;

      case 'memories':
      case 'photos':
        output = (
          <div className="space-y-2 text-zinc-300 text-xs font-mono">
            <div className="flex items-center justify-between text-sky-400 font-semibold">
              <span>{MEMORIES_DATA.length} visual moments loaded from Google Drive archive</span>
              {onNavigate && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('memories');
                  }}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Gallery</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="space-y-1 text-zinc-400">
              {MEMORIES_DATA.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <span className="text-amber-400">[{m.date}]</span>
                  <span className="text-zinc-200">{m.title}</span>
                  <span className="text-zinc-500">({m.category})</span>
                </div>
              ))}
              <p className="text-zinc-500 pt-1">+ {MEMORIES_DATA.length - 4} more college, hackathon & travel photos in gallery.</p>
            </div>
          </div>
        );
        break;

      case 'curl':
        const target = parts[1] || '/health';
        output = (
          <div className="space-y-1 text-zinc-300 text-xs font-mono">
            <p className="text-zinc-500">&gt; GET {target} HTTP/1.1</p>
            <p className="text-zinc-500">&lt; HTTP/1.1 200 OK</p>
            <p className="text-zinc-500">&lt; content-type: application/json; charset=utf-8</p>
            <pre className="text-emerald-400 pt-1">
              {JSON.stringify(
                {
                  status: 'healthy',
                  host: 'api.khatrisaphal.com.np',
                  runtime: 'FastAPI/0.115.0 + uvloop',
                  uptime_seconds: 489201,
                  active_pg_pool: 14,
                  redis_ping_ms: 0.3
                },
                null,
                2
              )}
            </pre>
          </div>
        );
        break;

      case 'python':
        if (parts.length === 1) {
          output = (
            <p className="text-zinc-400 text-xs font-mono">
              Usage: python -c &quot;expression&quot; (Try: python -c &quot;import this&quot;)
            </p>
          );
        } else if (trimmed.includes('import this')) {
          output = (
            <div className="space-y-1 text-zinc-300 italic text-xs font-mono">
              <p className="text-sky-400 not-italic font-bold">The Zen of Python, by Tim Peters:</p>
              <p>Beautiful is better than ugly.</p>
              <p>Explicit is better than implicit.</p>
              <p>Simple is better than complex.</p>
              <p>Complex is better than complicated.</p>
              <p>Flat is better than nested.</p>
              <p>Sparse is better than dense.</p>
              <p>Readability counts.</p>
              <p>Special cases aren&apos;t special enough to break the rules.</p>
              <p>Although practicality beats purity.</p>
              <p>Errors should never pass silently.</p>
            </div>
          );
        } else {
          output = (
            <p className="text-emerald-400 text-xs font-mono">
              Python 3.12.3 (CPython/uvloop) — executed in 0.04ms.
            </p>
          );
        }
        break;

      case 'contact':
        output = (
          <div className="space-y-1 text-zinc-300 text-xs font-mono">
            <p>Email: <a href={`mailto:${PERSONAL_INFO.email}`} className="text-sky-400 underline">{PERSONAL_INFO.email}</a></p>
            <p>GitHub: <a href={PERSONAL_INFO.github} target="_blank" rel="noreferrer" className="text-sky-400 underline">{PERSONAL_INFO.github}</a></p>
            <p>LinkedIn: <a href={PERSONAL_INFO.linkedin} target="_blank" rel="noreferrer" className="text-sky-400 underline">{PERSONAL_INFO.linkedin}</a></p>
            <p>Portfolio: <a href={PERSONAL_INFO.currentSite} target="_blank" rel="noreferrer" className="text-emerald-400 underline">{PERSONAL_INFO.currentSite}</a></p>
          </div>
        );
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      case 'exit':
      case 'quit':
        onClose();
        setInputVal('');
        return;

      default:
        output = (
          <p className="text-rose-400 text-xs font-mono">
            Command not recognized: &quot;{trimmed}&quot;. Type <span className="text-zinc-200">help</span> for reference.
          </p>
        );
        break;
    }

    setHistory((prev) => [...prev, { command: trimmed, output }]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandList.length === 0) return;
      const nextIdx = historyIndex + 1 < commandList.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInputVal(commandList[commandList.length - 1 - nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandList[commandList.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full ${
          isMaximized ? 'h-full max-w-none' : 'max-w-3xl h-130'
        } bg-[#0c0e10] border border-[#2d333b] rounded-t-lg sm:rounded-lg shadow-2xl flex flex-col overflow-hidden font-mono text-xs`}
      >
        {/* Terminal Header Bar */}
        <div className="px-4 py-2.5 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-zinc-400">
            <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold text-zinc-300">python-backend-shell // saphal@kathmandu</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1 hover:text-white transition-colors"
              title={isMaximized ? 'Restore' : 'Maximize'}
            >
              {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:text-white transition-colors"
              title="Close terminal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex-1 p-4 overflow-y-auto space-y-3 cursor-text bg-[#0e1012]"
        >
          {history.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-2 text-zinc-400">
                <span className="text-sky-400">saphal@node:~$</span>
                <span className="text-zinc-100 font-medium">{item.command}</span>
              </div>
              <div className="pl-4">{item.output}</div>
            </div>
          ))}

          {/* Active Input Line */}
          <div className="flex items-center gap-2 text-zinc-400 pt-1">
            <span className="text-sky-400">saphal@node:~$</span>
            <input
              ref={inputRef}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-zinc-100 focus:outline-none caret-sky-400"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-1.5 bg-[#161b22] border-t border-[#21262d] text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Shortcuts: help · bio · skills · projects · curl · exit</span>
          <span>Press ESC or click close to dismiss</span>
        </div>
      </div>
    </div>
  );
};
