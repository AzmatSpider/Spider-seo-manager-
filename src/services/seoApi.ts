import { SeoGenerateInput, SeoOutput } from '../types/seo';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');

export async function generateSeoPack(
  input: SeoGenerateInput,
  signal?: AbortSignal
): Promise<SeoOutput> {
  const endpoint = `${API_BASE}/api/seo/generate`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      signal,
    });
  } catch (networkErr) {
    if (networkErr instanceof DOMException && networkErr.name === 'AbortError') {
      throw networkErr;
    }
    throw new Error(
      'Unable to reach the SPIDER SEO MANAGER server. Check your internet connection and retry.'
    );
  }

  let data: { seo?: SeoOutput; error?: string } | null = null;
  try {
    data = await response.json();
  } catch {
    // Non-JSON response
  }

  if (!response.ok) {
    throw new Error(
      data?.error || `Server error (${response.status}). Please retry generating your SEO pack.`
    );
  }

  if (!data?.seo) {
    throw new Error('Server returned an unexpected empty SEO payload. Please retry.');
  }

  return data.seo;
}
