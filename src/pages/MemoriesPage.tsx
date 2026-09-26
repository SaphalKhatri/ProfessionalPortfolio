import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FolderPlus, 
  Sparkles, 
  Check, 
  Search, 
  RefreshCw,
  Copy,
  FolderGit2,
  AlertCircle
} from 'lucide-react';
import { MemoryItem } from '../types/portfolio';
import { 
  MEMORIES_DATA, 
  GOOGLE_DRIVE_FOLDER_URL, 
  DEFAULT_FOLDER_SYNC_API_URL, 
  GOOGLE_APPS_SCRIPT_SNIPPET, 
  resolveDriveImageUrl 
} from '../data/memoriesData';

type CategoryFilter = 'All' | 'College' | 'Hackathons' | 'Campus Life' | 'Meetups' | 'Travel';

export const MemoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showDriveHelper, setShowDriveHelper] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'script' | 'manual'>('script');

  // Live Folder Sync State
  const [syncUrl, setSyncUrl] = useState<string>(() => {
    return localStorage.getItem('portfolio_drive_sync_url') || DEFAULT_FOLDER_SYNC_API_URL || '';
  });
  const [syncedMemories, setSyncedMemories] = useState<MemoryItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Link tester state
  const [testLink, setTestLink] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const categories: CategoryFilter[] = ['All', 'College', 'Hackathons', 'Campus Life', 'Meetups', 'Travel'];

  // Fetch live memories from Apps Script
  const fetchLiveMemories = async (endpointUrl: string) => {
    if (!endpointUrl || !endpointUrl.startsWith('http')) return;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const res = await fetch(endpointUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reach Drive script`);
      const data = await res.json();

      if (data && Array.isArray(data.data)) {
        setSyncedMemories(data.data);
        setLastSyncedAt(new Date());
      } else if (Array.isArray(data)) {
        setSyncedMemories(data);
        setLastSyncedAt(new Date());
      } else if (data.status === 'error') {
        throw new Error(data.message || 'Google Drive script error');
      }
    } catch (err: any) {
      console.warn('Drive sync error:', err);
      setSyncError(err.message || 'Could not fetch from Drive script');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (syncUrl) {
      fetchLiveMemories(syncUrl);
    }
  }, [syncUrl]);

  // Combine static curated memories with live synced ones
  const allMemories = React.useMemo(() => {
    const existingIds = new Set(syncedMemories.map(m => m.id));
    const curatedFiltered = MEMORIES_DATA.filter(m => !existingIds.has(m.id));
    return [...syncedMemories, ...curatedFiltered];
  }, [syncedMemories]);

  const filteredMemories = allMemories.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Handle keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null && prev < filteredMemories.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredMemories.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredMemories.length]);

  const handleTestDriveLink = () => {
    if (!testLink.trim()) return;
    const resolved = resolveDriveImageUrl(testLink);
    setTestResult(resolved);
  };

  const handleSaveSyncUrl = (newUrl: string) => {
    const trimmed = newUrl.trim();
    setSyncUrl(trimmed);
    localStorage.setItem('portfolio_drive_sync_url', trimmed);
    if (trimmed) {
      fetchLiveMemories(trimmed);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentLightboxItem = lightboxIndex !== null ? filteredMemories[lightboxIndex] : null;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-400">
            <Camera className="w-3.5 h-3.5" />
            <span>Memories & Photo Dump</span>
          </div>

          {syncUrl ? (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isSyncing ? 'animate-ping' : ''}`} />
              <span>Drive Auto-Sync Active</span>
              {syncedMemories.length > 0 && <span>({syncedMemories.length} live)</span>}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs font-mono text-zinc-400">
              <FolderGit2 className="w-3 h-3 text-amber-400" />
              <span>Manual / Pre-configured</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-zinc-100 tracking-tight">
              Life Beyond the Terminal
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
              A curated visual archive of college milestones, hackathon all-nighters, Kathmandu tech meetups, and travel memories.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            {syncUrl && (
              <button
                onClick={() => fetchLiveMemories(syncUrl)}
                disabled={isSyncing}
                className="px-3 py-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
                title="Refresh photos from Drive"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            )}

            <button
              onClick={() => setShowDriveHelper(true)}
              className="px-3.5 py-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono flex items-center gap-2 transition-all shadow-sm"
              title="How to connect your Google Drive folder"
            >
              <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
              <span>Drive Setup</span>
            </button>

            <a
              href={GOOGLE_DRIVE_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-sky-500/20"
            >
              <span>Drive Album</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Sync notification if error */}
        {syncError && (
          <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Sync note: {syncError}. Showing default gallery.</span>
            </div>
            <button 
              onClick={() => setShowDriveHelper(true)}
              className="text-xs text-sky-400 hover:underline"
            >
              Check Script Setup
            </button>
          </div>
        )}
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#22272e]">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs font-mono no-scrollbar">
          {categories.map((cat) => {
            const count = cat === 'All' 
              ? allMemories.length 
              : allMemories.filter(m => m.category === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40 shadow-sm'
                    : 'bg-[#161b22] text-zinc-400 hover:text-zinc-200 border border-[#21262d]'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-sky-400/20 text-sky-200' : 'bg-zinc-800 text-zinc-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Search */}
        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tags, places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-[#161b22] border border-[#21262d] text-zinc-200 text-xs placeholder:text-zinc-500 focus:outline-none focus:border-sky-500/60 font-mono transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* Photo Gallery Grid */}
      <section>
        {filteredMemories.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-[#161b22]/40 rounded-lg border border-[#21262d]">
            <Camera className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-zinc-300 font-medium">No memories found</p>
            <p className="text-xs font-mono text-zinc-500">
              Try adjusting your category filter or search terms.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMemories.map((item, idx) => {
              const imageUrl = resolveDriveImageUrl(item.driveIdOrUrl);
              return (
                <div
                  key={item.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative bg-[#161b22] border border-[#21262d] hover:border-sky-500/50 rounded-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-4/3 bg-zinc-950 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-105"
                      onError={(e) => {
                        // Fallback to placeholder if an unshared Drive link fails
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    
                    {/* Dark gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Category & Date badge on image */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono">
                      <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-sky-300 border border-white/10">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                        {item.date}
                      </span>
                    </div>

                    {item.location && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-mono text-zinc-300 drop-shadow">
                        <MapPin className="w-3 h-3 text-sky-400" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content Info */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-zinc-100 group-hover:text-sky-300 transition-colors text-base line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-3">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1117] text-zinc-400 border border-[#21262d]"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Lightbox Modal */}
      {currentLightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 animate-fade-in">
          {/* Close button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-700 transition-colors"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredMemories.length - 1));
            }}
            className="absolute left-2 sm:left-4 z-50 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-700 transition-colors"
            title="Previous (←)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((prev) => (prev !== null && prev < filteredMemories.length - 1 ? prev + 1 : 0));
            }}
            className="absolute right-2 sm:right-4 z-50 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-700 transition-colors"
            title="Next (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Card Container */}
          <div className="max-w-4xl w-full max-h-[90vh] bg-[#0e1117] border border-[#2d333b] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Image Stage */}
            <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-75 md:min-h-120">
              <img
                src={resolveDriveImageUrl(currentLightboxItem.driveIdOrUrl)}
                alt={currentLightboxItem.title}
                className="max-h-[75vh] w-auto object-contain mx-auto"
              />
            </div>

            {/* Sidebar Details */}
            <div className="md:w-2/5 p-6 flex flex-col justify-between bg-[#161b22] border-t md:border-t-0 md:border-l border-[#21262d] space-y-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {currentLightboxItem.category}
                  </span>
                  <span className="text-zinc-500">
                    {lightboxIndex! + 1} of {filteredMemories.length}
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-serif font-bold text-zinc-100">
                    {currentLightboxItem.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-zinc-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {currentLightboxItem.date}
                    </span>
                    {currentLightboxItem.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-400" />
                        {currentLightboxItem.location}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                  {currentLightboxItem.caption}
                </p>

                {currentLightboxItem.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {currentLightboxItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-mono px-2 py-0.5 rounded bg-[#161b22] text-zinc-400 border border-[#21262d]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Lightbox Footer Actions */}
              <div className="pt-4 border-t border-[#22272e] flex items-center justify-between text-xs font-mono">
                <a
                  href={resolveDriveImageUrl(currentLightboxItem.driveIdOrUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>Open Full Resolution</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <span className="text-zinc-600 hidden sm:inline">Esc to dismiss</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Drive Integration Guidance Modal */}
      {showDriveHelper && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="max-w-2xl w-full bg-[#161b22] border border-[#2d333b] rounded-lg shadow-2xl p-5 sm:p-6 space-y-5 font-sans max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif font-bold text-lg text-zinc-100">
                  Google Drive Photo Integration
                </h3>
              </div>
              <button
                onClick={() => setShowDriveHelper(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#2d333b] text-xs font-mono">
              <button
                onClick={() => setActiveGuideTab('script')}
                className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                  activeGuideTab === 'script'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>1-Folder Automatic Sync (Option 1)</span>
              </button>
              <button
                onClick={() => setActiveGuideTab('manual')}
                className={`px-4 py-2 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
                  activeGuideTab === 'manual'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>Manual Links & Tester</span>
              </button>
            </div>

            {activeGuideTab === 'script' ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 rounded-md bg-sky-950/20 border border-sky-500/20 text-sky-300 font-sans leading-relaxed">
                  <strong>How it works:</strong> You upload photos into <strong>one Google Drive folder</strong> from your phone or PC. A free Google Apps Script serves that folder as JSON. Your portfolio fetches it automatically in real time!
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">1</span>
                    <div>
                      <p className="font-semibold text-zinc-200">Create a Google Drive Folder & make it public</p>
                      <p className="text-zinc-400 mt-0.5">
                        Create a folder (e.g. <code>College Memories</code>). Right click → <strong className="text-zinc-200">Share</strong> → Set General Access to <span className="text-emerald-400">&quot;Anyone with the link can view&quot;</span>. Copy the folder URL.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">2</span>
                    <div>
                      <p className="font-semibold text-zinc-200">Create a Google Apps Script</p>
                      <p className="text-zinc-400 mt-0.5">
                        Open <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-sky-400 underline">script.google.com</a> → Click <strong className="text-zinc-200">New project</strong>. Paste the snippet below into the editor and replace <code>YOUR_FOLDER_ID_HERE</code> with the ID from your folder link.
                      </p>
                    </div>
                  </div>

                  {/* Copyable Code Box */}
                  <div className="relative rounded-md bg-[#0a0c10] border border-[#2d333b] p-3 text-zinc-300 font-mono text-[11px] overflow-x-auto">
                    <button
                      onClick={handleCopyCode}
                      className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Script'}</span>
                    </button>
                    <pre className="pr-20 max-h-44 overflow-y-auto leading-relaxed text-zinc-300">
                      {GOOGLE_APPS_SCRIPT_SNIPPET}
                    </pre>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">3</span>
                    <div>
                      <p className="font-semibold text-zinc-200">Deploy as a Web App</p>
                      <p className="text-zinc-400 mt-0.5">
                        In Apps Script, click <strong className="text-zinc-200">Deploy → New deployment</strong>. Select type <strong>Web App</strong>. Set:
                      </p>
                      <ul className="list-disc list-inside text-zinc-400 mt-1 pl-1 space-y-0.5">
                        <li>Execute as: <span className="text-zinc-200">Me</span></li>
                        <li>Who has access: <span className="text-emerald-400 font-semibold">Anyone</span> (Crucial!)</li>
                      </ul>
                      <p className="text-zinc-400 mt-1">Copy the resulting Web App URL (ends with <code>/exec</code>).</p>
                    </div>
                  </div>

                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">4</span>
                    <div className="w-full">
                      <p className="font-semibold text-zinc-200">Paste your Web App URL here:</p>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="https://script.google.com/macros/s/.../exec"
                          value={syncUrl}
                          onChange={(e) => setSyncUrl(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#0d1117] border border-[#21262d] rounded text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                        />
                        <button
                          onClick={() => handleSaveSyncUrl(syncUrl)}
                          className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-semibold rounded shrink-0 transition-colors"
                        >
                          Save & Sync
                        </button>
                      </div>
                      {lastSyncedAt && (
                        <p className="text-[11px] font-mono text-emerald-400 mt-1.5 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Active: Last fetched at {lastSyncedAt.toLocaleTimeString()} ({syncedMemories.length} photos)</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                {/* Manual 3 Step Instruction */}
                <div className="space-y-3 font-sans text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-md bg-[#0d1117] border border-[#21262d]">
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono flex items-center justify-center font-bold shrink-0">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-200">Share your photo publicly</p>
                      <p className="text-zinc-400 mt-1">
                        In Google Drive, right-click any photo → <strong className="text-zinc-200">Share</strong> → Set General Access to <span className="text-emerald-400">&quot;Anyone with the link can view&quot;</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-md bg-[#0d1117] border border-[#21262d]">
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono flex items-center justify-center font-bold shrink-0">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-200">Copy the share link</p>
                      <p className="text-zinc-400 mt-1">
                        Copy the link (e.g. <code>https://drive.google.com/file/d/1A2B3C.../view</code>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-md bg-[#0d1117] border border-[#21262d]">
                    <div className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono flex items-center justify-center font-bold shrink-0">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-200">Paste into <code>src/data/memoriesData.ts</code></p>
                      <p className="text-zinc-400 mt-1">
                        Add an item to the <code>MEMORIES_DATA</code> array.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live Interactive Link Tester */}
                <div className="p-4 rounded-md bg-[#0e1117] border border-[#30363d] space-y-3">
                  <p className="text-xs font-mono font-semibold text-sky-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Test Individual Google Drive Link:</span>
                  </p>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste drive.google.com link here..."
                      value={testLink}
                      onChange={(e) => setTestLink(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono bg-[#161b22] border border-[#21262d] rounded text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-sky-500"
                    />
                    <button
                      onClick={handleTestDriveLink}
                      className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-semibold rounded shrink-0 transition-colors"
                    >
                      Test Link
                    </button>
                  </div>

                  {testResult && (
                    <div className="p-2.5 rounded bg-[#161b22] border border-emerald-500/30 text-xs font-mono space-y-2 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolved Link:</span>
                      </div>
                      <p className="text-zinc-400 truncate text-[11px]">{testResult}</p>
                      <div className="w-full h-32 bg-black/50 rounded overflow-hidden flex items-center justify-center border border-zinc-700">
                        <img 
                          src={testResult} 
                          alt="Preview" 
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#21262d]">
              <button
                onClick={() => setShowDriveHelper(false)}
                className="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-zinc-200 text-xs font-mono rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
