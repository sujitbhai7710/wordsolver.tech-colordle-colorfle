# Colordle Answer API Worker

## Overview

This is a **Cloudflare Worker + D1 SQL database** that serves as the backend API for [colordleanswer.me](https://colordleanswer.me). It provides daily puzzle answers for **Colordle** and **Colorfle** games, plus archive data, color search, and admin tools.

All answers are **deterministic** — computed algorithmically from the game rules — and cached in a D1 SQLite database for fast edge delivery. If an answer hasn't been stored yet, the Worker computes it on-the-fly, persists it, and returns it.

---

## Architecture

| Component | Details |
|-----------|---------|
| **Runtime** | Cloudflare Worker with D1 SQL database |
| **Worker URL** | `colordleanswer-api.wordleanswerofficial.workers.dev` |
| **D1 Database** | `colordleanswer-db` (ID: `82c632eb-0b4e-4693-8b6c-32fb24b9ae40`) |
| **Cron** | `30 18 * * *` (12:00 AM IST daily) — ensures today's answers are in DB and triggers GitHub rebuild |
| **Compatibility** | `nodejs_compat` flag enabled |

```
┌──────────────────────────────────────────────────────────┐
│                    Cloudflare Edge                        │
│                                                           │
│  ┌──────────────────┐     ┌──────────────────────────┐   │
│  │   Astro Static   │     │   Cloudflare Worker       │   │
│  │   Site (Pages)   │◄───►│   (This Project)          │   │
│  │                  │     │                            │   │
│  │  - Today pages   │     │  - /api/today              │   │
│  │  - SEO pages     │     │  - /api/colordle/*         │   │
│  │  - Solvers       │     │  - /api/colorfle/*         │   │
│  │  - Archive pages │     │  - /api/stats              │   │
│  │    (fetch from   │     │  - /api/admin/*            │   │
│  │     Worker API)  │     │                            │   │
│  └──────────────────┘     └────────────┬───────────────┘   │
│                                        │                   │
│                            ┌───────────▼───────────────┐   │
│                            │     D1 SQL Database       │   │
│                            │                           │   │
│                            │  - colordle_answers       │   │
│                            │  - colorfle_answers       │   │
│                            │  - metadata               │   │
│                            └───────────────────────────┘   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                Daily Cron (12 AM IST)                     │
│                                                           │
│  1. Compute today's Colordle answer → store in D1        │
│  2. Compute today's Colorfle answer → store in D1        │
│  3. Update metadata table                                 │
│  4. Trigger GitHub repository_dispatch → rebuild Astro    │
└──────────────────────────────────────────────────────────┘
```

---

## Game Details

| Game | Start Date | Day Offset | Answer Source |
|------|-----------|------------|---------------|
| **Colordle** | 2023-08-07 | 500 (first entry is Day #500) | Deterministic (976-color list indexed by day number) |
| **Colorfle** | 2022-04-25 | 0 (first entry is Day #0) | Deterministic (seeded PRNG + YCC/RGB color mixing) |

> **Important**: Colordle did NOT start on 2022-04-25. That is the Colorfle launch date. Colordle launched on **2023-08-07** (day #500, meaning there were 499 earlier puzzles from a different numbering system).

### Colordle Logic

- **Algorithm**: Sequential index into a 976-color canonical list from `colordle.ryantanen.com/colors.json`
- **Rollover**: 16:30 UTC (after 16:30 UTC, the next day's puzzle is shown)
- **Answer type**: Named color with hex code (e.g., "Night Sky" → `#292b31`)
- **Day numbering**: `dayNumber = 500 + daysSinceStart`
- **Color resolution**: Names are resolved to hex using a built-in `COLOR_HEX_MAP` with ~600+ entries, including 12 manual overrides from the reference repo (e.g., `bloodred` → `#980002`, `oceanblue` → `#009DC4`)

### Colorfle Logic

- **Algorithm**: `seedrandom("{mode} {day} {month} {year}")` → pick N colors from a 20-color palette without replacement
- **Rollover**: 15:00 UTC (midnight JST)
- **Answer type**: 3 source colors with weights that mix to a target color
- **Color mixing**: Dual-space average — computes the mix in both YCC and RGB color spaces, then averages the results for perceptually accurate blending
- **Modes**: Mode 0 = 3 blocks (weights: `[0.5, 0.34, 0.16]`), Mode 1 = 4 blocks (weights: `[0.4, 0.3, 0.2, 0.1]`)
- **Palette**: 20 fixed colors (White, Light Yellow, Pink, Light Green, Lavender, Cyan, Yellow, Lime, Orange, Green, Magenta, Olive, Teal, Brown, Red, Blue, Purple, Maroon, Navy, Black)

---

## API Endpoints

### Health Check

#### `GET /` or `GET /health`

Health check and endpoint listing.

```bash
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/health
```

```json
{
  "status": "ok",
  "service": "colordleanswer-api",
  "version": "1.0.0",
  "endpoints": ["GET /api/today", "GET /api/colordle/today", "..."],
  "today": "2025-05-20"
}
```

---

### Today's Answers

#### `GET /api/today`

Get today's answers for **both** games in a single request.

```bash
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/api/today
```

```json
{
  "success": true,
  "date": "2025-05-20",
  "colordle": {
    "date": "2025-05-20",
    "dayNumber": 1151,
    "colorName": "Night Sky",
    "colorHex": "#292b31",
    "formattedDate": "May 20, 2025"
  },
  "colorfle": {
    "date": "2025-05-20",
    "puzzleNumber": 1122,
    "mode": 0,
    "colors": [
      { "index": 3, "name": "Light Green", "hex": "#AAFFC3", "weight": 0.5 },
      { "index": 7, "name": "Lime", "hex": "#BCF60C", "weight": 0.34 },
      { "index": 15, "name": "Blue", "hex": "#4363D8", "weight": 0.16 }
    ],
    "targetColor": {
      "rgb": { "r": 120, "g": 210, "b": 180 },
      "hex": "#78d2b4"
    },
    "formattedDate": "May 20, 2025"
  }
}
```

#### `GET /api/colordle/today`

Get today's **Colordle** answer only.

```bash
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/api/colordle/today
```

```json
{
  "success": true,
  "date": "2025-05-20",
  "dayNumber": 1151,
  "colorName": "Night Sky",
  "colorHex": "#292b31",
  "formattedDate": "May 20, 2025"
}
```

#### `GET /api/colorfle/today`

Get today's **Colorfle** answer only.

```bash
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/api/colorfle/today
```

```json
{
  "success": true,
  "date": "2025-05-20",
  "puzzleNumber": 1122,
  "mode": 0,
  "colors": [
    { "index": 3, "name": "Light Green", "hex": "#AAFFC3", "weight": 0.5 },
    { "index": 7, "name": "Lime", "hex": "#BCF60C", "weight": 0.34 },
    { "index": 15, "name": "Blue", "hex": "#4363D8", "weight": 0.16 }
  ],
  "targetColor": {
    "rgb": { "r": 120, "g": 210, "b": 180 },
    "hex": "#78d2b4"
  },
  "formattedDate": "May 20, 2025"
}
```

---

### Archive

#### `GET /api/colordle/archive?month=YYYY-MM`

Get all Colordle answers for a given month. Dates before `2023-08-07` or after today are automatically excluded.

```bash
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/colordle/archive?month=2025-05"
```

```json
{
  "success": true,
  "month": "2025-05",
  "answers": [
    { "date": "2025-05-01", "dayNumber": 1132, "colorName": "Ruby", "colorHex": "#ca0147", "formattedDate": "May 1, 2025" },
    { "date": "2025-05-02", "dayNumber": 1133, "colorName": "Honey", "colorHex": "#ae8934", "formattedDate": "May 2, 2025" }
  ]
}
```

#### `GET /api/colordle/archive/YYYY-MM-DD`

Get Colordle answer for a specific date. Must be between `2023-08-07` and today.

```bash
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/api/colordle/archive/2024-12-25
```

```json
{
  "success": true,
  "date": "2024-12-25",
  "dayNumber": 1066,
  "colorName": "Emerald",
  "colorHex": "#028f1e",
  "formattedDate": "December 25, 2024"
}
```

#### `GET /api/colorfle/archive?month=YYYY-MM`

Get all Colorfle answers for a given month. Dates before `2022-04-25` or after today are automatically excluded.

```bash
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/colorfle/archive?month=2025-05"
```

#### `GET /api/colorfle/archive/YYYY-MM-DD`

Get Colorfle answer for a specific date. Must be between `2022-04-25` and today.

```bash
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/api/colorfle/archive/2024-12-25
```

---

### Search

#### `GET /api/colordle/search?color=<name>`

Search for dates when a specific color appeared in Colordle. Supports partial matching (case-insensitive, spaces ignored).

```bash
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/colordle/search?color=red"
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/colordle/search?q=night%20sky"
```

```json
{
  "success": true,
  "query": "red",
  "results": [
    { "date": "2025-03-15", "dayNumber": 1085, "colorName": "Red", "colorHex": "#ff0000" },
    { "date": "2025-01-01", "dayNumber": 1041, "colorName": "Bright Red", "colorHex": "#ff000d" }
  ]
}
```

> **Note**: Search only returns results already stored in the D1 database. Run backfill first for comprehensive results.

---

### Statistics

#### `GET /api/stats`

Get database statistics including total answer counts and last update timestamps.

```bash
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/api/stats
```

```json
{
  "success": true,
  "colordle": {
    "totalAnswers": 650,
    "lastUpdate": "2025-05-19T18:30:00Z"
  },
  "colorfle": {
    "totalAnswers": 1132,
    "lastUpdate": "2025-05-19T18:30:00Z"
  },
  "today": "2025-05-20"
}
```

---

### Admin

#### `GET /api/admin/backfill?start=YYYY-MM-DD&end=YYYY-MM-DD&game=both`

Backfill answers for a date range. Computes and stores any missing answers in D1.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `start` | Yes | Start date (YYYY-MM-DD) |
| `end` | Yes | End date (YYYY-MM-DD) |
| `game` | No | `colordle`, `colorfle`, or `both` (default: `both`) |

```bash
# Backfill both games
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/admin/backfill?start=2023-08-07&end=2024-12-31&game=both"

# Backfill Colorfle only
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/admin/backfill?start=2022-04-25&end=2023-04-25&game=colorfle"
```

```json
{
  "success": true,
  "message": "Backfilled 513 colordle and 513 colorfle answers",
  "colordle": 513,
  "colorfle": 513,
  "errors": []
}
```

> **Warning**: Cloudflare Workers have a ~50 subrequest limit per invocation. For large date ranges, break into 3-month batches or use the direct D1 seed method instead.

---

## File Structure

```
worker/
├── src/
│   ├── index.ts            # Main request handler + cron trigger
│   ├── colordle-logic.ts   # Colordle answer computation (976 colors, day offset 500)
│   └── colorfle-logic.ts   # Colorfle answer computation (20 colors, seeded PRNG, YCC+RGB mixing)
├── scripts/
│   ├── generate-seed.mjs   # Standalone seed data generator (no imports, runs with node)
│   └── generate-seed.ts    # TypeScript seed generator (imports from src/)
├── schema.sql              # D1 database schema (3 tables + indexes)
├── seed.sql                # Pre-computed seed data (auto-generated, do not edit manually)
├── wrangler.toml           # Cloudflare Worker configuration
├── package.json            # Dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

---

## Database Schema

### `colordle_answers`

| Column | Type | Description |
|--------|------|-------------|
| `date` | TEXT (PK) | Date in `YYYY-MM-DD` format |
| `day_number` | INTEGER | Puzzle day number (starts at 500) |
| `color_name` | TEXT | Display name (e.g., "Night Sky") |
| `color_hex` | TEXT | Hex code (e.g., "#292b31") |
| `created_at` | TEXT | Record creation timestamp |
| `updated_at` | TEXT | Record update timestamp |

**Index**: `idx_colordle_day` on `day_number`

### `colorfle_answers`

| Column | Type | Description |
|--------|------|-------------|
| `date` | TEXT (PK) | Date in `YYYY-MM-DD` format |
| `puzzle_number` | INTEGER | Puzzle number since launch |
| `mode` | INTEGER | 0 = 3 blocks, 1 = 4 blocks |
| `color_indices` | TEXT (JSON) | Array of color indices (e.g., `[3, 7, 15]`) |
| `color_names` | TEXT (JSON) | Array of color names |
| `color_hexes` | TEXT (JSON) | Array of hex codes |
| `color_weights` | TEXT (JSON) | Array of weights |
| `target_hex` | TEXT | Mixed target hex code |
| `target_rgb` | TEXT (JSON) | RGB object `{"r":120,"g":210,"b":180}` |
| `created_at` | TEXT | Record creation timestamp |
| `updated_at` | TEXT | Record update timestamp |

**Index**: `idx_colorfle_puzzle` on `puzzle_number`

### `metadata`

| Column | Type | Description |
|--------|------|-------------|
| `key` | TEXT (PK) | Metadata key (e.g., `last_cron_run`, `last_seed`) |
| `value` | TEXT | Metadata value |
| `updated_at` | TEXT | Update timestamp |

---

## Deployment Instructions

### Prerequisites

- Node.js 18+
- Wrangler CLI
- Cloudflare account with D1 access

### Step-by-Step

#### 1. Install Wrangler

```bash
npm install -g wrangler
```

#### 2. Login to Cloudflare

```bash
wrangler login
```

#### 3. Create D1 Database

```bash
wrangler d1 create colordleanswer-db
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "colordleanswer-db"
database_id = "YOUR_ACTUAL_DATABASE_ID"
```

#### 4. Apply Schema

```bash
wrangler d1 execute colordleanswer-db --file=schema.sql
```

#### 5. Seed Data

**Option A — Direct D1 execution (recommended for initial seed):**

```bash
# Generate seed SQL (includes all answers from game start to today)
node scripts/generate-seed.mjs > seed.sql

# Execute against D1
wrangler d1 execute colordleanswer-db --file=seed.sql
```

**Option B — API backfill (use 3-month batches):**

```bash
# Colorfle (started 2022-04-25)
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/admin/backfill?start=2022-04-25&end=2023-04-25&game=colorfle"

# Both games from Colordle start (2023-08-07)
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/admin/backfill?start=2023-08-07&end=2023-12-31&game=both"
```

#### 6. Set Secrets

```bash
# GitHub PAT for triggering repository_dispatch
wrangler secret put GITHUB_TOKEN

# GitHub repo name in owner/repo format
wrangler secret put GITHUB_REPO
# Enter: sujitbhai7710/wordsolver.tech-colordle-colorfle
```

#### 7. Deploy

```bash
wrangler deploy
```

### NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `wrangler dev` | Start local dev server on port 8787 |
| `deploy` | `wrangler deploy` | Deploy to Cloudflare |
| `db:create` | `wrangler d1 create colordleanswer-db` | Create D1 database |
| `db:migrate` | `wrangler d1 execute colordleanswer-db --file=./schema.sql` | Apply schema to remote D1 |
| `db:migrate:local` | `wrangler d1 execute colordleanswer-db --local --file=./schema.sql` | Apply schema to local D1 |
| `db:backfill` | `wrangler d1 execute colordleanswer-db --file=./seed.sql` | Seed remote D1 |
| `db:backfill:local` | `wrangler d1 execute colordleanswer-db --local --file=./seed.sql` | Seed local D1 |
| `tail` | `wrangler tail` | View real-time Worker logs |

---

## Environment Variables

Set via `wrangler secret put` or the Cloudflare Dashboard.

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No* | GitHub Personal Access Token with `repo` scope for triggering `repository_dispatch` events |
| `GITHUB_REPO` | No* | GitHub repository in `owner/repo` format (e.g., `sujitbhai7710/wordsolver.tech-colordle-colorfle`) |

\*Required only for automatic GitHub rebuild triggers via cron. If not set, the cron will still compute and store answers, but won't trigger the Astro frontend rebuild.

---

## How the Cron Works

The cron is configured in `wrangler.toml`:

```toml
[triggers]
crons = ["30 18 * * *"]
```

This fires at **18:30 UTC**, which is **12:00 AM IST** (midnight India Standard Time, UTC+5:30).

At each cron invocation, the `scheduled` handler:

1. **Computes today's Colordle answer** using the deterministic algorithm and stores it in D1 (via `INSERT OR REPLACE`)
2. **Computes today's Colorfle answer** using the seeded PRNG and stores it in D1
3. **Updates the metadata table** with `last_cron_run` timestamp
4. **Triggers a GitHub `repository_dispatch` event** (`event_type: "daily_update"`) to rebuild the Astro frontend so the static today page reflects the new answer

If any step fails, the error is logged but does not prevent other steps from executing.

---

## On-Demand Answer Computation

When an API request comes in for a date that hasn't been stored in D1 yet (e.g., an old archive date that wasn't backfilled), the Worker automatically:

1. Computes the answer using the deterministic algorithm
2. Stores it in D1 with `INSERT OR REPLACE` for future requests
3. Returns the answer to the client

This means the full archive works even without prior backfill — answers are lazily computed and cached on first request.

---

## Frontend Integration

The Astro frontend's `ArchiveCalendar.svelte` component and `daily-data.js` module fetch from this API using:

```javascript
const API_BASE = 'https://colordleanswer-api.wordleanswerofficial.workers.dev';
```

### Endpoints used by the frontend

| Frontend Component | API Endpoint | Purpose |
|---|---|---|
| `ArchiveCalendar.svelte` | `GET /api/{game}/archive?month=YYYY-MM` | Fetch monthly batch for calendar display |
| `ArchiveCalendar.svelte` | `GET /api/{game}/archive/YYYY-MM-DD` | Fetch single date answer |
| Today page | `GET /api/today` | Fetch both game answers |
| Daily data module | `GET /api/colordle/today` / `GET /api/colorfle/today` | Fetch individual game answers |

To change the API URL, update the `API_BASE` constant in those frontend files.

---

## Local Development

```bash
# Install dependencies
npm install

# Create local D1 database and apply schema
wrangler d1 execute colordleanswer-db --local --file=./schema.sql

# Backfill local database
node scripts/generate-seed.mjs > seed.sql
wrangler d1 execute colordleanswer-db --local --file=./seed.sql

# Start dev server (available at http://localhost:8787)
wrangler dev
```

---

## Monitoring

```bash
# View real-time Worker logs
wrangler tail

# Check database stats
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/api/stats

# Quick health check
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/health
```

---

## Notes

- **Colordle answers** are deterministic based on a 976-color list indexed by day number. The list is sourced from `colordle.ryantanen.com/colors.json` and stored statically in `colordle-logic.ts`.
- **Colorfle answers** use a seeded PRNG (a minimal implementation of the Alea/xorshift algorithm matching `seedrandom` behavior) with YCC+RGB dual-space color mixing for perceptually accurate color blending.
- **The Worker computes answers on-the-fly** if not in D1, then caches them. This means the API always returns a valid answer even for dates that haven't been backfilled.
- **Colordle rolls over at 16:30 UTC** — after 16:30 UTC, the next day's puzzle becomes the "current" one.
- **Colorfle rolls over at 15:00 UTC** — after 15:00 UTC, the next day's puzzle becomes the "current" one.
- **CORS** is fully configured with `Access-Control-Allow-Origin: *` and preflight support, allowing cross-origin requests from any frontend.
- **Cache headers** on successful responses: `Cache-Control: public, max-age=300, s-maxage=600` (5 min browser cache, 10 min CDN cache).
- **Error responses** return `Cache-Control: no-cache` to avoid caching failures.

---

## Troubleshooting

### "Not Found" errors on API endpoints

1. Verify the Worker is deployed: `wrangler deployments list`
2. Check the D1 binding is correct in `wrangler.toml`
3. Ensure the `database_id` matches your actual D1 database

### Backfill fails or times out

Cloudflare Workers have a ~50 subrequest limit per invocation. Break large date ranges into smaller batches:

```bash
# Batch backfill in 3-month chunks
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/admin/backfill?start=2022-04-25&end=2022-07-25&game=colorfle"
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/admin/backfill?start=2022-07-26&end=2022-10-26&game=colorfle"
# Continue with more batches...
```

Or use direct D1 execution (no subrequest limits):

```bash
node scripts/generate-seed.mjs > seed.sql
wrangler d1 execute colordleanswer-db --file=seed.sql
```

### Cron not running

1. Verify the cron schedule in `wrangler.toml`: `crons = ["30 18 * * *"]`
2. Ensure the Worker is deployed with the cron trigger: `wrangler deploy`
3. Check logs during the scheduled time: `wrangler tail`

### GitHub rebuild not triggering

1. Verify `GITHUB_TOKEN` and `GITHUB_REPO` secrets are set: check in Cloudflare Dashboard → Worker → Settings → Variables
2. Ensure the token has `repo` scope for `repository_dispatch` permission
3. Check the `last_cron_run` value in the metadata table via `/api/stats`

---

## License

Private — for colordleanswer.me use only.
