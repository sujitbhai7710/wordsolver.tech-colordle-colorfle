# Colordle Answer — colordleanswer.me

**Colordle Answer** is the complete source code for [colordleanswer.me](https://colordleanswer.me), a website that provides daily puzzle answers, solvers, archives, and unlimited practice for two popular color puzzle games: **Colordle** and **Colorfle**.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Game Logic](#game-logic)
  - [Colordle](#colordle-game-logic)
  - [Colorfle](#colorfle-game-logic)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Key Components](#key-components)
  - [SEO Strategy](#seo-strategy)
  - [Answer Reveal Mechanism](#answer-reveal-mechanism)
- [Backend (Worker)](#backend-worker)
  - [API Endpoints](#api-endpoints)
  - [Database Schema](#database-schema)
  - [Cron Job](#cron-job)
- [Deployment](#deployment)
  - [Frontend (Cloudflare Pages)](#frontend-cloudflare-pages)
  - [Backend (Cloudflare Worker)](#backend-cloudflare-worker)
- [Development](#development)
- [Important Notes](#important-notes)

---

## Overview

Colordle Answer serves two main purposes:

1. **Daily Answer Reveal** — Shows today's Colordle and Colorfle answers behind a click-to-reveal mechanism so players can choose whether to see the solution or solve it themselves.
2. **Archive & Solver Tools** — Provides a full archive of all past puzzle answers (browsable by calendar), interactive solvers that help narrow down candidates using game-specific algorithms, and unlimited practice modes.

The site is fully static (Astro SSG) with a Cloudflare Worker API backend for archive data. The "today" pages compute answers at build time using deterministic algorithms, while the archive pages fetch from the Worker API at runtime.

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Astro 6 + Svelte | Static site generation with interactive islands |
| **Styling** | Global CSS with CSS custom properties | Consistent design system |
| **Backend** | Cloudflare Worker + D1 SQL | Edge API for archive data |
| **Hosting** | Cloudflare Pages | Global CDN deployment |
| **Database** | Cloudflare D1 (SQLite) | Answer storage and caching |
| **Build** | Astro SSR → Static HTML | Pre-rendered pages for performance |
| **Deployment** | GitHub → Cloudflare Pages (auto) | Push-to-deploy workflow |

---

## Project Structure

```
wordsolver/
├── src/
│   ├── layouts/
│   │   └── Layout.astro              # Main layout (nav, footer, global CSS, SEO)
│   ├── pages/
│   │   ├── index.astro               # Homepage with game cards
│   │   ├── today.astro               # Combined "today" answers for both games
│   │   ├── colordle-answer-today.astro  # Colordle daily answer (CSS-only reveal)
│   │   ├── colorfle-answer-today.astro  # Colorfle daily answer (CSS-only reveal)
│   │   ├── colordle-archive.astro    # Colordle archive (calendar + API fetch)
│   │   ├── colorfle-archive.astro    # Colorfle archive (calendar + API fetch)
│   │   ├── colordle-solver.astro     # Colordle solver (Delta E CIE2000)
│   │   ├── colorfle-solver.astro     # Colorfle solver (feedback elimination)
│   │   ├── colordle-unlimited.astro  # Colordle unlimited practice
│   │   ├── colorfle-unlimited.astro  # Colorfle unlimited practice
│   │   ├── archive.astro             # Combined archive hub
│   │   ├── solver.astro              # Combined solver hub
│   │   ├── about.astro               # About page
│   │   ├── contact.astro             # Contact page
│   │   ├── privacy-policy.astro      # Privacy policy
│   │   └── terms-of-service.astro    # Terms of service
│   ├── components/
│   │   ├── ArchiveCalendar.svelte    # Interactive calendar for archive pages
│   │   ├── ColordleSolver.svelte     # Delta E CIE2000 solver UI
│   │   ├── ColorfleSolver.svelte     # Feedback-based solver UI
│   │   ├── ColordleUnlimited.svelte  # Unlimited practice game
│   │   └── ColorfleUnlimited.svelte  # Unlimited practice game
│   ├── lib/
│   │   ├── daily-data.js             # Build-time answer computation (today pages)
│   │   ├── daily-answers.ts          # Answer types and helpers
│   │   ├── colordle.ts               # Colordle game logic (full, CJS-dependent)
│   │   ├── colordle.js               # Colordle game logic (browser-compatible)
│   │   ├── colordle-targets-lite.js  # Color list for browser use
│   │   ├── colorfle.ts               # Colorfle game logic (full)
│   │   ├── colorfle.js               # Colorfle game logic (browser-compatible)
│   │   ├── colorfle-lite.js          # Colorfle browser logic
│   │   ├── color-utils.ts            # Color space conversion utilities
│   │   ├── seo.ts                    # Schema.org structured data generators
│   │   └── generated/
│   │       └── sitemap-lastmod.ts    # Auto-generated sitemap modification dates
│   └── data/
│       ├── colordle-targets.json     # Full color target list
│       └── colordle-resolved-colors.json  # Color name → hex mapping
├── worker/                            # Cloudflare Worker backend
│   ├── src/
│   │   ├── index.ts                  # Main request handler + routes + cron
│   │   ├── colordle-logic.ts         # Colordle answer computation (shared canonical logic)
│   │   └── colorfle-logic.ts         # Colorfle answer computation (seeded PRNG)
│   ├── scripts/
│   │   ├── generate-seed.mjs         # Standalone seed data generator
│   │   └── generate-seed.ts          # TypeScript seed generator
│   ├── schema.sql                    # D1 database schema
│   ├── seed.sql                      # Pre-computed seed data
│   ├── wrangler.toml                 # Worker configuration
│   ├── package.json                  # Worker dependencies
│   ├── tsconfig.json                 # TypeScript config
│   └── README.md                     # Worker-specific documentation
├── public/
│   ├── favicon.svg                   # Site favicon (SVG)
│   ├── favicon.ico                   # Site favicon (ICO)
│   ├── og-default.png               # Default Open Graph image
│   └── robots.txt                    # Search engine directives
├── astro.config.mjs                  # Astro configuration
├── package.json                      # Frontend dependencies
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # This file
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│                                                                  │
│  ┌──────────────────────────────┐  ┌──────────────────────────┐ │
│  │   Static Pages (Astro SSG)   │  │   Dynamic Components     │ │
│  │                              │  │   (Svelte Islands)        │ │
│  │  • Today answers (build-time)│  │  • ArchiveCalendar       │ │
│  │  • SEO content pages         │  │    fetches from API       │ │
│  │  • Solver UI                 │  │  • Solver filters         │ │
│  │  • Unlimited games           │  │  • Unlimited game state   │ │
│  └──────────────┬───────────────┘  └────────────┬─────────────┘ │
│                 │                                │               │
└─────────────────┼────────────────────────────────┼───────────────┘
                  │                                │
                  │ Build-time computation         │ Runtime fetch
                  │ (deterministic)                │
                  │                                ▼
┌─────────────────┼────────────────────────────────────────────────┐
│                 │           Cloudflare Edge                       │
│                 │                                                 │
│  ┌──────────────▼───────────────┐  ┌──────────────────────────┐  │
│  │   Cloudflare Pages           │  │   Cloudflare Worker       │  │
│  │   (Astro Static Site)        │  │   (API Backend)           │  │
│  │                              │  │                            │  │
│  │  Serves pre-built HTML/CSS/JS│  │  GET /api/today           │  │
│  │  for all pages               │  │  GET /api/colordle/*      │  │
│  │                              │  │  GET /api/colorfle/*      │  │
│  │  Today pages include answer  │  │  GET /api/stats           │  │
│  │  data embedded at build time │  │  GET /api/admin/*         │  │
│  └──────────────────────────────┘  └────────────┬─────────────┘  │
│                                                   │               │
│                                       ┌───────────▼───────────┐  │
│                                       │     D1 SQL Database   │  │
│                                       │                       │  │
│                                       │  • colordle_answers   │  │
│                                       │  • colorfle_answers   │  │
│                                       │  • metadata           │  │
│                                       └───────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│             Daily Cron Windows (12:00 AM, 9:00 AM, 5:01 PM IST)  │
│                                                                  │
│  1. Compute today's Colordle answer → store in D1               │
│  2. Compute today's Colorfle answer → store in D1               │
│  3. Update metadata table                                        │
│  4. Trigger GitHub repository_dispatch → rebuild Astro frontend  │
│     (so the static "today" pages have the new answer)            │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Today pages**: Answers are embedded at **Astro build time** using `daily-data.js`, which fetches `/api/today` from the Worker first and only falls back to local deterministic logic if the API is unavailable. Colordle and Colorfle now use separate puzzle windows, so the combined today page can safely show different current dates when the games roll over at different times.

2. **Archive pages**: The `ArchiveCalendar.svelte` component fetches answer data from the **Worker API** at runtime. When a user clicks a date on the calendar, the component calls `/api/{game}/archive/{date}` and displays the answer behind a JavaScript-powered reveal button.

3. **Solver/Unlimited pages**: Run entirely in the browser using client-side JavaScript. No server calls needed.

---

## Game Logic

### Colordle Game Logic

**What is Colordle?** Colordle is a daily browser game at [colordle.ryantanen.com](https://colordle.ryantanen.com) where you guess a secret color by typing its name. After each guess, you receive a percentage (0-100%) indicating how perceptually close your guess is to the target, calculated using Delta E CIE2000 in LAB color space.

**How answers are determined:**

- **Start date**: August 7, 2023 (the game uses Day #500 as the first day, meaning there were 499 prior days from an earlier numbering scheme)
- **Algorithm**: Sequential index into the canonical Colordle target list sourced from `colordle.ryantanen.com/colors.json`
- **Day number calculation**: `dayNumber = 500 + days_since_2023_08_07`
- **Color selection**: `colorName = COLOR_LIST[days_since_2023_08_07 % COLOR_LIST.length]`
- **Rollover time**: 16:30 UTC (after 16:30 UTC, the next day's puzzle is shown)
- **Color resolution**: Each color name is resolved to a hex code using a built-in `COLOR_HEX_MAP` with 600+ entries and 12 manual overrides from the reference repo

**Example calculation for 2026-05-20:**
```
Days since 2023-08-07 = 1017
Day number = 500 + 1017 = 1517
Index = 1017 % COLOR_LIST.length = 44
Color = COLOR_LIST[44] = "blueberry"
Hex = COLOR_HEX_MAP["blueberry"] = "#464196"
```

**Implementation files:**
- `src/lib/colordle.ts` — Full Colordle logic (used at build time, has CJS dependencies)
- `src/lib/colordle.js` — Browser-compatible version (used by solver/unlimited components)
- `src/lib/colordle-targets-lite.js` — Color list for browser use
- `src/lib/daily-data.js` — Build-time answer computation for today pages
- `src/data/colordle-targets.json` — Full target list
- `src/data/colordle-resolved-colors.json` — Name-to-hex mapping
- `worker/src/colordle-logic.ts` — Worker wrapper around the shared Colordle logic

**IMPORTANT**: The frontend and Worker now share the same Colordle rules: the full target list, start date `2023-08-07`, and day offset `500`. `daily-data.js` prefers the Worker API at build time, with the local implementation kept only as a fallback when the API is unavailable.

### Colorfle Game Logic

**What is Colorfle?** Colorfle is a daily browser game at [colorfle.com](https://colorfle.com) where you guess which three source colors from a 20-color palette mix together to produce a target color. Each source color has a specific weight.

**How answers are determined:**

- **Start date**: April 25, 2022
- **Algorithm**: Seeded pseudo-random number generator (PRNG) using the seed string `"{mode} {day} {month} {year}"`
- **Puzzle number**: `Math.floor((date - launch_date) / 86400000)`
- **Rollover time**: 15:00 UTC (midnight JST — Colorfle is a Japanese game)
- **Selection**: Pick N colors from the 20-color palette without replacement, using the PRNG
- **Color mixing**: Dual-space average — computes the weighted mix in both YCC and RGB color spaces, then averages the results for perceptually accurate blending
- **Modes**:
  - Mode 0 (default): 3 blocks with weights `[0.5, 0.34, 0.16]`
  - Mode 1: 4 blocks with weights `[0.4, 0.3, 0.2, 0.1]`

**The 20-color palette:**
White (#FFFFFF), Light Yellow (#FFFAC8), Pink (#FABEBE), Light Green (#AAFFC3), Lavender (#E6BEFF), Cyan (#46F0F0), Yellow (#FFE119), Lime (#BCF60C), Orange (#F58231), Green (#3CB44B), Magenta (#F032E6), Olive (#808000), Teal (#008080), Brown (#9A6324), Red (#E6194B), Blue (#4363D8), Purple (#911EB4), Maroon (#800000), Navy (#000075), Black (#000000)

**Seed string example for 2026-05-20 (mode 0):**
```
"0 20 4 2026"  (mode day month year, using UTC-adjusted date after rollover)
```

**Implementation files:**
- `src/lib/colorfle.ts` — Full Colorfle logic (CJS dependencies)
- `src/lib/colorfle.js` — Browser-compatible version
- `src/lib/colorfle-lite.js` — Lightweight version for components
- `src/lib/daily-data.js` — Build-time answer computation
- `worker/src/colorfle-logic.ts` — Worker version with seeded PRNG

---

## Frontend

### Pages

| Page Route | File | Description | Data Source |
|-----------|------|-------------|-------------|
| `/` | `index.astro` | Homepage with game cards and content | Static |
| `/today` | `today.astro` | Combined daily answers for both games | Build-time |
| `/colordle-answer-today` | `colordle-answer-today.astro` | Colordle daily answer with reveal | Build-time |
| `/colorfle-answer-today` | `colorfle-answer-today.astro` | Colorfle daily answer with reveal | Build-time |
| `/colordle-archive` | `colordle-archive.astro` | Calendar-based Colordle archive | Worker API |
| `/colorfle-archive` | `colorfle-archive.astro` | Calendar-based Colorfle archive | Worker API |
| `/colordle-solver` | `colordle-solver.astro` | Delta E CIE2000 solver | Client-side |
| `/colorfle-solver` | `colorfle-solver.astro` | Feedback elimination solver | Client-side |
| `/colordle-unlimited` | `colordle-unlimited.astro` | Unlimited Colordle practice | Client-side |
| `/colorfle-unlimited` | `colorfle-unlimited.astro` | Unlimited Colorfle practice | Client-side |
| `/archive` | `archive.astro` | Combined archive hub | Static |
| `/solver` | `solver.astro` | Combined solver hub | Static |
| `/about` | `about.astro` | About page | Static |
| `/contact` | `contact.astro` | Contact page | Static |
| `/privacy-policy` | `privacy-policy.astro` | Privacy policy | Static |
| `/terms-of-service` | `terms-of-service.astro` | Terms of service | Static |

### Key Components

#### ArchiveCalendar.svelte

The interactive calendar component used on both archive pages. Features:

- **Calendar view**: Month-by-month navigation with clickable date cells
- **List view**: Reverse-chronological list of all past puzzles
- **Search**: Filter by date or puzzle number
- **API integration**: Fetches answers from the Worker API on demand
- **Reveal mechanism**: JavaScript-powered reveal button (NOT CSS-only, unlike the today pages)
- **Month caching**: Pre-fetches all answers for the current month to avoid individual date requests

**CRITICAL BUG FIX**: The `.reveal-content` class in the global CSS (`Layout.astro`) has `display: none` by default for the CSS-only checkbox reveal mechanism on today pages. This was accidentally hiding the archive's reveal content too. The archive component now uses `.archive-reveal-content` with `display: block !important` to override this.

Props:
- `gameName` — Display name ("Colordle" or "Colorfle")
- `gameColor` — Theme color ("teal" or "pink")
- `gameType` — API path segment ("colordle" or "colorfle")
- `startDate` — Game launch date (Date object)

API calls:
- `GET /api/{gameType}/archive?month=YYYY-MM` — Fetch month batch
- `GET /api/{gameType}/archive/YYYY-MM-DD` — Fetch single date answer

### SEO Strategy

- **Site name**: "Colordle Answer"
- **Domain**: colordleanswer.me (used in all canonical URLs, schema.org, and Open Graph)
- **Structured data**: Schema.org JSON-LD on every page (Article, CollectionPage, WebSite, Organization, BreadcrumbList)
- **Open Graph + Twitter Cards**: Full meta tags on every page
- **Robots**: `index, follow, max-snippet:-1, max-image-preview:large`
- **Canonical URLs**: Every page has a self-referencing canonical URL
- **Hreflang**: English with x-default fallback

### Answer Reveal Mechanism

Two different reveal mechanisms are used:

1. **Today pages (CSS-only)**: Uses a hidden `<input type="checkbox">` with a `<label>` as the reveal button. When checked, CSS sibling selectors show the answer and hide the button. No JavaScript required. Classes: `.reveal-checkbox`, `.reveal-label`, `.reveal-content`.

2. **Archive pages (JavaScript)**: Uses Svelte state (`answerRevealed`). When the user clicks the reveal button, `answerRevealed` becomes `true` and the answer content is rendered. Class: `.archive-reveal-content` (NOT `.reveal-content` to avoid the global CSS `display:none` conflict).

---

## Backend (Worker)

See `worker/README.md` for complete Worker documentation. Key summary:

- **Worker URL**: `colordleanswer-api.wordleanswerofficial.workers.dev`
- **D1 Database**: `colordleanswer-db` (ID: `82c632eb-0b4e-4693-8b6c-32fb24b9ae40`)
- **Cron**: `30 18 * * *`, `30 3 * * *`, `31 11 * * *` (12:00 AM, 9:00 AM, and 5:01 PM IST)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` or `/health` | GET | Health check + endpoint list |
| `/api/today` | GET | Both games' current answers plus a per-game `dates` object |
| `/api/colordle/today` | GET | Today's Colordle answer |
| `/api/colorfle/today` | GET | Today's Colorfle answer |
| `/api/colordle/archive?month=YYYY-MM` | GET | Month batch for Colordle |
| `/api/colordle/archive/YYYY-MM-DD` | GET | Single date for Colordle |
| `/api/colorfle/archive?month=YYYY-MM` | GET | Month batch for Colorfle |
| `/api/colorfle/archive/YYYY-MM-DD` | GET | Single date for Colorfle |
| `/api/colordle/search?color=name` | GET | Search Colordle answers by color name |
| `/api/stats` | GET | Database statistics |
| `/api/admin/backfill?start=...&end=...` | GET | Backfill answers for date range |
| `/api/admin/clear?confirm=yes&game=both` | GET | Clear database tables |

### Database Schema

Three tables in D1 SQLite:

1. **`colordle_answers`** — date (PK), day_number, color_name, color_hex, timestamps
2. **`colorfle_answers`** — date+mode (PK), puzzle_number, color_indices (JSON), color_names (JSON), color_hexes (JSON), color_weights (JSON), target_hex, target_rgb (JSON), timestamps
3. **`metadata`** — key (PK), value, updated_at

### Cron Job

At three daily windows — 18:30 UTC, 03:30 UTC, and 11:31 UTC — the worker:
1. Computes and stores the current verified Colordle answer if the official list already includes that date
2. Computes and stores the current Colorfle answer
3. Validates and fixes stale D1 rows before serving them again
4. Updates metadata
5. Triggers GitHub `repository_dispatch` to rebuild the Astro frontend only after both answers are safely stored

---

## Deployment

### Frontend (Cloudflare Pages)

The Astro site is deployed to Cloudflare Pages.

- The GitHub workflow deploys to **Cloudflare Pages**, not GitHub Pages. GitHub is only the runner.
- For direct local deployment to Cloudflare, create `cloudflare.env.local` from `cloudflare.env.example` and run `npm run cloudflare:deploy`.
- The midnight Worker cron still uses GitHub `repository_dispatch`, because it needs a remote build trigger after both daily answers are safely stored in D1.

**Build configuration:**
- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18+

**Custom domain:** `colordleanswer.me` (configured in Cloudflare Pages dashboard)

### Backend (Cloudflare Worker)

The Worker is deployed separately using Wrangler CLI from the `worker/` directory.

```bash
cd worker
npm install
wrangler deploy
```

See `worker/README.md` for complete deployment instructions.

---

## Development

### Prerequisites

- Node.js 18+
- npm or bun

### Frontend Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Worker Setup

```bash
cd worker
npm install

# Local development
wrangler dev

# Apply schema locally
wrangler d1 execute colordleanswer-db --local --file=./schema.sql
```

---

## Important Notes

1. **Aligned answer logic**: Colordle and Colorfle today pages, archive pages, and the Worker now use the same answer rules. The Worker/D1 layer is the operational source of truth, and `daily-data.js` only falls back to local deterministic generation if the API is temporarily unavailable during a build.
2. **Per-game current dates**: The site no longer assumes Colordle and Colorfle share one universal "today" date. Each game follows its own puzzle window, which fixes rollover mismatches on the combined today page and archives.

2. **CSS reveal conflict**: The global `.reveal-content { display: none }` style in `Layout.astro` was hiding the archive's answer content. The archive now uses `.archive-reveal-content` with `display: block !important` to work around this.

3. **D1 lazy computation**: The Worker computes and caches answers on-the-fly. If a date hasn't been stored in D1 yet, the Worker computes it, stores it, and returns it. This means the full archive works even without backfill.

4. **Cron-triggered rebuilds**: The worker now runs at 12:00 AM IST, 9:00 AM IST, and 5:01 PM IST. It first stores both answers in D1, writes cron metadata, and only then sends the GitHub `repository_dispatch` event (`pages-publish-requested`) to rebuild the Astro frontend. This requires `GITHUB_TOKEN` and `GITHUB_REPO` secrets to be set on the Worker.
5. **No Colordle wraparound**: If the official Colordle list has not published the next date yet, the site now shows unavailable instead of wrapping to an older color or reusing the last available answer.

5. **No user data collection**: The site has no accounts, no tracking, no cookies, and no server-side user data. All solver and unlimited game computation happens in the browser. The only server-side data is the answer database and metadata.
