import { SavedSeoPack } from '../types/seo';

const STORAGE_KEY = 'spider_seo_manager_packs_v1';

export function loadSavedPacks(): SavedSeoPack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SavedSeoPack =>
          typeof item === 'object' &&
          item !== null &&
          typeof item.id === 'string' &&
          typeof item.createdAt === 'number' &&
          typeof item.input === 'object' &&
          typeof item.output === 'object'
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}

export function persistPacks(packs: SavedSeoPack[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function saveOrUpdatePack(pack: SavedSeoPack): SavedSeoPack[] {
  const existing = loadSavedPacks();
  const index = existing.findIndex((p) => p.id === pack.id);
  const next = [...existing];
  if (index >= 0) {
    next[index] = pack;
  } else {
    next.unshift(pack);
  }
  next.sort((a, b) => b.updatedAt - a.updatedAt);
  persistPacks(next);
  return next;
}

export function deletePackById(id: string): SavedSeoPack[] {
  const next = loadSavedPacks().filter((p) => p.id !== id);
  persistPacks(next);
  return next;
}

export function clearAllPacks(): SavedSeoPack[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
  return [];
}
