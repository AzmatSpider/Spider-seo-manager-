import { useCallback, useEffect, useState } from 'react';
import { Home, PlusSquare, Settings as SettingsIcon } from 'lucide-react';
import { AppView, SavedSeoPack } from './types/seo';
import {
  clearAllPacks,
  deletePackById,
  loadSavedPacks,
  saveOrUpdatePack,
} from './utils/storage';
import { SpiderLogo } from './components/SpiderLogo';
import { DashboardView } from './components/DashboardView';
import { GeneratorView } from './components/GeneratorView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [view, setView] = useState<AppView>('dashboard');
  const [packs, setPacks] = useState<SavedSeoPack[]>(() => loadSavedPacks());
  const [selectedPack, setSelectedPack] = useState<SavedSeoPack | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleCreateNew = () => {
    setSelectedPack(null);
    setView('generator');
  };

  const handleOpenPack = (pack: SavedSeoPack) => {
    setSelectedPack(pack);
    setView('generator');
  };

  const handleSavePack = (pack: SavedSeoPack) => {
    const updated = saveOrUpdatePack(pack);
    setPacks(updated);
    setSelectedPack(pack);
  };

  const handleDeletePack = (id: string) => {
    const updated = deletePackById(id);
    setPacks(updated);
    if (selectedPack?.id === id) {
      setSelectedPack(null);
    }
    showToast('SEO pack deleted.');
  };

  const handleClearHistory = () => {
    const cleared = clearAllPacks();
    setPacks(cleared);
    setSelectedPack(null);
    showToast('All saved SEO pack history cleared.');
  };

  const navItems: { id: AppView; label: string; icon: typeof Home }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'generator', label: 'Generator', icon: PlusSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-dvh bg-[#080808] text-white flex flex-col md:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:sticky md:top-0 md:h-dvh bg-[#111111] border-r border-[#242424] p-5 justify-between">
        <div className="space-y-8">
          <button
            type="button"
            onClick={() => setView('dashboard')}
            className="flex items-center gap-3 text-left w-full cursor-pointer"
          >
            <SpiderLogo size={40} />
            <div className="min-w-0">
              <span className="block text-sm font-extrabold tracking-tight text-white truncate">
                SPIDER SEO MANAGER
              </span>
              <span className="block text-[11px] font-medium text-[#FFD700]">
                by AzmatSpider
              </span>
            </div>
          </button>

          <nav aria-label="Primary Navigation" className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id === 'generator' && view !== 'generator') {
                      setSelectedPack(null);
                    }
                    setView(item.id);
                  }}
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-[#FFD700] text-[#080808] font-semibold'
                      : 'text-neutral-300 hover:bg-[#191919] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <footer className="pt-4 border-t border-[#242424] text-xs text-neutral-400">
          <p className="font-semibold text-white">SPIDER SEO MANAGER</p>
          <p className="mt-0.5">Created by AzmatSpider</p>
        </footer>
      </aside>

      {/* Mobile Compact Top App Bar (48px height to honor 15% mobile sticky cap) */}
      <header className="md:hidden sticky top-0 z-30 h-12 pt-safe bg-[#080808]/95 backdrop-blur-md border-b border-[#242424] px-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setView('dashboard')}
          className="flex items-center gap-2.5 min-h-[44px] cursor-pointer"
        >
          <SpiderLogo size={30} />
          <span className="text-sm font-extrabold tracking-tight text-white whitespace-nowrap">
            SPIDER SEO MANAGER
          </span>
        </button>

        <button
          type="button"
          onClick={handleCreateNew}
          className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#FFD700] text-[#080808] text-xs font-bold whitespace-nowrap cursor-pointer"
        >
          New Pack
        </button>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 lg:px-10 lg:py-8 pb-20 md:pb-10">
        <div className="max-w-6xl mx-auto">
          {view === 'dashboard' && (
            <DashboardView
              packs={packs}
              onCreateNew={handleCreateNew}
              onOpenPack={handleOpenPack}
              onDeletePack={handleDeletePack}
              onOpenSettings={() => setView('settings')}
            />
          )}

          {view === 'generator' && (
            <GeneratorView
              activePack={selectedPack}
              onSavePack={handleSavePack}
              onSelectNewPack={() => setSelectedPack(null)}
              onNotify={showToast}
            />
          )}

          {view === 'settings' && (
            <SettingsView
              packCount={packs.length}
              onClearHistory={handleClearHistory}
            />
          )}

          <footer className="mt-10 pt-5 border-t border-[#1F1F1F] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
            <span>SPIDER SEO MANAGER · Created by AzmatSpider</span>
            <span>Minecraft YouTube SEO Assistant · v1.0.0</span>
          </footer>
        </div>
      </main>

      {/* Mobile Bottom Thumb-Zone Navigation (52px bar + safe area) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111111]/95 backdrop-blur-md border-t border-[#242424] pb-safe"
      >
        <div className="grid grid-cols-3 h-[52px] items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'generator' && view !== 'generator') {
                    setSelectedPack(null);
                  }
                  setView(item.id);
                }}
                className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                  active ? 'text-[#FFD700]' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[11px] font-medium leading-none">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Accessible Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-16 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-sm z-50 rounded-xl bg-[#FFD700] text-[#080808] px-4 py-3 text-xs font-bold shadow-xl flex items-center justify-between"
        >
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
