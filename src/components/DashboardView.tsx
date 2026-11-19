import { useMemo, useState } from 'react';
import {
  ChevronRight,
  Plus,
  Search,
  Settings,
  Trash2,
  Video,
  Zap,
} from 'lucide-react';
import { SavedSeoPack, VideoType } from '../types/seo';
import { formatRelativeTime } from '../utils/seoHelpers';
import { SpiderLogo } from './SpiderLogo';

interface DashboardViewProps {
  packs: SavedSeoPack[];
  onCreateNew: () => void;
  onOpenPack: (pack: SavedSeoPack) => void;
  onDeletePack: (id: string) => void;
  onOpenSettings: () => void;
}

type TypeFilter = 'All' | VideoType;

export function DashboardView({
  packs,
  onCreateNew,
  onOpenPack,
  onDeletePack,
  onOpenSettings,
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');

  const shortsCount = useMemo(
    () => packs.filter((p) => p.input.videoType === 'YouTube Shorts').length,
    [packs]
  );

  const longCount = useMemo(
    () => packs.filter((p) => p.input.videoType === 'YouTube Long Video').length,
    [packs]
  );

  const filteredPacks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return packs.filter((pack) => {
      if (typeFilter !== 'All' && pack.input.videoType !== typeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        pack.input.topic.toLowerCase().includes(q) ||
        pack.output.title.toLowerCase().includes(q) ||
        pack.input.language.toLowerCase().includes(q) ||
        pack.input.edition.toLowerCase().includes(q)
      );
    });
  }, [packs, searchQuery, typeFilter]);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Card */}
      <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <SpiderLogo size={56} />
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-[#FFD700]">
                AzmatSpider · Minecraft Creator Studio
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5 text-balance">
                Welcome to Spider SEO Manager
              </h1>
              <p className="text-sm text-neutral-300 mt-1 max-w-xl">
                Generate high-CTR Minecraft titles, descriptions, hashtags, keywords, 500-character YouTube tags, and discoverability tips powered by Gemini AI.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onCreateNew}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#F2C900] active:scale-[0.98] text-[#080808] font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create New SEO Pack</span>
            </button>
            <button
              type="button"
              onClick={onOpenSettings}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-[#222222] text-white border border-[#2E2E2E] font-medium text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Settings className="w-4 h-4 text-[#FFD700]" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real Local Metrics */}
      <section aria-label="Saved SEO Pack Summary" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400">Total Generated Packs</p>
            <p className="text-3xl font-bold text-white tabular-nums mt-1 font-display">
              {packs.length}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 flex items-center justify-center">
            <SpiderLogo size={32} className="border-0 bg-transparent" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400">YouTube Shorts Packs</p>
            <p className="text-3xl font-bold text-white tabular-nums mt-1 font-display">
              {shortsCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#121212] border border-[#2A2A2A] flex items-center justify-center text-[#FFD700]">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-400">Long Video Packs</p>
            <p className="text-3xl font-bold text-white tabular-nums mt-1 font-display">
              {longCount}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#121212] border border-[#2A2A2A] flex items-center justify-center text-[#FFD700]">
            <Video className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Recent SEO Packs */}
      <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] overflow-hidden">
        <div className="p-5 border-b border-[#2A2A2A] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent SEO Packs</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Saved locally on your device. Tap any pack to view, edit, copy, or regenerate.
            </p>
          </div>

          {packs.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search saved packs..."
                  aria-label="Search saved SEO packs"
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl bg-[#0E0E0E] border border-[#2E2E2E] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <div
                className="inline-flex items-center p-1 rounded-xl bg-[#0E0E0E] border border-[#2A2A2A]"
                role="tablist"
                aria-label="Filter packs by video type"
              >
                {(['All', 'YouTube Shorts', 'YouTube Long Video'] as TypeFilter[]).map((tab) => {
                  const active = typeFilter === tab;
                  const label =
                    tab === 'All'
                      ? 'All'
                      : tab === 'YouTube Shorts'
                        ? 'Shorts'
                        : 'Long';
                  return (
                    <button
                      key={tab}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTypeFilter(tab)}
                      className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#FFD700] text-[#080808] font-semibold'
                          : 'text-neutral-300 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {packs.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-[#121212] border border-[#2A2A2A] flex items-center justify-center mb-4">
              <SpiderLogo size={36} className="border-0 bg-transparent" />
            </div>
            <h3 className="text-base font-semibold text-white">No SEO packs saved yet</h3>
            <p className="text-sm text-neutral-400 mt-1 max-w-md mx-auto">
              Create your first Minecraft YouTube SEO pack to generate optimized titles, descriptions, tags, keywords, and discoverability tips.
            </p>
            <button
              type="button"
              onClick={onCreateNew}
              className="mt-5 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#FFD700] hover:bg-[#F2C900] text-[#080808] font-semibold text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create First SEO Pack</span>
            </button>
          </div>
        ) : filteredPacks.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-neutral-300">No saved packs match your current filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('All');
              }}
              className="mt-3 min-h-[44px] px-4 py-2 rounded-xl bg-[#121212] border border-[#2E2E2E] text-xs font-medium text-[#FFD700] hover:bg-[#222222] transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-[#262626]">
            {filteredPacks.map((pack) => (
              <li key={pack.id} className="flex items-center gap-2 hover:bg-[#202020] transition-colors">
                <button
                  type="button"
                  onClick={() => onOpenPack(pack)}
                  className="flex-1 min-w-0 text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer min-h-[64px]"
                >
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                      {pack.output.title || pack.input.topic}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-neutral-400 mt-1">
                      <span className="text-[#FFD700] font-medium">
                        {pack.input.videoType === 'YouTube Shorts' ? 'Shorts' : 'Long Video'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{pack.input.language}</span>
                      <span aria-hidden="true">·</span>
                      <span>{pack.input.edition} Edition</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{formatRelativeTime(pack.updatedAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeletePack(pack.id)}
                  aria-label={`Delete ${pack.input.topic}`}
                  title="Delete pack"
                  className="mr-3 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
