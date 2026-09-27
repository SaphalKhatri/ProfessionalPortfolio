import React, { useState, useEffect, useMemo } from 'react';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Search, 
  AlertCircle,
  Key,
  Lock,
  Unlock,
  ShieldCheck,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Video,
  Image as ImageIcon,
  Download,
  Upload,
  Play,
  RefreshCw,
  FolderGit2,
  FolderPlus,
  Copy
} from 'lucide-react';
import { MemoryItem, MemoryCategory } from '../types/portfolio';
import { 
  MEMORIES_DATA, 
  GOOGLE_DRIVE_FOLDER_URL,
  DEFAULT_FOLDER_SYNC_API_URL,
  GOOGLE_APPS_SCRIPT_SNIPPET,
  resolveDriveImageUrl, 
  resolveDriveVideoPreviewUrl,
  getDriveImageFallbackUrls,
  extractDriveFileId
} from '../data/memoriesData';

type CategoryFilter = 'All' | MemoryCategory;

const OVERRIDES_STORAGE_KEY = 'portfolio_drive_overrides_v1';
const DELETED_STORAGE_KEY = 'portfolio_drive_deleted_v1';
const SYNC_URL_STORAGE_KEY = 'portfolio_drive_sync_url';
const PASSWORD_STORAGE_KEY = 'portfolio_memories_admin_password';

export const MemoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Live Folder Sync State
  const [syncUrl, setSyncUrl] = useState<string>(() => {
    return localStorage.getItem(SYNC_URL_STORAGE_KEY) || DEFAULT_FOLDER_SYNC_API_URL || '';
  });
  const [rawDriveItems, setRawDriveItems] = useState<MemoryItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('portfolio_memories_admin') === 'true';
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);
  const [showDriveHelper, setShowDriveHelper] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Local Admin Overrides: lets you edit title, tags, category, and captions of ANY fetched or static media
  const [overrides, setOverrides] = useState<Record<string, Partial<MemoryItem>>>(() => {
    try {
      const stored = localStorage.getItem(OVERRIDES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse local overrides:', e);
    }
    return {};
  });

  // Deleted Item IDs (Admin can hide/delete items)
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(DELETED_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse deleted IDs:', e);
    }
    return [];
  });

  // Save overrides to localStorage
  const saveOverride = (id: string, updatedFields: Partial<MemoryItem>) => {
    const updated = {
      ...overrides,
      [id]: {
        ...(overrides[id] || {}),
        ...updatedFields
      }
    };
    setOverrides(updated);
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(updated));
  };

  const markDeleted = (id: string) => {
    const updated = [...deletedIds, id];
    setDeletedIds(updated);
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(updated));
  };

  // Fetch live memories from Google Apps Script endpoint
  const fetchLiveMemories = async (endpointUrl: string) => {
    if (!endpointUrl || !endpointUrl.startsWith('http')) return;
    setIsSyncing(true);
    setSyncError(null);

    try {
      const res = await fetch(endpointUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to reach Google Drive Web App`);
      const data = await res.json();

      let items: MemoryItem[] = [];
      if (data && Array.isArray(data.data)) {
        items = data.data;
      } else if (Array.isArray(data)) {
        items = data;
      } else if (data && data.status === 'error') {
        throw new Error(data.message || 'Google Drive script error');
      }

      // Normalize each Drive item to ensure reliable thumbnail image URL
      const normalizedItems: MemoryItem[] = items.map((item, idx) => {
        const id = item.id || `drive_${idx}`;
        const isVideo = item.mediaType === 'video' || (item.title && /\.(mp4|mov|webm)$/i.test(item.title));
        return {
          id,
          title: item.title || 'Bite & Brew Moment',
          caption: item.caption || '',
          date: item.date || 'RECENT',
          location: item.location || 'Kathmandu, Nepal',
          category: item.category || 'Bites & Brew',
          mediaType: isVideo ? 'video' : 'image',
          driveIdOrUrl: item.driveIdOrUrl || item.id,
          tags: item.tags || ['BitesAndBrew', 'Food']
        };
      });

      setRawDriveItems(normalizedItems);
      setLastSyncedAt(new Date());
    } catch (err: any) {
      console.warn('Drive sync error:', err);
      setSyncError(err.message || 'Could not fetch from Google Drive script');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (syncUrl) {
      fetchLiveMemories(syncUrl);
    }
  }, [syncUrl]);

  // Merge static MEMORIES_DATA with live synced Drive items, apply Overrides, and filter out deleted items
  const allMemories = useMemo(() => {
    const combinedMap = new Map<string, MemoryItem>();

    // 1. Add static base items
    MEMORIES_DATA.forEach(item => combinedMap.set(item.id, { ...item }));

    // 2. Add/merge fetched drive items
    rawDriveItems.forEach(item => combinedMap.set(item.id, { ...item }));

    // 3. Apply Admin custom overrides (custom tags, edited title, category changes, caption edits)
    const result: MemoryItem[] = [];
    combinedMap.forEach((item, id) => {
      if (deletedIds.includes(id)) return; // Skipped if deleted
      const custom = overrides[id];
      if (custom) {
        result.push({
          ...item,
          ...custom
        });
      } else {
        result.push(item);
      }
    });

    return result;
  }, [rawDriveItems, overrides, deletedIds]);

  // Edit Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MemoryItem | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formCaption, setFormCaption] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCategory, setFormCategory] = useState<MemoryCategory>('Bites & Brew');
  const [formMediaType, setFormMediaType] = useState<'image' | 'video'>('image');
  const [formDriveUrl, setFormDriveUrl] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const getStoredAdminPassword = () => {
    return localStorage.getItem(PASSWORD_STORAGE_KEY) || 'admin';
  };

  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const stored = getStoredAdminPassword();
    if (adminPasswordInput.trim() === stored) {
      setIsAdmin(true);
      sessionStorage.setItem('portfolio_memories_admin', 'true');
      setShowAdminAuthModal(false);
      setAdminPasswordInput('');
      setAuthError(null);
    } else {
      setAuthError('Incorrect admin password. Default is "admin".');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('portfolio_memories_admin');
    setShowItemModal(false);
    setShowChangePassword(false);
    setShowDriveHelper(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      setAuthError('Password cannot be empty.');
      return;
    }
    localStorage.setItem(PASSWORD_STORAGE_KEY, newPasswordInput.trim());
    setNewPasswordInput('');
    setShowChangePassword(false);
    setAdminSuccessMsg('Admin password updated successfully!');
    setTimeout(() => setAdminSuccessMsg(null), 3500);
  };

  // Open modal for editing on-site
  const openEditItemModal = (item: MemoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCaption(item.caption);
    setFormDate(item.date);
    setFormLocation(item.location || '');
    setFormCategory(item.category);
    setFormMediaType(item.mediaType || 'image');
    setFormDriveUrl(item.driveIdOrUrl);
    setFormTags((item.tags || []).join(', '));
    setFormError(null);
    setShowItemModal(true);
  };

  // Delete item handler
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this media item from display?')) {
      markDeleted(id);
      setAdminSuccessMsg('Item removed from portfolio view.');
      setTimeout(() => setAdminSuccessMsg(null), 3000);
    }
  };

  // Save on-site edits
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!formTitle.trim()) {
      setFormError('Please provide a title');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    saveOverride(editingItem.id, {
      title: formTitle.trim(),
      caption: formCaption.trim(),
      date: formDate.trim() || 'RECENT',
      location: formLocation.trim() || undefined,
      category: formCategory,
      mediaType: formMediaType,
      driveIdOrUrl: formDriveUrl.trim() || editingItem.driveIdOrUrl,
      tags: tagsArray
    });

    setAdminSuccessMsg(`Saved changes for "${formTitle}"`);
    setTimeout(() => setAdminSuccessMsg(null), 3500);
    setShowItemModal(false);
  };

  // Export current list to clipboard as permanent TypeScript code
  const handleExportCode = () => {
    const code = `export const MEMORIES_DATA: MemoryItem[] = ${JSON.stringify(allMemories, null, 2)};\n`;
    navigator.clipboard.writeText(code);
    setAdminSuccessMsg('Copied all media as permanent TypeScript code! You can paste it into src/data/memoriesData.ts anytime.');
    setTimeout(() => setAdminSuccessMsg(null), 4500);
  };

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allMemories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'bites_and_brew_memories.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const newOverrides: Record<string, Partial<MemoryItem>> = {};
          parsed.forEach((item: MemoryItem) => {
            if (item.id) {
              newOverrides[item.id] = item;
            }
          });
          setOverrides(prev => ({ ...prev, ...newOverrides }));
          localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify({ ...overrides, ...newOverrides }));
          setAdminSuccessMsg(`Successfully imported and applied ${parsed.length} items!`);
          setTimeout(() => setAdminSuccessMsg(null), 3500);
        } else {
          alert('Invalid format. File must contain an array of memory objects.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSyncUrl = (newUrl: string) => {
    const trimmed = newUrl.trim();
    setSyncUrl(trimmed);
    localStorage.setItem(SYNC_URL_STORAGE_KEY, trimmed);
    if (trimmed) {
      fetchLiveMemories(trimmed);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const categories: CategoryFilter[] = ['All', 'Bites & Brew', 'College', 'Hackathons', 'Campus Life', 'Meetups', 'Travel'];

  const filteredMemories = allMemories.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Global keyboard shortcuts (Lightbox navigation & Ctrl+Shift+A Admin trigger)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Admin Hotkey: Ctrl + Shift + A or Cmd + Shift + A
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        setShowAdminAuthModal(true);
        setAuthError(null);
        setAdminPasswordInput('');
        return;
      }

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

  const currentLightboxItem = lightboxIndex !== null ? filteredMemories[lightboxIndex] : null;

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Clickable Badge trigger for Admin */}
          <button
            type="button"
            onClick={() => {
              setShowAdminAuthModal(true);
              setAuthError(null);
              setAdminPasswordInput('');
            }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/30 transition-all cursor-pointer"
            title="Memories Archive (Click to manage)"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Bites, Brews & Memories</span>
          </button>

          {/* Admin Badge (only when logged in) */}
          {isAdmin && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
              <Unlock className="w-3 h-3" />
              <span>Admin Mode Active ({allMemories.length} items)</span>
            </div>
          )}

          {syncUrl && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono text-sky-400">
              <span className={`w-1.5 h-1.5 rounded-full bg-sky-400 ${isSyncing ? 'animate-ping' : ''}`} />
              <span>Drive Folder Sync</span>
            </div>
          )}

          {adminSuccessMsg && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono animate-fade-in">
              <Check className="w-3 h-3" />
              <span>{adminSuccessMsg}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 
              onDoubleClick={() => {
                setShowAdminAuthModal(true);
                setAuthError(null);
                setAdminPasswordInput('');
              }}
              className="text-3xl sm:text-4xl font-serif font-bold text-zinc-100 tracking-tight select-none cursor-default"
              title="Double-click to unlock admin"
            >
              Bites, Brews & Beyond
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mt-2 leading-relaxed">
              A curated visual log of favorite cafes, street eats, coffee spots, hackathon sprints, and campus adventures.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {isAdmin ? (
              <>
                {syncUrl && (
                  <button
                    onClick={() => fetchLiveMemories(syncUrl)}
                    disabled={isSyncing}
                    className="px-3 py-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm"
                    title="Refresh photos from Google Drive"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Drive'}</span>
                  </button>
                )}

                <button
                  onClick={() => setShowDriveHelper(true)}
                  className="px-3.5 py-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono flex items-center gap-2 transition-all shadow-sm"
                  title="Configure Google Drive Folder Sync"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Drive Sync Setup</span>
                </button>

                <button
                  onClick={handleExportCode}
                  className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono transition-colors"
                  title="Copy permanent code to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleExportJson}
                  className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono transition-colors"
                  title="Download JSON backup"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <label 
                  className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono cursor-pointer transition-colors"
                  title="Import JSON overrides backup"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>

                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-400 hover:text-sky-400 border border-[#30363d] text-xs font-mono transition-colors"
                  title="Change Admin Password"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleAdminLogout}
                  className="p-2 rounded-md bg-[#161b22] hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-[#30363d] text-xs font-mono transition-colors"
                  title="Lock Admin Mode"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Change Password Inline Bar */}
        {isAdmin && showChangePassword && (
          <form onSubmit={handleChangePassword} className="p-3 bg-[#161b22] border border-sky-500/30 rounded-lg flex items-center gap-3 text-xs font-mono animate-fade-in max-w-md">
            <span className="text-zinc-300 shrink-0">New Password:</span>
            <input
              type="password"
              placeholder="Enter new admin password..."
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-sky-500 text-xs"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold rounded text-xs transition-colors shrink-0"
            >
              Update
            </button>
          </form>
        )}

        {/* Sync notification if error - only visible to admin */}
        {isAdmin && syncError && (
          <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Drive Sync Note: {syncError}</span>
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

      {/* Photo / Video Gallery Grid */}
      <section>
        {filteredMemories.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-[#161b22]/40 rounded-lg border border-[#21262d] px-6">
            <Camera className="w-10 h-10 text-sky-400/60 mx-auto" />
            <p className="text-zinc-200 font-serif text-lg font-semibold">No media in this section yet</p>
            <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto leading-relaxed">
              Connect your Google Drive folder or unlock admin mode to manage photos, videos, categories, and tags.
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowDriveHelper(true)}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Connect Google Drive Folder</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMemories.map((item, idx) => {
              const isVideo = item.mediaType === 'video';
              const imageUrl = resolveDriveImageUrl(item.driveIdOrUrl);
              const videoEmbedUrl = resolveDriveVideoPreviewUrl(item.driveIdOrUrl);
              const fallbacks = getDriveImageFallbackUrls(item.driveIdOrUrl);

              return (
                <div
                  key={item.id || idx}
                  onClick={() => setLightboxIndex(idx)}
                  className="group relative bg-[#161b22] border border-[#21262d] hover:border-sky-500/50 rounded-lg overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/5 hover:-translate-y-1"
                >
                  {/* Photo / Video Container */}
                  <div className="relative aspect-4/3 bg-zinc-950 overflow-hidden">
                    {isVideo ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
                        <iframe
                          src={videoEmbedUrl}
                          className="w-full h-full pointer-events-none border-0"
                          title={item.title}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all">
                          <div className="w-12 h-12 rounded-full bg-sky-500/80 backdrop-blur-md flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        loading="lazy"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          const currentSrc = target.src;
                          // Try the alternative Google Drive thumbnail URLs
                          const nextFallback = fallbacks.find(url => url !== currentSrc);
                          if (nextFallback && !target.dataset.triedFallback) {
                            target.dataset.triedFallback = 'true';
                            target.src = nextFallback;
                          } else {
                            target.src =
                              'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80';
                          }
                        }}
                      />
                    )}
                    
                    {/* Dark gradient overlay for contrast */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity pointer-events-none" />

                    {/* Category & Date badge on image */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono pointer-events-none">
                      <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-sky-300 border border-white/10 flex items-center gap-1">
                        {isVideo ? <Video className="w-3 h-3 text-sky-400" /> : <ImageIcon className="w-3 h-3 text-sky-400" />}
                        <span>{item.category}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                        {item.date}
                      </span>
                    </div>

                    {item.location && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[11px] font-mono text-zinc-300 drop-shadow pointer-events-none">
                        <MapPin className="w-3 h-3 text-sky-400" />
                        <span>{item.location}</span>
                      </div>
                    )}

                    {/* Admin Action Buttons on Card */}
                    {isAdmin && (
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 z-10">
                        <button
                          onClick={(e) => openEditItemModal(item, e)}
                          className="p-1.5 rounded-md bg-black/80 hover:bg-sky-500 text-zinc-200 hover:text-slate-950 backdrop-blur-md border border-white/20 transition-colors shadow-lg"
                          title="Edit on-site (Rename, Re-tag, Change Category)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="p-1.5 rounded-md bg-black/80 hover:bg-rose-500 text-zinc-200 hover:text-white backdrop-blur-md border border-white/20 transition-colors shadow-lg"
                          title="Hide from display"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Content Info */}
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-zinc-100 group-hover:text-sky-300 transition-colors text-base line-clamp-1">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-3">
                        {item.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0d1117] text-zinc-400 border border-[#21262d]"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 4 && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            +{item.tags.length - 4}
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
            className="absolute top-4 right-4 z-50 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-700 transition-colors cursor-pointer"
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
            className="absolute left-2 sm:left-4 z-50 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-700 transition-colors cursor-pointer"
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
            className="absolute right-2 sm:right-4 z-50 p-2 text-zinc-400 hover:text-white bg-zinc-900/80 rounded-full border border-zinc-700 transition-colors cursor-pointer"
            title="Next (→)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Lightbox Card Container */}
          <div className="max-w-4xl w-full max-h-[90vh] bg-[#0e1117] border border-[#2d333b] rounded-xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
            {/* Image / Video Stage */}
            <div className="md:w-3/5 bg-black flex items-center justify-center relative min-h-75 md:min-h-120">
              {currentLightboxItem.mediaType === 'video' ? (
                <iframe
                  src={resolveDriveVideoPreviewUrl(currentLightboxItem.driveIdOrUrl)}
                  className="w-full h-full min-h-80 border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title={currentLightboxItem.title}
                />
              ) : (
                <img
                  src={resolveDriveImageUrl(currentLightboxItem.driveIdOrUrl)}
                  alt={currentLightboxItem.title}
                  crossOrigin="anonymous"
                  className="max-h-[75vh] w-auto object-contain mx-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const fallbacks = getDriveImageFallbackUrls(currentLightboxItem.driveIdOrUrl);
                    if (fallbacks.length > 0 && !target.dataset.triedFallback) {
                      target.dataset.triedFallback = 'true';
                      target.src = fallbacks[0];
                    }
                  }}
                />
              )}
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

                {currentLightboxItem.caption && (
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {currentLightboxItem.caption}
                  </p>
                )}

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
                {isAdmin ? (
                  <button
                    onClick={(e) => {
                      setLightboxIndex(null);
                      openEditItemModal(currentLightboxItem, e);
                    }}
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Details</span>
                  </button>
                ) : (
                  <a
                    href={
                      currentLightboxItem.mediaType === 'video'
                        ? resolveDriveVideoPreviewUrl(currentLightboxItem.driveIdOrUrl)
                        : resolveDriveImageUrl(currentLightboxItem.driveIdOrUrl)
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <span>Open Full Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <span className="text-zinc-600 hidden sm:inline">Esc to dismiss</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit On-Site Modal (Admin Only) */}
      {isAdmin && showItemModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="max-w-xl w-full bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-serif font-bold text-lg text-zinc-100">
                    Edit Media on Site
                  </h3>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Assign custom title, category, and tags to this photo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-mono">
              {formError && (
                <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-zinc-300 block">
                  Display Title (replaces &quot;screenshot/snapshot&quot;) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Saturday Pour-Over at Himalayan Java"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Category & Media Type Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 block">Section / Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MemoryCategory)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Bites & Brew">Bites & Brew</option>
                    <option value="College">College</option>
                    <option value="Hackathons">Hackathons</option>
                    <option value="Campus Life">Campus Life</option>
                    <option value="Meetups">Meetups</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 block">Media Type</label>
                  <select
                    value={formMediaType}
                    onChange={(e) => setFormMediaType(e.target.value as 'image' | 'video')}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="image">Photo (JPG, PNG, WebP)</option>
                    <option value="video">Video (Drive Video / MP4)</option>
                  </select>
                </div>
              </div>

              {/* Custom Tags */}
              <div className="space-y-1">
                <label className="text-zinc-300 block">
                  Tags (Separated by commas)
                </label>
                <input
                  type="text"
                  placeholder="Coffee, PourOver, Weekend, Cafe"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                />
                <p className="text-[11px] text-zinc-500">
                  Custom tags let visitors search by topic (e.g. coffee, momo, trip).
                </p>
              </div>

              {/* Date & Location Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 block">Date Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. SEP 2024 / RECENT"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 block">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Kathmandu, Nepal"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="text-zinc-300 block">Caption / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Add a memory story or note..."
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded bg-[#21262d] hover:bg-[#30363d] text-zinc-300 text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save on Site</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive Setup Modal */}
      {isAdmin && showDriveHelper && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="max-w-2xl w-full bg-[#161b22] border border-[#2d333b] rounded-lg shadow-2xl p-5 sm:p-6 space-y-4 font-sans max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif font-bold text-lg text-zinc-100">
                  Google Drive Folder Live Sync
                </h3>
              </div>
              <button
                onClick={() => setShowDriveHelper(false)}
                className="p-1 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-md bg-sky-950/20 border border-sky-500/20 text-sky-300 font-sans text-xs leading-relaxed">
              <strong>How this works:</strong> You upload photos/videos directly to your Google Drive folder from your phone. Google Apps Script serves them automatically as JSON. Then, <strong>right here on this website</strong>, you can click <span className="text-white bg-black/50 px-1 py-0.5 rounded">Edit</span> to change the section (College vs Bites & Brew), give them clean titles, and set custom tags!
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  <p className="font-semibold text-zinc-200">Make Google Drive Folder Public</p>
                  <p className="text-zinc-400 mt-0.5">
                    Open your folder on Drive → Right-click → <strong>Share</strong> → Set General Access to <span className="text-emerald-400">&quot;Anyone with the link can view&quot;</span>.
                    <span className="block text-amber-300/90 text-[11px] mt-0.5">
                      ⚠️ Crucial: This ensures friends on their phones can view the photos without needing to log into your Google account!
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">2</span>
                <div className="w-full space-y-2">
                  <p className="font-semibold text-zinc-200">Google Apps Script snippet</p>
                  <div className="relative rounded-md bg-[#0a0c10] border border-[#2d333b] p-3 text-zinc-300 font-mono text-[11px] overflow-x-auto">
                    <button
                      onClick={handleCopyCode}
                      className="absolute top-2.5 right-2.5 px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-zinc-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Script'}</span>
                    </button>
                    <pre className="pr-20 max-h-44 overflow-y-auto leading-relaxed text-zinc-300">
                      {GOOGLE_APPS_SCRIPT_SNIPPET}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0">3</span>
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
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-semibold rounded shrink-0 transition-colors cursor-pointer"
                    >
                      Save & Sync
                    </button>
                  </div>
                  {lastSyncedAt && (
                    <p className="text-[11px] font-mono text-emerald-400 mt-1.5 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>Active: Fetched {rawDriveItems.length} photos at {lastSyncedAt.toLocaleTimeString()}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#21262d]">
              <button
                onClick={() => setShowDriveHelper(false)}
                className="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-zinc-200 text-xs font-mono rounded transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Authentication Modal */}
      {showAdminAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e1117] border border-[#30363d] rounded-xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setShowAdminAuthModal(false);
                setAuthError(null);
                setAdminPasswordInput('');
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100 font-mono">Admin Access</h3>
                <p className="text-xs text-zinc-400">Manage photos, videos, sections & tags</p>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 pt-1">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter admin password..."
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  autoFocus
                  className="w-full px-3.5 py-2.5 pr-10 text-xs font-mono bg-[#161b22] border border-[#30363d] rounded-lg text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Default: <code className="text-zinc-400">admin</code></span>
                <span className="text-zinc-500">Only visible to you</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdminAuthModal(false)}
                  className="flex-1 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-zinc-300 text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Unlock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
