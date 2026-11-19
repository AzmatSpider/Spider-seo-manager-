import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Files,
  Loader2,
  RotateCcw,
  Scissors,
  Sparkles,
} from 'lucide-react';
import {
  MinecraftEdition,
  SavedSeoPack,
  SeoGenerateInput,
  SeoLanguage,
  SeoOutput,
  VideoType,
} from '../types/seo';
import { generateSeoPack } from '../services/seoApi';
import {
  YOUTUBE_TAG_CHAR_LIMIT,
  copyToClipboard,
  createPackId,
  enforceTagLimit,
  formatPackForCopyAll,
} from '../utils/seoHelpers';

interface GeneratorViewProps {
  activePack: SavedSeoPack | null;
  onSavePack: (pack: SavedSeoPack) => void;
  onSelectNewPack: () => void;
  onNotify: (message: string) => void;
}

const DEFAULT_INPUT: SeoGenerateInput = {
  topic: '',
  videoType: 'YouTube Long Video',
  language: 'English',
  edition: 'Java',
  details: '',
  creatorCredit: '',
};

type CopySectionKey = 'title' | 'description' | 'keywords' | 'tags' | 'tips' | 'all';

export function GeneratorView({
  activePack,
  onSavePack,
  onSelectNewPack,
  onNotify,
}: GeneratorViewProps) {
  const [input, setInput] = useState<SeoGenerateInput>(
    activePack ? activePack.input : DEFAULT_INPUT
  );
  const [output, setOutput] = useState<SeoOutput | null>(
    activePack ? activePack.output : null
  );
  const [currentPackId, setCurrentPackId] = useState<string | null>(
    activePack ? activePack.id : null
  );
  const [createdAt, setCreatedAt] = useState<number>(
    activePack ? activePack.createdAt : Date.now()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<CopySectionKey | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const outputSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activePack) {
      setInput(activePack.input);
      setOutput(activePack.output);
      setCurrentPackId(activePack.id);
      setCreatedAt(activePack.createdAt);
      setErrorMessage(null);
      setValidationError(null);
    } else {
      setInput(DEFAULT_INPUT);
      setOutput(null);
      setCurrentPackId(null);
      setCreatedAt(Date.now());
      setErrorMessage(null);
      setValidationError(null);
    }
  }, [activePack]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleRunGeneration = async () => {
    const trimmedTopic = input.topic.trim();
    if (!trimmedTopic) {
      setValidationError('Please enter a Minecraft Video Topic to generate your SEO pack.');
      return;
    }

    setValidationError(null);
    setErrorMessage(null);
    setIsLoading(true);

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const normalizedInput: SeoGenerateInput = {
        ...input,
        topic: trimmedTopic,
        details: input.details.trim(),
        creatorCredit: input.creatorCredit.trim(),
      };

      const generated = await generateSeoPack(normalizedInput, controller.signal);
      const now = Date.now();
      const packId = currentPackId ?? createPackId();
      const packCreatedAt = currentPackId ? createdAt : now;

      const savedPack: SavedSeoPack = {
        id: packId,
        createdAt: packCreatedAt,
        updatedAt: now,
        input: normalizedInput,
        output: generated,
      };

      setOutput(generated);
      setCurrentPackId(packId);
      setCreatedAt(packCreatedAt);
      onSavePack(savedPack);
      onNotify(currentPackId ? 'SEO pack regenerated and saved.' : 'SEO pack generated and saved.');

      setTimeout(() => {
        outputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const message =
        err instanceof Error ? err.message : 'Unexpected error generating SEO pack.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldEdit = (field: keyof SeoOutput, value: string) => {
    if (!output) return;
    const nextOutput: SeoOutput = {
      ...output,
      [field]: value,
    };
    setOutput(nextOutput);

    if (currentPackId) {
      onSavePack({
        id: currentPackId,
        createdAt,
        updatedAt: Date.now(),
        input,
        output: nextOutput,
      });
    }
  };

  const handleCopy = async (key: CopySectionKey, text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedKey(key);
      onNotify(`${label} copied to clipboard.`);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    } else {
      onNotify('Clipboard access blocked. Please select text and copy manually.');
    }
  };

  const handleResetNew = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
    setInput(DEFAULT_INPUT);
    setOutput(null);
    setCurrentPackId(null);
    setErrorMessage(null);
    setValidationError(null);
    onSelectNewPack();
  };

  const tagCharCount = output?.tags.length ?? 0;
  const tagsOverLimit = tagCharCount > YOUTUBE_TAG_CHAR_LIMIT;
  const keywordCount = output?.keywords
    ? output.keywords.split(',').filter((k) => k.trim().length > 0).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Minecraft SEO Generator
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Fill in your video details to generate 5 ready-to-paste YouTube SEO sections.
          </p>
        </div>

        {(output || input.topic) && (
          <button
            type="button"
            onClick={handleResetNew}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#191919] hover:bg-[#222222] border border-[#2E2E2E] text-sm font-medium text-neutral-200 transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            New Blank Pack
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form */}
        <section className="lg:col-span-5 rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 sm:p-6 space-y-5">
          {/* 1. Video Topic */}
          <div>
            <label
              htmlFor="video-topic"
              className="block text-sm font-semibold text-white mb-2"
            >
              1. Video Topic <span className="text-[#FFD700]">*</span>
            </label>
            <input
              id="video-topic"
              type="text"
              value={input.topic}
              onChange={(e) => {
                setInput({ ...input, topic: e.target.value });
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Easy 1.21 Iron Farm in Survival, 100 Days Hardcore..."
              className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2E2E2E] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFD700]"
            />
            {validationError && (
              <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{validationError}</span>
              </p>
            )}
          </div>

          {/* 2. Video Type */}
          <div>
            <span className="block text-sm font-semibold text-white mb-2">
              2. Video Type
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              {(['YouTube Shorts', 'YouTube Long Video'] as VideoType[]).map((type) => {
                const active = input.videoType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInput({ ...input, videoType: type })}
                    className={`min-h-[44px] px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#FFD700] text-[#080808] border-[#FFD700] font-semibold'
                        : 'bg-[#0D0D0D] text-neutral-300 border-[#2E2E2E] hover:border-neutral-500'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Language */}
          <div>
            <span className="block text-sm font-semibold text-white mb-2">
              3. Language
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['English', 'Hindi', 'Hinglish'] as SeoLanguage[]).map((lang) => {
                const active = input.language === lang;
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setInput({ ...input, language: lang })}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#FFD700] text-[#080808] border-[#FFD700] font-semibold'
                        : 'bg-[#0D0D0D] text-neutral-300 border-[#2E2E2E] hover:border-neutral-500'
                    }`}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Minecraft Edition */}
          <div>
            <span className="block text-sm font-semibold text-white mb-2">
              4. Minecraft Edition
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['Java', 'Bedrock', 'Both'] as MinecraftEdition[]).map((edition) => {
                const active = input.edition === edition;
                return (
                  <button
                    key={edition}
                    type="button"
                    onClick={() => setInput({ ...input, edition })}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      active
                        ? 'bg-[#FFD700] text-[#080808] border-[#FFD700] font-semibold'
                        : 'bg-[#0D0D0D] text-neutral-300 border-[#2E2E2E] hover:border-neutral-500'
                    }`}
                  >
                    {edition}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Optional Creator Credit & Video Details */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="creator-credit"
                className="block text-sm font-semibold text-white mb-1.5"
              >
                Original Creator Credit{' '}
                <span className="text-xs font-normal text-neutral-400">(optional)</span>
              </label>
              <input
                id="creator-credit"
                type="text"
                value={input.creatorCredit}
                onChange={(e) => setInput({ ...input, creatorCredit: e.target.value })}
                placeholder="e.g. Farm design by @IanXO4, Shader by Complementary"
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#0D0D0D] border border-[#2E2E2E] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFD700]"
              />
            </div>

            <div>
              <label
                htmlFor="video-details"
                className="block text-sm font-semibold text-white mb-1.5"
              >
                5. Optional Video Details{' '}
                <span className="text-xs font-normal text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="video-details"
                rows={4}
                value={input.details}
                onChange={(e) => setInput({ ...input, details: e.target.value })}
                placeholder="Add Minecraft version (e.g. 1.21.4), mod/datapack names, seed, SMP name, or key moments you want mentioned..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2E2E2E] text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#FFD700] resize-y"
              />
            </div>
          </div>

          {/* Generate CTA */}
          <button
            type="button"
            onClick={handleRunGeneration}
            disabled={isLoading}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#FFD700] hover:bg-[#F2C900] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99] text-[#080808] font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Minecraft SEO...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{output ? 'Regenerate SEO' : 'Generate SEO'}</span>
              </>
            )}
          </button>
        </section>

        {/* Right Column: 5-Section Output */}
        <div ref={outputSectionRef} className="lg:col-span-7 space-y-4">
          {errorMessage && (
            <div
              role="alert"
              className="rounded-2xl bg-red-950/40 border border-red-500/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-red-200">
                    Generation Failed
                  </h2>
                  <p className="text-xs text-red-300 mt-0.5">{errorMessage}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRunGeneration}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {isLoading && !output && (
            <div className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-8 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#FFD700] animate-spin mx-auto" />
              <h2 className="text-base font-semibold text-white">
                Crafting your Minecraft SEO Pack...
              </h2>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Building Title, Description + Hashtags, Keywords, 500-char YouTube Tags, and Discoverability Tips.
              </p>
            </div>
          )}

          {!isLoading && !output && !errorMessage && (
            <div className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-8 sm:p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#121212] border border-[#2A2A2A] flex items-center justify-center mx-auto text-[#FFD700]">
                <Files className="w-5 h-5" />
              </div>
              <h2 className="text-base font-semibold text-white">
                Your 5-Section SEO Output Appears Here
              </h2>
              <p className="text-sm text-neutral-400 max-w-md mx-auto">
                Enter your Minecraft video topic, select Shorts or Long Video, pick your language and edition, then tap <span className="text-[#FFD700] font-medium">Generate SEO</span>.
              </p>
            </div>
          )}

          {output && (
            <>
              {/* Global Output Toolbar */}
              <div className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-neutral-300">
                  <span className="text-[#FFD700] font-semibold">Auto-Saved</span>
                  <span className="mx-1.5 text-neutral-500">·</span>
                  <span>All fields are editable</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleRunGeneration}
                    disabled={isLoading}
                    className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#121212] hover:bg-[#242424] border border-[#2E2E2E] text-xs font-semibold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Regenerate SEO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        'all',
                        formatPackForCopyAll(output, input.topic),
                        'Full SEO Pack'
                      )
                    }
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFD700] hover:bg-[#F2C900] text-[#080808] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copiedKey === 'all' ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>COPIED ALL</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>COPY ALL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SECTION 1: TITLE */}
              <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#FFD700]">
                      01. Title
                    </h2>
                    <p className="text-xs text-neutral-400 tabular-nums">
                      {output.title.length} characters
                    </p>
                  </div>
                  <CopySectionButton
                    copied={copiedKey === 'title'}
                    onClick={() => handleCopy('title', output.title, 'Title')}
                  />
                </div>
                <textarea
                  rows={2}
                  value={output.title}
                  onChange={(e) => handleFieldEdit('title', e.target.value)}
                  aria-label="Generated YouTube Title"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2E2E2E] text-sm font-medium text-white focus:outline-none focus:border-[#FFD700] resize-y"
                />
              </section>

              {/* SECTION 2: DESCRIPTION + HASHTAGS */}
              <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#FFD700]">
                      02. Description + Hashtags
                    </h2>
                    <p className="text-xs text-neutral-400 tabular-nums">
                      {output.descriptionWithHashtags.length} characters
                    </p>
                  </div>
                  <CopySectionButton
                    copied={copiedKey === 'description'}
                    onClick={() =>
                      handleCopy(
                        'description',
                        output.descriptionWithHashtags,
                        'Description & Hashtags'
                      )
                    }
                  />
                </div>
                <textarea
                  rows={8}
                  value={output.descriptionWithHashtags}
                  onChange={(e) =>
                    handleFieldEdit('descriptionWithHashtags', e.target.value)
                  }
                  aria-label="Generated YouTube Description and Hashtags"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2E2E2E] text-sm text-neutral-100 leading-relaxed focus:outline-none focus:border-[#FFD700] resize-y"
                />
              </section>

              {/* SECTION 3: KEYWORDS */}
              <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#FFD700]">
                      03. Keywords
                    </h2>
                    <p className="text-xs text-neutral-400 tabular-nums">
                      {keywordCount} comma-separated search keywords
                    </p>
                  </div>
                  <CopySectionButton
                    copied={copiedKey === 'keywords'}
                    onClick={() => handleCopy('keywords', output.keywords, 'Keywords')}
                  />
                </div>
                <textarea
                  rows={4}
                  value={output.keywords}
                  onChange={(e) => handleFieldEdit('keywords', e.target.value)}
                  aria-label="Generated Search Keywords"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2E2E2E] text-sm text-neutral-100 leading-relaxed focus:outline-none focus:border-[#FFD700] resize-y"
                />
              </section>

              {/* SECTION 4: TAGS (500-char YouTube limit) */}
              <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#FFD700]">
                      04. YouTube Tags
                    </h2>
                    <p
                      className={`text-xs tabular-nums ${
                        tagsOverLimit ? 'text-red-400 font-semibold' : 'text-neutral-400'
                      }`}
                    >
                      {tagCharCount} / {YOUTUBE_TAG_CHAR_LIMIT} characters
                      {tagsOverLimit ? ' (Over YouTube limit)' : ' (YouTube limit compliant)'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {tagsOverLimit && (
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldEdit(
                            'tags',
                            enforceTagLimit(output.tags, YOUTUBE_TAG_CHAR_LIMIT)
                          )
                        }
                        className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-400/40 text-xs font-semibold text-amber-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Trim to 500</span>
                      </button>
                    )}
                    <CopySectionButton
                      copied={copiedKey === 'tags'}
                      onClick={() => handleCopy('tags', output.tags, 'YouTube Tags')}
                    />
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={output.tags}
                  onChange={(e) => handleFieldEdit('tags', e.target.value)}
                  aria-label="Generated YouTube Tags"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0D] border text-sm font-mono text-neutral-100 leading-relaxed focus:outline-none resize-y ${
                    tagsOverLimit
                      ? 'border-red-500/70 focus:border-red-400'
                      : 'border-[#2E2E2E] focus:border-[#FFD700]'
                  }`}
                />
              </section>

              {/* SECTION 5: SEO TIPS */}
              <section className="rounded-2xl bg-[#191919] border border-[#2A2A2A] p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-[#FFD700]">
                      05. SEO Tips
                    </h2>
                    <p className="text-xs text-neutral-400">
                      {input.videoType === 'YouTube Shorts'
                        ? 'Hook ideas & Shorts feed discoverability'
                        : 'Thumbnail concepts & Long Video discoverability'}
                    </p>
                  </div>
                  <CopySectionButton
                    copied={copiedKey === 'tips'}
                    onClick={() => handleCopy('tips', output.seoTips, 'SEO Tips')}
                  />
                </div>
                <textarea
                  rows={6}
                  value={output.seoTips}
                  onChange={(e) => handleFieldEdit('seoTips', e.target.value)}
                  aria-label="Generated SEO Tips"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0D0D] border border-[#2E2E2E] text-sm text-neutral-100 leading-relaxed focus:outline-none focus:border-[#FFD700] resize-y"
                />
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CopySectionButton({
  copied,
  onClick,
}: {
  copied: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
        copied
          ? 'bg-[#FFD700] text-[#080808] border-[#FFD700]'
          : 'bg-[#121212] text-white border-[#2E2E2E] hover:border-[#FFD700]/60'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
