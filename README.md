# SPIDER SEO MANAGER

**Created by AzmatSpider**

An AI-powered YouTube SEO assistant built for Minecraft content creators (Java Edition, Bedrock Edition, Shorts, and Long Videos). Powered by Google Gemini (`@google/genai`) on an Express backend with a mobile-first React + TypeScript interface and Capacitor Android integration.

---

## Features

- **Home Dashboard**: Welcome hub with **SPIDER SEO MANAGER** branding, quick creation CTA, total generated packs count, and searchable/filterable **Recent SEO Packs**.
- **Minecraft SEO Generator**:
  - Inputs: Video Topic (required), Video Type (`YouTube Shorts` / `YouTube Long Video`), Language (`English` / `Hindi` / `Hinglish`), Minecraft Edition (`Java` / `Bedrock` / `Both`), Optional Original Creator Credit, and Optional Video Details.
  - Outputs (5 editable sections):
    1. **Title** — High-CTR, SEO-friendly title tailored to video format and language
    2. **Description + Hashtags** — Complete description including original creator credits and hashtags
    3. **Keywords** — Comma-separated search keywords
    4. **Tags** — Comma-separated YouTube tags strictly obeying YouTube's **500-character limit**
    5. **SEO Tips** — Discoverability strategies, thumbnail concepts for Long Videos, and opening hook ideas for Shorts
- **Clipboard & Local Persistence**: Individual **Copy** buttons per section, **COPY ALL** button, in-place editing, **Regenerate SEO**, and automatic local device history (`localStorage`).
- **Settings**: App version (`1.0.0`), Spider theme palette info (`#080808`, `#FFD700`, `#191919`, `#FFFFFF`), and **Clear History**.

---

## Project Structure

```text
spider-seo-manager/
├── android/                  # Capacitor Android Gradle project
├── src/
│   ├── components/           # DashboardView, GeneratorView, SettingsView, SpiderLogo
│   ├── services/             # API client (seoApi.ts)
│   ├── types/                # TypeScript definitions (seo.ts)
│   ├── utils/                # Tag limiter, clipboard, storage helpers
│   ├── App.tsx               # Responsive mobile + desktop shell
│   ├── index.css             # Tailwind CSS v4 & Spider theme
│   └── main.tsx
├── server.ts                 # Express server + server-side @google/genai integration
├── capacitor.config.ts       # Capacitor Android configuration
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (copy `.env.example` to `.env`):
   ```bash
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```
3. Start the full-stack development server (Express + Vite on port 3000):
   ```bash
   npm run dev
   ```
4. Build and run in production mode:
   ```bash
   npm run build
   npm start
   ```

---

## Android APK Build Instructions (Capacitor)

> Note: Building an Android `.apk` requires the **Android SDK**, **Java JDK 17+**, and **Gradle** (either via Android Studio or command-line Android SDK tools).

1. **Point Android client to your hosted backend URL** (so the APK does not bundle your secret `GEMINI_API_KEY`):
   In `.env.production` or your shell environment:
   ```bash
   export VITE_API_BASE_URL="https://your-deployed-spider-seo-server.example.com"
   ```
2. **Build the web assets and sync into Android**:
   ```bash
   npm run cap:sync
   ```
3. **Build Debug APK via Gradle CLI**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   The generated debug APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
4. **Or open in Android Studio** to build a signed Release APK / AAB:
   ```bash
   npm run cap:open
   ```
   In Android Studio, use **Build > Build Bundle(s) / APK(s) > Build APK(s)** or **Generate Signed Bundle / APK**.
