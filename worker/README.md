# ColordleAnswer API - Cloudflare Worker with D1 SQL

## Overview

This is the backend API for [colordleanswer.me](https://colordleanswer.me), serving daily puzzle answers for **Colordle** and **Colorfle** games. Built as a Cloudflare Worker with D1 SQL database for high-performance, globally-distributed answer delivery.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Cloudflare Edge                    │
│                                                      │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │   Astro Static   │    │   Cloudflare Worker   │  │
│  │   Site (Pages)   │◄──►│   (This Project)      │  │
│  │                  │    │                        │  │
│  │  - Today pages   │    │  - /api/today          │  │
│  │  - SEO pages     │    │  - /api/colordle/*     │  │
│  │  - Solvers       │    │  - /api/colorfle/*     │  │
│  │  - Archive pages │    │  - /api/stats          │  │
│  │    (fetch from   │    │  - /api/admin/*        │  │
│  │     Worker API)  │    │                        │  │
│  └──────────────────┘    └───────────┬───────────┘  │
│                                      │               │
│                          ┌───────────▼───────────┐   │
│                          │    D1 SQL Database    │   │
│                          │                       │   │
│                          │  - colordle_answers   │   │
│                          │  - colorfle_answers   │   │
│                          │  - metadata           │   │
│                          └───────────────────────┘   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│               Daily Cron (12 AM IST)                 │
│                                                      │
│  1. Compute today's Colordle answer                  │
│  2. Compute today's Colorfle answer                  │
│  3. Store in D1 database                             │
│  4. Trigger GitHub Actions rebuild                   │
│     (for static today page refresh)                  │
└─────────────────────────────────────────────────────┘
```

## API Endpoints

### Today's Answers

| Endpoint | Description |
|----------|-------------|
| `GET /api/today` | Get today's answers for both games |
| `GET /api/colordle/today` | Get today's Colordle answer only |
| `GET /api/colorfle/today` | Get today's Colorfle answer only |

### Archive

| Endpoint | Description |
|----------|-------------|
| `GET /api/colordle/archive?month=YYYY-MM` | Get all Colordle answers for a month |
| `GET /api/colordle/archive/YYYY-MM-DD` | Get Colordle answer for a specific date |
| `GET /api/colorfle/archive?month=YYYY-MM` | Get all Colorfle answers for a month |
| `GET /api/colorfle/archive/YYYY-MM-DD` | Get Colorfle answer for a specific date |

### Search & Stats

| Endpoint | Description |
|----------|-------------|
| `GET /api/colordle/search?color=name` | Search for dates when a color appeared |
| `GET /api/stats` | Get database statistics |

### Admin

| Endpoint | Description |
|----------|-------------|
| `GET /api/admin/backfill?start=YYYY-MM-DD&end=YYYY-MM-DD&game=both` | Backfill answers for a date range |
| `GET /health` | Health check and endpoint listing |

### Response Format

All endpoints return JSON with this structure:

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

## Game Logic

### Colordle

- **Source**: External upstream API at `colordle.ryantanen.com/colors.json`
- **Start date**: April 25, 2022 (day number 500)
- **Algorithm**: Sequential index into color list based on days since start date
- **Rollover**: 16:30 UTC (10:00 PM IST)
- **Answer type**: Named color with hex code (e.g., "Night Sky" → `#292b31`)
- **Color count**: ~973 colors in the canonical list

### Colorfle

- **Source**: Fully deterministic - computed algorithmically using seeded PRNG
- **Start date**: April 25, 2022 at 17:00 UTC
- **Algorithm**: `seedrandom("{mode} {day} {month} {year}")` → pick N colors from 20-color palette
- **Rollover**: 15:00 UTC (midnight JST)
- **Answer type**: 3 source colors with weights that mix to a target color
- **Color mixing**: Dual-space average (YCC + RGB) for perceptually accurate blending
- **Palette**: 20 fixed colors

## Database Schema

### colordle_answers

| Column | Type | Description |
|--------|------|-------------|
| date | TEXT (PK) | YYYY-MM-DD format |
| day_number | INTEGER | Puzzle day number (starts at 500) |
| color_name | TEXT | Display name (e.g., "Night Sky") |
| color_hex | TEXT | Hex code (e.g., "#292b31") |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Record update timestamp |

### colorfle_answers

| Column | Type | Description |
|--------|------|-------------|
| date | TEXT (PK) | YYYY-MM-DD format |
| puzzle_number | INTEGER | Puzzle number since launch |
| mode | INTEGER | 0 = 3 blocks, 1 = 4 blocks |
| color_indices | TEXT (JSON) | Array of color indices |
| color_names | TEXT (JSON) | Array of color names |
| color_hexes | TEXT (JSON) | Array of hex codes |
| color_weights | TEXT (JSON) | Array of weights |
| target_hex | TEXT | Mixed target hex code |
| target_rgb | TEXT (JSON) | RGB object {r,g,b} |
| created_at | TEXT | Record creation timestamp |
| updated_at | TEXT | Record update timestamp |

### metadata

| Column | Type | Description |
|--------|------|-------------|
| key | TEXT (PK) | Metadata key |
| value | TEXT | Metadata value |
| updated_at | TEXT | Update timestamp |

## Setup & Deployment

### Prerequisites

- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account with D1 access

### Step 1: Install Dependencies

```bash
cd worker
npm install
```

### Step 2: Create D1 Database

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

### Step 3: Apply Schema

```bash
wrangler d1 execute colordleanswer-db --file=./schema.sql
```

### Step 4: Backfill Historical Data

Option A - Using the API endpoint (slower, runs on the edge):
```bash
curl "https://colordleanswer-api.wordleanswerofficial.workers.dev/api/admin/backfill?start=2022-04-25&end=2026-05-19"
```

Option B - Using direct D1 execution (faster, recommended for initial seed):
```bash
# Generate seed SQL
npx tsx scripts/generate-seed.ts > seed.sql

# Execute against D1
wrangler d1 execute colordleanswer-db --file=./seed.sql
```

### Step 5: Set Secrets

Set these secrets in the Cloudflare dashboard or via wrangler:

```bash
# GitHub token for triggering rebuilds (needs repo dispatch permission)
wrangler secret put GITHUB_TOKEN

# GitHub repo in owner/repo format
wrangler secret put GITHUB_REPO
# Enter: sujitbhai7710/wordsolver.tech-colordle-colorfle
```

### Step 6: Deploy

```bash
wrangler deploy
```

### Step 7: Configure Custom Domain (Optional)

In Cloudflare Dashboard → Workers → your worker → Settings → Domains & Routes:
- Add `api.colordleanswer.me` or use the default `*.workers.dev` domain

## Cron Job

The Worker runs a cron job daily at **12:00 AM IST (18:30 UTC)** that:

1. Computes today's Colordle answer and stores in D1
2. Computes today's Colorfle answer and stores in D1
3. Triggers a GitHub Actions rebuild of the static Astro site

The cron is configured in `wrangler.toml`:
```toml
[triggers]
crons = ["30 18 * * *"]
```

## On-Demand Answer Computation

When an archive request comes in for a date that hasn't been stored in D1 yet, the Worker automatically:

1. Computes the answer using the deterministic algorithm
2. Stores it in D1 for future requests
3. Returns the answer to the client

This means the archive works even for dates that haven't been backfilled.

## Performance Optimization

- **Edge caching**: API responses include `Cache-Control` headers for CDN caching
- **D1 indexing**: Date and day_number columns are indexed
- **On-demand computation**: Only stores answers when requested, reducing DB size
- **CORS headers**: Pre-configured for cross-origin requests from the Astro site
- **Minimal dependencies**: Pure TypeScript logic, no external npm packages needed at runtime

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | No* | GitHub PAT with repo dispatch permission |
| `GITHUB_REPO` | No* | GitHub repo in `owner/repo` format |

*Required only for automatic GitHub rebuild triggers via cron

## Local Development

```bash
# Install dependencies
npm install

# Create local D1 database
wrangler d1 execute colordleanswer-db --local --file=./schema.sql

# Backfill local database
npx tsx scripts/generate-seed.ts > seed.sql
wrangler d1 execute colordleanswer-db --local --file=./seed.sql

# Run dev server
wrangler dev
```

The local dev server will be available at `http://localhost:8787`.

## Monitoring

```bash
# View real-time logs
wrangler tail

# Check database stats
curl https://colordleanswer-api.wordleanswerofficial.workers.dev/api/stats
```

## File Structure

```
worker/
├── src/
│   ├── index.ts           # Main Worker entry point with all API routes
│   ├── colordle-logic.ts  # Colordle answer computation logic
│   └── colorfle-logic.ts  # Colorfle answer computation logic
├── scripts/
│   └── generate-seed.ts   # Script to generate seed SQL for backfilling
├── schema.sql             # D1 database schema
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── wrangler.toml          # Cloudflare Worker configuration
└── README.md              # This file
```

## Frontend Integration

The Astro frontend (`/home/z/my-project/wordsolver/`) connects to this Worker API through the `ArchiveCalendar.svelte` component. The API base URL is configured in that component:

```javascript
const API_BASE = 'https://colordleanswer-api.wordleanswerofficial.workers.dev';
```

To change the API URL, update this constant in the Svelte component.

## Troubleshooting

### "Not Found" errors on API endpoints

1. Verify the Worker is deployed: `wrangler deployments list`
2. Check the D1 binding is correct in `wrangler.toml`
3. Ensure the database ID matches your actual D1 database

### Backfill fails or times out

For large date ranges, use the direct D1 execution method instead of the API endpoint:
```bash
npx tsx scripts/generate-seed.ts > seed.sql
wrangler d1 execute colordleanswer-db --file=./seed.sql
```

### Cron not running

1. Check the cron schedule in `wrangler.toml`
2. Verify the Worker is deployed with the cron trigger
3. Check logs: `wrangler tail` during the scheduled time

## License

Private - for colordleanswer.me use only
