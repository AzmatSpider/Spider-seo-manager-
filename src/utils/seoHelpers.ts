import { SeoOutput } from '../types/seo';

export const YOUTUBE_TAG_CHAR_LIMIT = 500;

/**
 * Trims comma-separated YouTube tags cleanly at tag boundaries
 * so total length never exceeds YouTube's 500-character limit.
 */
export function enforceTagLimit(rawTags: string, limit = YOUTUBE_TAG_CHAR_LIMIT): string {
  const parts = rawTags
    .split(',')
    .map((part) => part.trim().replace(/^#+/, ''))
    .filter((part) => part.length > 0);

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const tag of parts) {
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(tag);
    }
  }

  const kept: string[] = [];
  let length = 0;

  for (const tag of unique) {
    const sep = kept.length > 0 ? 2 : 0;
    if (length + sep + tag.length <= limit) {
      kept.push(tag);
      length += sep + tag.length;
    }
  }

  return kept.join(', ');
}

export function formatPackForCopyAll(output: SeoOutput, topic: string): string {
  return [
    `SPIDER SEO MANAGER — ${topic}`,
    '',
    '1. TITLE',
    output.title,
    '',
    '2. DESCRIPTION + HASHTAGS',
    output.descriptionWithHashtags,
    '',
    '3. KEYWORDS',
    output.keywords,
    '',
    '4. TAGS (Max 500 Chars)',
    output.tags,
    '',
    '5. SEO TIPS',
    output.seoTips,
  ].join('\n');
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below for Android WebView restrictions
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function createPackId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pack_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
