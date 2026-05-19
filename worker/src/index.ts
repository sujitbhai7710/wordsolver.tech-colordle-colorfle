// Cloudflare Worker for colordleanswer.me API
// Serves Colordle and Colorfle daily puzzle answers from D1 SQL database

import { getColordleAnswer, getTodayIST, getColordleColorHex, getColordleDisplayName, COLORDLE_COLORS, COLORDLE_START_DATE } from './colordle-logic';
import { getColorfleAnswer, COLORS, COLOR_NAMES, WEIGHTS } from './colorfle-logic';

interface Env {
  DB: D1Database;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
}

// CORS headers for all API responses
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: any, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': status === 200 ? 'public, max-age=300, s-maxage=600' : 'no-cache',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message, success: false }, status);
}

// Colordle started on 2023-08-07, Colorfle started on 2022-04-25
const COLORDLE_MIN_DATE = '2023-08-07';
const COLORFLE_MIN_DATE = '2022-04-25';

// Validate date format YYYY-MM-DD
function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr + 'T12:00:00Z').getTime());
}

// Get date for N days ago/from now
function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Ensure a colordle answer exists in DB, compute if missing
async function ensureColordleAnswer(db: D1Database, dateStr: string): Promise<any> {
  // Check DB first
  const existing = await db.prepare(
    'SELECT date, day_number, color_name, color_hex FROM colordle_answers WHERE date = ?'
  ).bind(dateStr).first();

  if (existing) {
    const date = new Date(dateStr + 'T12:00:00Z');
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    });
    return {
      date: existing.date as string,
      dayNumber: existing.day_number as number,
      colorName: existing.color_name as string,
      colorHex: existing.color_hex as string,
      formattedDate
    };
  }

  // Compute and store
  const answer = getColordleAnswer(dateStr);
  await db.prepare(
    'INSERT OR REPLACE INTO colordle_answers (date, day_number, color_name, color_hex, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
  ).bind(answer.date, answer.dayNumber, answer.colorName, answer.colorHex).run();

  return answer;
}

// Ensure a colorfle answer exists in DB, compute if missing
async function ensureColorfleAnswer(db: D1Database, dateStr: string, mode = 0): Promise<any> {
  // Check DB first
  const existing = await db.prepare(
    'SELECT * FROM colorfle_answers WHERE date = ? AND mode = ?'
  ).bind(dateStr, mode).first();

  if (existing) {
    const date = new Date(dateStr + 'T12:00:00Z');
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
    });
    return {
      date: existing.date as string,
      puzzleNumber: existing.puzzle_number as number,
      mode: existing.mode as number,
      colors: JSON.parse(existing.color_indices as string).map((idx: number, i: number) => ({
        index: idx,
        name: JSON.parse(existing.color_names as string)[i],
        hex: JSON.parse(existing.color_hexes as string)[i],
        weight: JSON.parse(existing.color_weights as string)[i],
      })),
      targetColor: {
        rgb: JSON.parse(existing.target_rgb as string),
        hex: existing.target_hex as string,
      },
      formattedDate
    };
  }

  // Compute and store
  const answer = getColorfleAnswer(dateStr, mode);
  await db.prepare(
    `INSERT OR REPLACE INTO colorfle_answers 
     (date, puzzle_number, mode, color_indices, color_names, color_hexes, color_weights, target_hex, target_rgb, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).bind(
    answer.date,
    answer.puzzleNumber,
    answer.mode,
    JSON.stringify(answer.colors.map(c => c.index)),
    JSON.stringify(answer.colors.map(c => c.name)),
    JSON.stringify(answer.colors.map(c => c.hex)),
    JSON.stringify(answer.colors.map(c => c.weight)),
    answer.targetColor.hex,
    JSON.stringify(answer.targetColor.rgb)
  ).run();

  return answer;
}

// Trigger GitHub Actions rebuild
async function triggerGitHubRebuild(env: Env): Promise<boolean> {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    console.log('GitHub token or repo not configured, skipping rebuild trigger');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'colordleanswer-api',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'daily_update',
          client_payload: {
            date: getTodayIST(),
            timestamp: new Date().toISOString(),
          }
        }),
      }
    );
    console.log(`GitHub rebuild trigger response: ${response.status}`);
    return response.status === 204 || response.status === 200;
  } catch (error) {
    console.error('Failed to trigger GitHub rebuild:', error);
    return false;
  }
}

// ============================================
// Route handlers
// ============================================

// GET /api/today - Get today's answers for both games
async function handleToday(env: Env): Promise<Response> {
  const today = getTodayIST();
  
  const [colordle, colorfle] = await Promise.all([
    ensureColordleAnswer(env.DB, today),
    ensureColorfleAnswer(env.DB, today),
  ]);

  return jsonResponse({
    success: true,
    date: today,
    colordle,
    colorfle,
  });
}

// GET /api/colordle/today - Get today's Colordle answer
async function handleColordleToday(env: Env): Promise<Response> {
  const today = getTodayIST();
  const answer = await ensureColordleAnswer(env.DB, today);
  return jsonResponse({ success: true, ...answer });
}

// GET /api/colorfle/today - Get today's Colorfle answer
async function handleColorfleToday(env: Env): Promise<Response> {
  const today = getTodayIST();
  const answer = await ensureColorfleAnswer(env.DB, today);
  return jsonResponse({ success: true, ...answer });
}

// GET /api/colordle/archive/:date - Get Colordle answer for a specific date
async function handleColordleArchive(env: Env, dateStr: string): Promise<Response> {
  if (!isValidDate(dateStr)) {
    return errorResponse('Invalid date format. Use YYYY-MM-DD');
  }

  // Check date range - Colordle started 2023-08-07
  const maxDate = getTodayIST();
  if (dateStr < COLORDLE_MIN_DATE || dateStr > maxDate) {
    return errorResponse(`Date must be between ${COLORDLE_MIN_DATE} and ${maxDate}`);
  }

  const answer = await ensureColordleAnswer(env.DB, dateStr);
  return jsonResponse({ success: true, ...answer });
}

// GET /api/colorfle/archive/:date - Get Colorfle answer for a specific date
async function handleColorfleArchive(env: Env, dateStr: string): Promise<Response> {
  if (!isValidDate(dateStr)) {
    return errorResponse('Invalid date format. Use YYYY-MM-DD');
  }

  const maxDate = getTodayIST();
  if (dateStr < COLORFLE_MIN_DATE || dateStr > maxDate) {
    return errorResponse(`Date must be between ${COLORFLE_MIN_DATE} and ${maxDate}`);
  }

  const answer = await ensureColorfleAnswer(env.DB, dateStr);
  return jsonResponse({ success: true, ...answer });
}

// GET /api/colordle/archive?month=YYYY-MM - Get Colordle answers for a month
async function handleColordleMonthArchive(env: Env, monthStr: string): Promise<Response> {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) {
    return errorResponse('Invalid month format. Use YYYY-MM');
  }

  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = getTodayIST();

  const answers = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dateStr < COLORDLE_MIN_DATE || dateStr > today) continue;
    const answer = await ensureColordleAnswer(env.DB, dateStr);
    answers.push(answer);
  }

  return jsonResponse({
    success: true,
    month: monthStr,
    answers,
  });
}

// GET /api/colorfle/archive?month=YYYY-MM - Get Colorfle answers for a month
async function handleColorfleMonthArchive(env: Env, monthStr: string): Promise<Response> {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) {
    return errorResponse('Invalid month format. Use YYYY-MM');
  }

  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = getTodayIST();

  const answers = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dateStr < COLORFLE_MIN_DATE || dateStr > today) continue;
    const answer = await ensureColorfleAnswer(env.DB, dateStr);
    answers.push(answer);
  }

  return jsonResponse({
    success: true,
    month: monthStr,
    answers,
  });
}

// GET /api/colordle/search?color=hex - Search for dates when a color appeared
async function handleColordleColorSearch(env: Env, query: string): Promise<Response> {
  const normalizedQuery = query.toLowerCase().replace(/ /g, '');
  
  // Search in DB first
  const results = await env.DB.prepare(
    "SELECT date, day_number, color_name, color_hex FROM colordle_answers WHERE LOWER(REPLACE(color_name, ' ', '')) LIKE ? ORDER BY date DESC LIMIT 50"
  ).bind(`%${normalizedQuery}%`).all();

  return jsonResponse({
    success: true,
    query,
    results: results.results.map((r: any) => ({
      date: r.date,
      dayNumber: r.day_number,
      colorName: r.color_name,
      colorHex: r.color_hex,
    })),
  });
}

// GET /api/stats - Get statistics
async function handleStats(env: Env): Promise<Response> {
  const [colordleCount, colorfleCount, lastColordleUpdate, lastColorfleUpdate] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as count FROM colordle_answers').first(),
    env.DB.prepare('SELECT COUNT(*) as count FROM colorfle_answers').first(),
    env.DB.prepare('SELECT MAX(updated_at) as last_update FROM colordle_answers').first(),
    env.DB.prepare('SELECT MAX(updated_at) as last_update FROM colorfle_answers').first(),
  ]);

  return jsonResponse({
    success: true,
    colordle: {
      totalAnswers: (colordleCount as any)?.count || 0,
      lastUpdate: (lastColordleUpdate as any)?.last_update || null,
    },
    colorfle: {
      totalAnswers: (colorfleCount as any)?.count || 0,
      lastUpdate: (lastColorfleUpdate as any)?.last_update || null,
    },
    today: getTodayIST(),
  });
}

// POST /api/admin/backfill - Backfill answers for a date range
async function handleBackfill(env: Env, url: URL): Promise<Response> {
  const startStr = url.searchParams.get('start');
  const endStr = url.searchParams.get('end');
  const game = url.searchParams.get('game') || 'both'; // colordle, colorfle, or both

  if (!startStr || !endStr) {
    return errorResponse('Missing start or end date parameters. Use ?start=YYYY-MM-DD&end=YYYY-MM-DD');
  }

  if (!isValidDate(startStr) || !isValidDate(endStr)) {
    return errorResponse('Invalid date format. Use YYYY-MM-DD');
  }

  const startDate = new Date(startStr + 'T12:00:00Z');
  const endDate = new Date(endStr + 'T12:00:00Z');
  const today = getTodayIST();

  if (startDate > endDate) {
    return errorResponse('Start date must be before end date');
  }

  const results = { colordle: 0, colorfle: 0, errors: [] as string[] };

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().slice(0, 10);
    
    if (dateStr <= today) {
      try {
        if ((game === 'both' || game === 'colordle') && dateStr >= COLORDLE_MIN_DATE) {
          await ensureColordleAnswer(env.DB, dateStr);
          results.colordle++;
        }
        if ((game === 'both' || game === 'colorfle') && dateStr >= COLORFLE_MIN_DATE) {
          await ensureColorfleAnswer(env.DB, dateStr);
          results.colorfle++;
        }
      } catch (err: any) {
        results.errors.push(`${dateStr}: ${err.message}`);
      }
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return jsonResponse({
    success: true,
    message: `Backfilled ${results.colordle} colordle and ${results.colorfle} colorfle answers`,
    ...results,
  });
}

// Cron handler - runs daily at 12:00 AM IST (18:30 UTC previous day)
async function handleCron(env: Env): Promise<void> {
  console.log('Running daily cron job at', new Date().toISOString());
  
  const today = getTodayIST();
  console.log('Today (IST):', today);

  // Ensure today's answers are in the DB
  try {
    await ensureColordleAnswer(env.DB, today);
    console.log('Colordle answer for', today, 'ensured in DB');
  } catch (err) {
    console.error('Failed to ensure colordle answer:', err);
  }

  try {
    await ensureColorfleAnswer(env.DB, today);
    console.log('Colorfle answer for', today, 'ensured in DB');
  } catch (err) {
    console.error('Failed to ensure colorfle answer:', err);
  }

  // Update metadata
  try {
    await env.DB.prepare(
      'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))'
    ).bind('last_cron_run', new Date().toISOString()).run();
  } catch (err) {
    console.error('Failed to update metadata:', err);
  }

  // Trigger GitHub rebuild
  try {
    const rebuildTriggered = await triggerGitHubRebuild(env);
    console.log('GitHub rebuild triggered:', rebuildTriggered);
  } catch (err) {
    console.error('Failed to trigger GitHub rebuild:', err);
  }
}

// ============================================
// Main request handler
// ============================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Only allow GET requests (except for admin endpoints)
    if (request.method !== 'GET' && !path.startsWith('/api/admin')) {
      return errorResponse('Method not allowed', 405);
    }

    try {
      // API routes
      if (path === '/api/today') {
        return await handleToday(env);
      }

      if (path === '/api/colordle/today') {
        return await handleColordleToday(env);
      }

      if (path === '/api/colorfle/today') {
        return await handleColorfleToday(env);
      }

      // Colordle archive - month batch
      if (path === '/api/colordle/archive') {
        const month = url.searchParams.get('month');
        if (month) {
          return await handleColordleMonthArchive(env, month);
        }
        return errorResponse('Missing month parameter. Use ?month=YYYY-MM');
      }

      // Colorfle archive - month batch
      if (path === '/api/colorfle/archive') {
        const month = url.searchParams.get('month');
        if (month) {
          return await handleColorfleMonthArchive(env, month);
        }
        return errorResponse('Missing month parameter. Use ?month=YYYY-MM');
      }

      // Colordle archive - specific date
      const colordleDateMatch = path.match(/^\/api\/colordle\/archive\/(\d{4}-\d{2}-\d{2})$/);
      if (colordleDateMatch) {
        return await handleColordleArchive(env, colordleDateMatch[1]);
      }

      // Colorfle archive - specific date
      const colorfleDateMatch = path.match(/^\/api\/colorfle\/archive\/(\d{4}-\d{2}-\d{2})$/);
      if (colorfleDateMatch) {
        return await handleColorfleArchive(env, colorfleDateMatch[1]);
      }

      // Color search
      if (path === '/api/colordle/search') {
        const color = url.searchParams.get('color') || url.searchParams.get('q');
        if (!color) {
          return errorResponse('Missing color search parameter. Use ?color=name or ?q=name');
        }
        return await handleColordleColorSearch(env, color);
      }

      // Stats
      if (path === '/api/stats') {
        return await handleStats(env);
      }

      // Admin: backfill
      if (path === '/api/admin/backfill') {
        return await handleBackfill(env, url);
      }

      // Health check
      if (path === '/health' || path === '/') {
        return jsonResponse({
          status: 'ok',
          service: 'colordleanswer-api',
          version: '1.0.0',
          endpoints: [
            'GET /api/today',
            'GET /api/colordle/today',
            'GET /api/colorfle/today',
            'GET /api/colordle/archive?month=YYYY-MM',
            'GET /api/colordle/archive/YYYY-MM-DD',
            'GET /api/colorfle/archive?month=YYYY-MM',
            'GET /api/colorfle/archive/YYYY-MM-DD',
            'GET /api/colordle/search?color=name',
            'GET /api/stats',
            'GET /api/admin/backfill?start=YYYY-MM-DD&end=YYYY-MM-DD',
          ],
          today: getTodayIST(),
        });
      }

      return errorResponse('Not found', 404);
    } catch (error: any) {
      console.error('Unhandled error:', error);
      return errorResponse(`Internal server error: ${error.message}`, 500);
    }
  },

  // Cron trigger handler
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleCron(env));
  },
};
