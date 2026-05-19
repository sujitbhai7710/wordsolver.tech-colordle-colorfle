-- Schema for colordleanswer-db D1 database
-- Stores daily puzzle answers for Colordle and Colorfle
-- Colordle launched: 2023-08-07 (day #500, with dayOffset=500)
-- Colorfle launched: 2022-04-25

-- Colordle answers table
CREATE TABLE IF NOT EXISTS colordle_answers (
  date TEXT PRIMARY KEY,           -- YYYY-MM-DD format
  day_number INTEGER NOT NULL,     -- Puzzle day number (starts at 500)
  color_name TEXT NOT NULL,        -- e.g. "Night Sky"
  color_hex TEXT NOT NULL,         -- e.g. "#292b31"
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Colorfle answers table
CREATE TABLE IF NOT EXISTS colorfle_answers (
  date TEXT PRIMARY KEY,           -- YYYY-MM-DD format
  puzzle_number INTEGER NOT NULL,  -- Puzzle number since launch
  mode INTEGER NOT NULL DEFAULT 0, -- 0 = 3 blocks, 1 = 4 blocks
  color_indices TEXT NOT NULL,     -- JSON array of color indices, e.g. [3,7,15]
  color_names TEXT NOT NULL,       -- JSON array of color names
  color_hexes TEXT NOT NULL,       -- JSON array of hex codes
  color_weights TEXT NOT NULL,     -- JSON array of weights
  target_hex TEXT NOT NULL,        -- Mixed target color hex
  target_rgb TEXT NOT NULL,        -- JSON: {r,g,b}
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_colordle_day ON colordle_answers(day_number);
CREATE INDEX IF NOT EXISTS idx_colorfle_puzzle ON colorfle_answers(puzzle_number);

-- Metadata table for tracking operations
CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);
