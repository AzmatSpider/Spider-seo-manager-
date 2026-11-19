import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

interface SeoRequestBody {
  topic?: string;
  videoType?: 'YouTube Shorts' | 'YouTube Long Video';
  language?: 'English' | 'Hindi' | 'Hinglish';
  edition?: 'Java' | 'Bedrock' | 'Both';
  details?: string;
  creatorCredit?: string;
}

interface SeoGeneratedPayload {
  title: string;
  descriptionWithHashtags: string;
  keywords: string;
  tags: string;
  seoTips: string;
}

function enforceYouTubeTagLimit(rawTags: string, maxChars = 500): string {
  const cleanedTags = rawTags
    .split(',')
    .map((tag) => tag.trim().replace(/^#+/, ''))
    .filter((tag) => tag.length > 0);

  const uniqueTags: string[] = [];
  const seen = new Set<string>();

  for (const tag of cleanedTags) {
    const normalized = tag.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueTags.push(tag);
    }
  }

  const kept: string[] = [];
  let currentLength = 0;

  for (const tag of uniqueTags) {
    const separatorLength = kept.length > 0 ? 2 : 0; // ", "
    if (currentLength + separatorLength + tag.length <= maxChars) {
      kept.push(tag);
      currentLength += separatorLength + tag.length;
    }
  }

  return kept.join(', ');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractStatusCode(error: unknown): number {
  if (typeof error === 'object' && error !== null) {
    const errObj = error as { status?: number; code?: number; statusCode?: number };
    if (typeof errObj.status === 'number') return errObj.status;
    if (typeof errObj.statusCode === 'number') return errObj.statusCode;
    if (typeof errObj.code === 'number') return errObj.code;
  }
  return 500;
}

function formatGeminiError(error: unknown): { status: number; message: string } {
  const status = extractStatusCode(error);
  const rawMessage = error instanceof Error ? error.message : String(error);
  const lower = rawMessage.toLowerCase();

  if (status === 403 || lower.includes('permission_denied')) {
    return {
      status: 403,
      message: 'Gemini API permission denied. Please verify your GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (status === 400 && (lower.includes('api_key_invalid') || lower.includes('api key'))) {
    return {
      status: 400,
      message: 'Invalid Gemini API key. Please check GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (status === 429 || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return {
      status: 429,
      message: 'Gemini API rate limit or quota reached. Please wait a moment and tap Retry.',
    };
  }
  if (status === 404 || lower.includes('not_found')) {
    return {
      status: 404,
      message: 'Configured Gemini model was not found. Please contact support or update model config.',
    };
  }
  return {
    status: status >= 400 && status < 600 ? status : 500,
    message: rawMessage || 'Failed to generate SEO pack. Please try again.',
  };
}

async function generateMinecraftSeo(body: SeoRequestBody): Promise<SeoGeneratedPayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'GEMINI_API_KEY is not configured on the server. Add your key in Settings > Secrets to generate SEO packs.'
    ) as Error & { status?: number };
    err.status = 500;
    throw err;
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const topic = (body.topic ?? '').trim();
  const videoType = body.videoType === 'YouTube Shorts' ? 'YouTube Shorts' : 'YouTube Long Video';
  const language =
    body.language === 'Hindi' || body.language === 'Hinglish' ? body.language : 'English';
  const edition =
    body.edition === 'Java' || body.edition === 'Bedrock' ? body.edition : 'Both';
  const details = (body.details ?? '').trim();
  const creatorCredit = (body.creatorCredit ?? '').trim();

  const systemInstruction = `You are SPIDER SEO MANAGER, a senior YouTube SEO strategist specialized exclusively in Minecraft content (Java Edition, Bedrock Edition, MCPE, SMPs, mods, farms, redstone, building, survival, PvP, and Shorts).

Rules you MUST follow strictly:
1. Language precision:
   - If Language is "English": Write title, description, and tips in crisp, natural gaming English.
   - If Language is "Hindi": Write title, description, and tips in natural Hindi (Devanagari script with commonly used Minecraft English terms like Minecraft, Farm, SMP, Mod where creators naturally mix them).
   - If Language is "Hinglish": Write title, description, and tips in conversational Roman-script Hinglish used by Indian Minecraft YouTubers (e.g., "Maine Banaya Sabse Fast Iron Farm!", "Is video mein hum...", etc.).
2. Video Type adaptation:
   - For "YouTube Shorts": Keep the title punchy (under 65 chars), include #shorts and 4-6 Shorts-optimized hashtags in the description, write a short snappy description, and in seoTips prioritize 3-second opening hook scripts, loop retention ideas, and Shorts discovery advice.
   - For "YouTube Long Video": Craft a high-CTR, curiosity-driven searchable title (55-75 chars), write a rich structured YouTube description (hook intro, what viewers will learn/see, Minecraft edition info, clean placeholder timestamps like 00:00 Intro, and 5-8 relevant hashtags), and in seoTips provide concrete Thumbnail suggestions (visual layout, focal contrast, 2-4 word thumbnail text), search + browse optimization, and audience retention tips.
3. Original Creator Credit:
   - If creatorCredit is provided or an original creator/mod author/map maker is mentioned in details, you MUST include a clear, respectful "Credits" section inside descriptionWithHashtags crediting them properly.
4. YouTube Tags 500-character hard limit:
   - The "tags" field MUST be a comma-separated list of clean YouTube tags (no # symbols) whose TOTAL character length including commas and spaces is strictly under 500 characters (aim for 420-485 characters).
5. Truthfulness:
   - NEVER fabricate or invent fake YouTube statistics, fake search volume numbers, fake competition scores, or fake CTR percentages.`;

  const userPrompt = `Generate a complete YouTube SEO pack for this Minecraft video:
- Video Topic: ${topic}
- Video Type: ${videoType}
- Language: ${language}
- Minecraft Edition: ${edition === 'Both' ? 'Both Java & Bedrock Edition' : `Minecraft ${edition} Edition`}
- Original Creator Credit: ${creatorCredit || 'None provided'}
- Extra Video Details: ${details || 'None provided'}

Return the exact 5 sections as structured JSON.`;

  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          const timeoutErr = new Error(
            'Gemini AI request timed out. Please check your connection and tap Retry.'
          ) as Error & { status?: number };
          timeoutErr.status = 504;
          reject(timeoutErr);
        }, 25000);
      });

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: userPrompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description:
                    'One high-CTR, SEO-friendly YouTube video title relevant to the exact Minecraft topic and language.',
                },
                descriptionWithHashtags: {
                  type: Type.STRING,
                  description:
                    'Complete ready-to-paste YouTube description including creator credits if provided, edition context, and relevant hashtags at the bottom.',
                },
                keywords: {
                  type: Type.STRING,
                  description:
                    'Comma-separated list of 12-18 relevant Minecraft search keywords and long-tail phrases.',
                },
                tags: {
                  type: Type.STRING,
                  description:
                    'Comma-separated YouTube tags without # symbols, strictly under 500 characters total.',
                },
                seoTips: {
                  type: Type.STRING,
                  description:
                    'Actionable SEO discoverability suggestions, including thumbnail design ideas for Long Videos or opening hook scripts for YouTube Shorts.',
                },
              },
              required: ['title', 'descriptionWithHashtags', 'keywords', 'tags', 'seoTips'],
            },
          },
        }),
        timeoutPromise,
      ]);

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        throw new Error('Gemini returned an empty response.');
      }

      const parsed = JSON.parse(rawText) as Partial<SeoGeneratedPayload>;

      return {
        title: (parsed.title ?? '').trim(),
        descriptionWithHashtags: (parsed.descriptionWithHashtags ?? '').trim(),
        keywords: (parsed.keywords ?? '').trim(),
        tags: enforceYouTubeTagLimit(parsed.tags ?? '', 500),
        seoTips: (parsed.seoTips ?? '').trim(),
      };
    } catch (err) {
      lastError = err;
      const status = extractStatusCode(err);
      const isRetryable = status === 500 || status === 502 || status === 503 || status === 429;
      if (!isRetryable || attempt === maxAttempts) {
        throw err;
      }
      await sleep(500 * Math.pow(2, attempt - 1));
    }
  }

  throw lastError;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  // Allow Capacitor Android WebView and local origins to call the API
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'SPIDER SEO MANAGER',
      brand: 'AzmatSpider',
      version: '1.0.0',
    });
  });

  app.post('/api/seo/generate', async (req, res) => {
    const body = (req.body ?? {}) as SeoRequestBody;
    const topic = typeof body.topic === 'string' ? body.topic.trim() : '';

    if (!topic) {
      res.status(400).json({
        error: 'Video Topic is required before generating an SEO pack.',
      });
      return;
    }

    if (topic.length > 240) {
      res.status(400).json({
        error: 'Video Topic must be 240 characters or fewer.',
      });
      return;
    }

    try {
      const seo = await generateMinecraftSeo(body);
      res.json({ seo });
    } catch (error) {
      console.error('[Spider SEO API Error]:', error);
      const formatted = formatGeminiError(error);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SPIDER SEO MANAGER server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SPIDER SEO MANAGER server:', err);
  process.exit(1);
});
