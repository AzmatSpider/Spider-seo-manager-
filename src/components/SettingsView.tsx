import { useState } from 'react';
import { Check, Info, Palette, Smartphone, Trash2 } from 'lucide-react';
import { SpiderLogo } from './SpiderLogo';

interface SettingsViewProps {
  packCount: number;
  onClearHistory: () => void;
}

export function SettingsView({ packCount, onClearHistory }: SettingsViewProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleConfirmClear = () => {
    onClearHistory();
    setConfirmClear(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-sm text-neutral-400 mt-0.5">
          Application details, theme palette, and local SEO pack storage.
        </p>
      </div>

      {/* About Spider SEO Manager */}
      <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-4">
          <SpiderLogo size={52} />
          <div>
            <h2 className="text-lg font-bold text-white">SPIDER SEO MANAGER</h2>
            <p className="text-xs font-medium text-[#FFD700]">Created by AzmatSpider</p>
          </div>
        </div>

        <p className="text-sm text-neutral-300 leading-relaxed">
          SPIDER SEO MANAGER is an AI-powered YouTube SEO assistant purpose-built for Minecraft content creators across Java Edition and Bedrock Edition. Generate high-CTR titles, structured descriptions with creator credits and hashtags, search keywords, 500-character-compliant YouTube tags, and actionable thumbnail or Shorts hook tips.
        </p>

        <div className="pt-2 border-t border-[#2A2A2A] grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <Info className="w-4 h-4 text-[#FFD700] shrink-0" />
            <div>
              <p className="text-xs text-neutral-400">App Version</p>
              <p className="font-mono font-medium text-white tabular-nums">1.0.0</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-[#FFD700] shrink-0" />
            <div>
              <p className="text-xs text-neutral-400">Android Package ID</p>
              <p className="font-mono text-xs sm:text-sm font-medium text-white">
                com.azmatspider.spiderseomanager
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Information */}
      <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Palette className="w-4 h-4 text-[#FFD700]" />
          <h2 className="text-base font-bold text-white">Theme Information</h2>
        </div>

        <p className="text-xs text-neutral-400">
          Dark theme is enabled by default for low-glare mobile studio editing.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Deep Black', hex: '#080808', swatch: 'bg-[#080808] border-[#333333]' },
            { name: 'Spider Yellow', hex: '#FFD700', swatch: 'bg-[#FFD700] border-[#FFD700]' },
            { name: 'Dark Grey', hex: '#191919', swatch: 'bg-[#191919] border-[#333333]' },
            { name: 'White Text', hex: '#FFFFFF', swatch: 'bg-white border-white' },
          ].map((color) => (
            <div
              key={color.hex}
              className="rounded-xl bg-[#111111] border border-[#2A2A2A] p-3 flex items-center gap-3"
            >
              <span
                className={`w-7 h-7 rounded-lg border shrink-0 ${color.swatch}`}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{color.name}</p>
                <p className="text-[11px] font-mono text-neutral-400 tabular-nums">
                  {color.hex}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Clear History */}
      <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Local SEO Pack History</h2>
            <p className="text-xs text-neutral-400 mt-0.5 tabular-nums">
              Currently storing {packCount} saved {packCount === 1 ? 'pack' : 'packs'} on this device.
            </p>
          </div>

          {!confirmClear ? (
            <button
              type="button"
              disabled={packCount === 0}
              onClick={() => setConfirmClear(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-red-950/50 hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed border border-red-500/40 text-xs font-semibold text-red-200 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmClear}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm Clear All</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#121212] hover:bg-[#242424] border border-[#2E2E2E] text-xs font-medium text-neutral-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
