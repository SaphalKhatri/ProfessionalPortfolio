import React, { useState, useEffect } from 'react';
import { PageId } from './types/portfolio';
import { PERSONAL_INFO } from './data/portfolioData';
import { Sidebar } from './components/Sidebar';
import { AboutPage } from './pages/AboutPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { SkillsPage } from './pages/SkillsPage';
import { BugSmasherPage } from './pages/BugSmasherPage';
import { ApiExplorerPage } from './pages/ApiExplorerPage';
import { ContactPage } from './pages/ContactPage';
import { TerminalDrawer } from './components/TerminalDrawer';
import { 
  Terminal, 
  Menu, 
  X, 
  Layers, 
  User, 
  Code2, 
  Cpu, 
  Zap, 
  Send,
  ExternalLink,
  ChevronRight,
  Gamepad2
} from 'lucide-react';

export default function App() {
  // Sync page state with window.location.hash
  const getInitialPage = (): PageId => {
    const hash = window.location.hash.replace('#', '') as PageId;
    const validPages: PageId[] = ['about', 'projects', 'skills', 'bug-smasher', 'api-explorer', 'contact'];
    return validPages.includes(hash) ? hash : 'about';
  };

  const [activePage, setActivePage] = useState<PageId>(getInitialPage());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Synchronize hash on page change and listen to browser history
  useEffect(() => {
    window.location.hash = activePage;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activePage]);

  useEffect(() => {
    const handleHashChange = () => {
      const page = getInitialPage();
      setActivePage(page);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global keyboard shortcut to open interactive terminal drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setTerminalOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;
      case 'projects':
        return <ProjectsPage />;
      case 'skills':
        return <SkillsPage />;
      case 'bug-smasher':
        return <BugSmasherPage />;
      case 'api-explorer':
        return <ApiExplorerPage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <AboutPage onNavigate={handleNavigate} />;
    }
  };

  const pageNames: Record<PageId, string> = {
    about: 'About',
    projects: 'Projects',
    skills: 'Skills & Architecture',
    'bug-smasher': 'Bug Smasher Arcade',
    'api-explorer': 'API Playground',
    contact: 'Contact'
  };

  return (
    <div className="min-h-screen bg-[#111315] text-[#d1d5db] flex flex-col lg:flex-row antialiased font-sans selection:bg-sky-500/25 selection:text-sky-200">
      {/* Mobile Top Header */}
      <header className="lg:hidden border-b border-[#21262d] bg-[#111315]/95 backdrop-blur-md px-4 py-3 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={PERSONAL_INFO.avatar}
            alt={PERSONAL_INFO.name}
            className="w-8 h-8 rounded-full object-cover border border-sky-500/50"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <span className="font-serif font-bold text-sm text-[#f0f6fc] block leading-tight">
              {PERSONAL_INFO.name}
            </span>
            <span className="text-[10px] font-mono text-sky-400 block">
              {pageNames[activePage]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTerminalOpen(true)}
            className="p-1.5 rounded bg-[#161b22] text-[#8b949e] hover:text-sky-400 border border-[#30363d]"
            title="Open CLI Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded bg-[#161b22] text-[#8b949e] hover:text-white border border-[#30363d]"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[53px] bg-[#0d1117] border-b border-[#21262d] z-30 p-4 space-y-1 shadow-2xl animate-fade-in font-mono text-xs">
          <p className="text-[10px] uppercase text-[#6e7681] px-2 py-1 tracking-wider">
            Switch Page:
          </p>
          {(['about', 'projects', 'skills', 'bug-smasher', 'api-explorer', 'contact'] as PageId[]).map((page) => (
            <button
              key={page}
              onClick={() => handleNavigate(page)}
              className={`w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between ${
                activePage === page
                  ? 'bg-sky-500/20 text-sky-300 font-bold border-l-2 border-sky-400'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#161b22]'
              }`}
            >
              <span>{pageNames[page]}</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          ))}
          <div className="pt-3 border-t border-[#21262d] flex items-center justify-between text-[11px] text-[#8b949e] px-2">
            <span>khatrisaphal92@gmail.com</span>
            <a
              href={PERSONAL_INFO.currentSite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 flex items-center gap-1"
            >
              <span>khatrisaphal.com.np</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Persistent Left Sidebar on Desktop */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenTerminal={() => setTerminalOpen(true)}
      />

      {/* Main Distinct Page Content Canvas */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Top breadcrumb / status bar for engineering polish */}
        <div className="hidden lg:flex items-center justify-between px-10 py-3.5 border-b border-[#22272e] bg-[#111315]/80 backdrop-blur text-xs font-mono text-[#6e7681]">
          <div className="flex items-center gap-2">
            <span className="text-[#8b949e]">saphal_khatri</span>
            <span>/</span>
            <span className="text-[#8b949e]">pages</span>
            <span>/</span>
            <span className="text-sky-400 font-medium">{activePage}.py</span>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[#8b949e]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>uvloop 0.20 · HTTP/2</span>
            </span>
            <button
              onClick={() => setTerminalOpen(true)}
              className="hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>CLI (~)</span>
            </button>
          </div>
        </div>

        {/* Active Page Body */}
        <div className="flex-1 p-6 md:p-10 lg:p-14 max-w-5xl w-full mx-auto">
          {renderActivePage()}
        </div>

        {/* Global Page Footer */}
        <footer className="border-t border-[#22272e] px-6 md:px-10 py-6 text-xs font-mono text-[#6e7681] flex flex-col sm:flex-row items-center justify-between gap-4 max-w-5xl w-full mx-auto">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Saphal Kumar Khatri</span>
            <span>·</span>
            <span>Kathmandu, Nepal</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={PERSONAL_INFO.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#c9d1d9] transition-colors"
            >
              GitHub
            </a>
            <a
              href={PERSONAL_INFO.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-400 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={PERSONAL_INFO.currentSite}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              khatrisaphal.com.np ↗
            </a>
          </div>
        </footer>
      </main>

      {/* Interactive CLI Terminal Drawer */}
      <TerminalDrawer
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
      />
    </div>
  );
}
