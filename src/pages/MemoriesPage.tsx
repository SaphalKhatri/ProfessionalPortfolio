import React, { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  Edit2,
  Video,
  Image as ImageIcon,
  Download,
  Upload,
  Play
} from 'lucide-react';
import { MemoryItem, MemoryCategory } from '../types/portfolio';
import { 
  MEMORIES_DATA, 
  resolveDriveImageUrl, 
  resolveDriveVideoPreviewUrl,
  extractDriveFileId
} from '../data/memoriesData';

type CategoryFilter = 'All' | MemoryCategory;

const STORAGE_KEY = 'portfolio_custom_memories_v2';
const PASSWORD_STORAGE_KEY = 'portfolio_memories_admin_password';

export const MemoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('portfolio_memories_admin') === 'true';
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  // Password change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  // Manual Memories State (Stored in localStorage for instant persistent editing)
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse local memories:', e);
    }
    return MEMORIES_DATA;
  });

  // Save to localStorage whenever memories change
  const saveMemories = (newItems: MemoryItem[]) => {
    setMemories(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  // Add / Edit Modal State
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

  // Link tester preview in form
  const [previewResolvedUrl, setPreviewResolvedUrl] = useState('');

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

  // Open modal for new item
  const openNewItemModal = () => {
    setEditingItem(null);
    setFormTitle('');
    setFormCaption('');
    setFormDate(new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase());
    setFormLocation('Kathmandu, Nepal');
    setFormCategory('Bites & Brew');
    setFormMediaType('image');
    setFormDriveUrl('');
    setFormTags('Food, Cafe, Coffee');
    setPreviewResolvedUrl('');
    setFormError(null);
    setShowItemModal(true);
  };

  // Open modal for editing existing item
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
    setPreviewResolvedUrl(
      item.mediaType === 'video' 
        ? resolveDriveVideoPreviewUrl(item.driveIdOrUrl) 
        : resolveDriveImageUrl(item.driveIdOrUrl)
    );
    setFormError(null);
    setShowItemModal(true);
  };

  // Delete item handler
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this memory?')) {
      const updated = memories.filter(m => m.id !== id);
      saveMemories(updated);
    }
  };

  // Form submit handler
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Please provide a title');
      return;
    }
    if (!formDriveUrl.trim()) {
      setFormError('Please paste a Google Drive file link, ID, or image URL');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (editingItem) {
      // Update existing item
      const updated = memories.map(m => {
        if (m.id === editingItem.id) {
          return {
            ...m,
            title: formTitle.trim(),
            caption: formCaption.trim(),
            date: formDate.trim() || 'RECENT',
            location: formLocation.trim() || undefined,
            category: formCategory,
            mediaType: formMediaType,
            driveIdOrUrl: formDriveUrl.trim(),
            tags: tagsArray
          };
        }
        return m;
      });
      saveMemories(updated);
      setAdminSuccessMsg(`Updated "${formTitle}"`);
    } else {
      // Create new item
      const newItem: MemoryItem = {
        id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        title: formTitle.trim(),
        caption: formCaption.trim(),
        date: formDate.trim() || 'RECENT',
        location: formLocation.trim() || undefined,
        category: formCategory,
        mediaType: formMediaType,
        driveIdOrUrl: formDriveUrl.trim(),
        tags: tagsArray
      };
      saveMemories([newItem, ...memories]);
      setAdminSuccessMsg(`Added "${formTitle}" to ${formCategory}!`);
    }

    setTimeout(() => setAdminSuccessMsg(null), 3500);
    setShowItemModal(false);
  };

  // Update preview on link change
  const handleDriveUrlChange = (val: string) => {
    setFormDriveUrl(val);
    if (!val.trim()) {
      setPreviewResolvedUrl('');
      return;
    }
    if (formMediaType === 'video') {
      setPreviewResolvedUrl(resolveDriveVideoPreviewUrl(val));
    } else {
      setPreviewResolvedUrl(resolveDriveImageUrl(val));
    }
  };

  // Export current list to clipboard as TypeScript code (so you can paste into memoriesData.ts if desired)
  const handleExportCode = () => {
    const code = `export const MEMORIES_DATA: MemoryItem[] = ${JSON.stringify(memories, null, 2)};\n`;
    navigator.clipboard.writeText(code);
    setAdminSuccessMsg('Copied TypeScript code to clipboard! You can paste it into memoriesData.ts.');
    setTimeout(() => setAdminSuccessMsg(null), 4000);
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          saveMemories(parsed);
          setAdminSuccessMsg(`Successfully imported ${parsed.length} items!`);
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

  const categories: CategoryFilter[] = ['All', 'Bites & Brew', 'Hackathons', 'Campus Life', 'Meetups', 'Travel'];

  const filteredMemories = memories.filter((item) => {
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
            <span>Memories & Photo Dump</span>
          </button>

          {/* Admin Badges */}
          {isAdmin ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
              <Unlock className="w-3 h-3" />
              <span>Admin Mode Active ({memories.length} items)</span>
            </div>
          ) : (
            <button
              onClick={() => setShowAdminAuthModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Login</span>
            </button>
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
              A curated visual log of favorite cafes, street eats, coffee spots, hackathon sprints, and travel adventures.
            </p>
          </div>

          {/* Admin Action Bar */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {isAdmin ? (
              <>
                <button
                  onClick={openNewItemModal}
                  className="px-3.5 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Photo / Video</span>
                </button>

                <button
                  onClick={handleExportCode}
                  className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono transition-colors"
                  title="Export to TypeScript / Clipboard"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <label 
                  className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-300 hover:text-white border border-[#30363d] text-xs font-mono cursor-pointer transition-colors"
                  title="Import JSON backup"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>

                <button
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="p-2 rounded-md bg-[#161b22] hover:bg-[#21262d] text-zinc-400 hover:text-sky-400 border border-[#30363d] text-xs font-mono transition-colors"
                  title="Change Password"
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
      </section>

      {/* Filter and Search Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#22272e]">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs font-mono no-scrollbar">
          {categories.map((cat) => {
            const count = cat === 'All' 
              ? memories.length 
              : memories.filter(m => m.category === cat).length;
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
          <div className="py-20 text-center space-y-3 bg-[#161b22]/40 rounded-lg border border-[#21262d] px-6">
            <Camera className="w-10 h-10 text-sky-400/60 mx-auto" />
            <p className="text-zinc-200 font-serif text-lg font-semibold">No media in this section yet</p>
            <p className="text-xs font-mono text-zinc-400 max-w-md mx-auto leading-relaxed">
              {isAdmin 
                ? 'Click "Add Photo / Video" above to paste your Google Drive links and assign custom titles & tags!'
                : 'Unlock admin mode (press Ctrl+Shift+A or double-click the header) to add your custom photos and videos.'
              }
            </p>
            {isAdmin && (
              <button
                onClick={openNewItemModal}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Photo / Video</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMemories.map((item, idx) => {
              const isVideo = item.mediaType === 'video';
              const imageUrl = resolveDriveImageUrl(item.driveIdOrUrl);
              const videoEmbedUrl = resolveDriveVideoPreviewUrl(item.driveIdOrUrl);

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
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80';
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
                          className="p-1.5 rounded-md bg-black/70 hover:bg-sky-500 text-zinc-300 hover:text-slate-950 backdrop-blur-md border border-white/10 transition-colors"
                          title="Edit Title, Tags & Media"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteItem(item.id, e)}
                          className="p-1.5 rounded-md bg-black/70 hover:bg-rose-500 text-zinc-300 hover:text-white backdrop-blur-md border border-white/10 transition-colors"
                          title="Delete"
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
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
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
                  referrerPolicy="no-referrer"
                  className="max-h-[75vh] w-auto object-contain mx-auto"
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

                <span className="text-zinc-600 hidden sm:inline">Esc to dismiss</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Memory Modal (Admin Only) */}
      {isAdmin && showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="max-w-xl w-full bg-[#161b22] border border-[#2d333b] rounded-xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-[#21262d]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif font-bold text-lg text-zinc-100">
                  {editingItem ? 'Edit Memory Details' : 'Add New Photo / Video'}
                </h3>
              </div>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
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
                  Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pour Over at Himalayan Java / Late Night Dumplings"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Media Type & Category Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 block">Media Type</label>
                  <select
                    value={formMediaType}
                    onChange={(e) => {
                      const val = e.target.value as 'image' | 'video';
                      setFormMediaType(val);
                      if (formDriveUrl) {
                        setPreviewResolvedUrl(
                          val === 'video' 
                            ? resolveDriveVideoPreviewUrl(formDriveUrl) 
                            : resolveDriveImageUrl(formDriveUrl)
                        );
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="image">Photo (JPG, PNG, WebP)</option>
                    <option value="video">Video (MP4, Drive Video)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 block">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MemoryCategory)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="Bites & Brew">Bites & Brew</option>
                    <option value="Hackathons">Hackathons</option>
                    <option value="Campus Life">Campus Life</option>
                    <option value="Meetups">Meetups</option>
                    <option value="Travel">Travel</option>
                    <option value="College">College</option>
                  </select>
                </div>
              </div>

              {/* Google Drive Link or Raw URL */}
              <div className="space-y-1">
                <label className="text-zinc-300 block">
                  Google Drive Share Link or ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                  value={formDriveUrl}
                  onChange={(e) => handleDriveUrlChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                />
                <p className="text-[11px] text-zinc-500">
                  Tip: Right-click file in Drive &gt; Share &gt; Anyone with the link &gt; Copy link.
                </p>
              </div>

              {/* Live Preview Box */}
              {previewResolvedUrl && (
                <div className="p-2.5 rounded bg-[#0d1117] border border-sky-500/20 space-y-2">
                  <span className="text-sky-400 text-[11px] flex items-center gap-1 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Media Resolved:
                  </span>
                  <div className="w-full h-36 bg-black/60 rounded overflow-hidden flex items-center justify-center border border-zinc-800">
                    {formMediaType === 'video' ? (
                      <iframe
                        src={previewResolvedUrl}
                        className="w-full h-full border-0 pointer-events-none"
                        title="Video Preview"
                      />
                    ) : (
                      <img
                        src={previewResolvedUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Date & Location Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 block">Date (Badge)</label>
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
                    placeholder="e.g. Patan, Nepal"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Tags Input */}
              <div className="space-y-1">
                <label className="text-zinc-300 block">
                  Tags (Separated by commas)
                </label>
                <input
                  type="text"
                  placeholder="Coffee, Cafe, PourOver, Weekend"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-sky-500"
                />
                <p className="text-[11px] text-zinc-500">
                  Assign any tags you want — regardless of what the original file is named!
                </p>
              </div>

              {/* Caption */}
              <div className="space-y-1">
                <label className="text-zinc-300 block">Caption / Story</label>
                <textarea
                  rows={2}
                  placeholder="Add a short memory note or review..."
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
                  className="px-4 py-2 rounded bg-[#21262d] hover:bg-[#30363d] text-zinc-300 text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingItem ? 'Save Changes' : 'Add to Portfolio'}</span>
                </button>
              </div>
            </form>
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
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100 font-mono">Admin Access</h3>
                <p className="text-xs text-zinc-400">Manage photos, videos & custom tags</p>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
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
                  className="flex-1 py-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-zinc-300 text-xs font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
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
