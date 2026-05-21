// Cloudflare Worker for colordleanswer.me API
// Serves Colordle and Colorfle daily puzzle answers from D1 SQL database

import { getPuzzleDateKeyForGame } from '../../src/lib/puzzle-window.ts';
import { getColordleAnswer, getLatestAvailableColordleDate } from './colordle-logic';
import { getColorfleAnswer } from './colorfle-logic';

interface Env {
  DB: D1Database;
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

type ColordleAnswer = Awaited<ReturnType<typeof getColordleAnswer>>;
type ColorfleAnswer = ReturnType<typeof getColorfleAnswer>;

function jsonResponse(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
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

function errorResponse(message: string, status = 400, extraData: Record<string, unknown> = {}): Response {
  return jsonResponse({ error: message, success: false, ...extraData }, status);
}

function getSettledError(result: PromiseSettledResult<unknown>): unknown {
  return result.status === 'rejected' ? result.reason : null;
}

const COLORDLE_MIN_DATE = '2023-08-07';
const COLORFLE_MIN_DATE = '2022-04-25';

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !Number.isNaN(new Date(`${dateStr}T12:00:00Z`).getTime());
}

function normalizeColordleDbAnswer(existing: Record<string, unknown>) {
  const date = existing.date as string;
  const formattedDate = new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  return {
    date,
    dayNumber: existing.day_number as number,
    colorName: existing.color_name as string,
    colorHex: existing.color_hex as string,
    formattedDate,
  };
}

function colordleAnswersMatch(
  existing: ReturnType<typeof normalizeColordleDbAnswer>,
  expected: NonNullable<ColordleAnswer>
): boolean {
  return (
    existing.date === expected.date &&
    existing.dayNumber === expected.dayNumber &&
    existing.colorName === expected.colorName &&
    existing.colorHex.toLowerCase() === expected.colorHex.toLowerCase()
  );
}

async function ensureColordleAnswer(db: D1Database, dateStr: string): Promise<NonNullable<ColordleAnswer> | null> {
  const [existing, expected] = await Promise.all([
    db
      .prepare('SELECT date, day_number, color_name, color_hex FROM colordle_answers WHERE date = ?')
      .bind(dateStr)
      .first<Record<string, unknown>>(),
    getColordleAnswer(dateStr),
  ]);

  if (!expected) {
    if (existing) {
      await db.prepare('DELETE FROM colordle_answers WHERE date = ?').bind(dateStr).run();
    }
    return null;
  }

  if (existing) {
    const normalized = normalizeColordleDbAnswer(existing);
    if (colordleAnswersMatch(normalized, expected)) {
      return normalized;
    }
  }

  await db
    .prepare(
      'INSERT OR REPLACE INTO colordle_answers (date, day_number, color_name, color_hex, updated_at) VALUES (?, ?, ?, ?, datetime(\'now\'))'
    )
    .bind(expected.date, expected.dayNumber, expected.colorName, expected.colorHex)
    .run();

  return expected;
}

function normalizeColorfleDbAnswer(existing: Record<string, unknown>) {
  const colorIndices = JSON.parse(existing.color_indices as string) as number[];
  const colorNames = JSON.parse(existing.color_names as string) as string[];
  const colorHexes = JSON.parse(existing.color_hexes as string) as string[];
  const colorWeights = JSON.parse(existing.color_weights as string) as number[];
  const targetRgb = JSON.parse(existing.target_rgb as string) as { r: number; g: number; b: number };
  const date = existing.date as string;

  return {
    date,
    puzzleNumber: existing.puzzle_number as number,
    mode: existing.mode as number,
    colors: colorIndices.map((idx, index) => ({
      index: idx,
      name: colorNames[index],
      hex: colorHexes[index],
      weight: colorWeights[index],
    })),
    targetColor: {
      rgb: targetRgb,
      hex: existing.target_hex as string,
    },
    formattedDate: new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  };
}

function colorfleAnswersMatch(
  existing: ReturnType<typeof normalizeColorfleDbAnswer>,
  expected: ColorfleAnswer
): boolean {
  if (
    existing.date !== expected.date ||
    existing.puzzleNumber !== expected.puzzleNumber ||
    existing.mode !== expected.mode ||
    existing.targetColor.hex.toLowerCase() !== expected.targetColor.hex.toLowerCase() ||
    existing.colors.length !== expected.colors.length
  ) {
    return false;
  }

  return existing.colors.every((color, index) => {
    const expectedColor = expected.colors[index];
    return (
      color.index === expectedColor.index &&
      color.name === expectedColor.name &&
      color.hex.toLowerCase() === expectedColor.hex.toLowerCase() &&
      Math.abs(color.weight - expectedColor.weight) < 1e-9
    );
  });
}

async function ensureColorfleAnswer(db: D1Database, dateStr: string, mode = 0): Promise<ColorfleAnswer> {
  const expected = getColorfleAnswer(dateStr, mode);
  const existing = await db
    .prepare('SELECT * FROM colorfle_answers WHERE date = ? AND mode = ?')
    .bind(dateStr, mode)
    .first<Record<string, unknown>>();

  if (existing) {
    const normalized = normalizeColorfleDbAnswer(existing);
    if (colorfleAnswersMatch(normalized, expected)) {
      return normalized;
    }
  }

  await db
    .prepare(
      `INSERT OR REPLACE INTO colorfle_answers
       (date, puzzle_number, mode, color_indices, color_names, color_hexes, color_weights, target_hex, target_rgb, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
    )
    .bind(
      expected.date,
      expected.puzzleNumber,
      expected.mode,
      JSON.stringify(expected.colors.map((color) => color.index)),
      JSON.stringify(expected.colors.map((color) => color.name)),
      JSON.stringify(expected.colors.map((color) => color.hex)),
      JSON.stringify(expected.colors.map((color) => color.weight)),
      expected.targetColor.hex,
      JSON.stringify(expected.targetColor.rgb)
    )
    .run();

  return expected;
}

async function buildColordleUnavailableResponse(dateStr: string, status = 503): Promise<Response> {
  const latestAvailableDate = await getLatestAvailableColordleDate();
  return errorResponse(`No verified Colordle answer is available yet for ${dateStr}.`, status, {
    requestedDate: dateStr,
    availableThroughDate: latestAvailableDate,
  });
}

async function triggerGitHubRebuild(
  env: Env,
  targetDates: { colordle: string; colorfle: string }
): Promise<boolean> {
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    console.log('GitHub token or repo not configured, skipping rebuild trigger');
    return false;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${env.GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'colordleanswer-api',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'pages-publish-requested',
        client_payload: {
          group: 'site',
          source: 'worker-cron',
          target_date:
            targetDates.colordle === targetDates.colorfle ? targetDates.colordle : targetDates.colorfle,
          target_dates: targetDates,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (response.status === 204 || response.status === 200) {
      console.log(`GitHub rebuild trigger response: ${response.status}`);
      return true;
    }

    const body = await response.text().catch(() => '');
    console.error(`GitHub rebuild trigger failed with status ${response.status}${body ? `: ${body}` : ''}`);
    return false;
  } catch (error) {
    console.error('Failed to trigger GitHub rebuild:', error);
    return false;
  }
}

async function handleToday(env: Env): Promise<Response> {
  const colordleDate = getPuzzleDateKeyForGame('colordle');
  const colorfleDate = getPuzzleDateKeyForGame('colorfle');

  const [colordle, colorfle] = await Promise.all([
    ensureColordleAnswer(env.DB, colordleDate),
    ensureColorfleAnswer(env.DB, colorfleDate),
  ]);

  return jsonResponse({
    success: true,
    ...(colordleDate === colorfleDate ? { date: colordleDate } : {}),
    dates: {
      colordle: colordleDate,
      colorfle: colorfleDate,
    },
    colordle,
    colorfle,
  });
}

async function handleColordleToday(env: Env): Promise<Response> {
  const today = getPuzzleDateKeyForGame('colordle');
  const answer = await ensureColordleAnswer(env.DB, today);

  if (!answer) {
    return buildColordleUnavailableResponse(today);
  }

  return jsonResponse({ success: true, ...answer });
}

async function handleColorfleToday(env: Env): Promise<Response> {
  const today = getPuzzleDateKeyForGame('colorfle');
  const answer = await ensureColorfleAnswer(env.DB, today);
  return jsonResponse({ success: true, ...answer });
}

async function handleColordleArchive(env: Env, dateStr: string): Promise<Response> {
  if (!isValidDate(dateStr)) {
    return errorResponse('Invalid date format. Use YYYY-MM-DD');
  }

  const maxDate = getPuzzleDateKeyForGame('colordle');
  if (dateStr < COLORDLE_MIN_DATE || dateStr > maxDate) {
    return errorResponse(`Date must be between ${COLORDLE_MIN_DATE} and ${maxDate}`);
  }

  const answer = await ensureColordleAnswer(env.DB, dateStr);
  if (!answer) {
    return buildColordleUnavailableResponse(dateStr);
  }

  return jsonResponse({ success: true, ...answer });
}

async function handleColorfleArchive(env: Env, dateStr: string): Promise<Response> {
  if (!isValidDate(dateStr)) {
    return errorResponse('Invalid date format. Use YYYY-MM-DD');
  }

  const maxDate = getPuzzleDateKeyForGame('colorfle');
  if (dateStr < COLORFLE_MIN_DATE || dateStr > maxDate) {
    return errorResponse(`Date must be between ${COLORFLE_MIN_DATE} and ${maxDate}`);
  }

  const answer = await ensureColorfleAnswer(env.DB, dateStr);
  return jsonResponse({ success: true, ...answer });
}

async function handleColordleMonthArchive(env: Env, monthStr: string): Promise<Response> {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) {
    return errorResponse('Invalid month format. Use YYYY-MM');
  }

  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const maxDate = getPuzzleDateKeyForGame('colordle');

  const answers: NonNullable<ColordleAnswer>[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr < COLORDLE_MIN_DATE || dateStr > maxDate) {
      continue;
    }

    const answer = await ensureColordleAnswer(env.DB, dateStr);
    if (answer) {
      answers.push(answer);
    }
  }

  return jsonResponse({
    success: true,
    month: monthStr,
    answers,
  });
}

async function handleColorfleMonthArchive(env: Env, monthStr: string): Promise<Response> {
  if (!/^\d{4}-\d{2}$/.test(monthStr)) {
    return errorResponse('Invalid month format. Use YYYY-MM');
  }

  const [year, month] = monthStr.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const maxDate = getPuzzleDateKeyForGame('colorfle');

  const answers: ColorfleAnswer[] = [];
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateStr < COLORFLE_MIN_DATE || dateStr > maxDate) {
      continue;
    }

    const answer = await ensureColorfleAnswer(env.DB, dateStr);
    answers.push(answer);
  }

  return jsonResponse({
    success: true,
    month: monthStr,
    answers,
  });
}

async function handleColordleColorSearch(env: Env, query: string): Promise<Response> {
  const normalizedQuery = query.toLowerCase().replace(/ /g, '');

  const results = await env.DB.prepare(
    "SELECT date, day_number, color_name, color_hex FROM colordle_answers WHERE LOWER(REPLACE(color_name, ' ', '')) LIKE ? ORDER BY date DESC LIMIT 50"
  )
    .bind(`%${normalizedQuery}%`)
    .all();

  return jsonResponse({
    success: true,
    query,
    results: results.results.map((row: Record<string, unknown>) => ({
      date: row.date,
      dayNumber: row.day_number,
      colorName: row.color_name,
      colorHex: row.color_hex,
    })),
  });
}

async function handleStats(env: Env): Promise<Response> {
  const [colordleCount, colorfleCount, lastColordleUpdate, lastColorfleUpdate] = await Promise.all([
    env.DB.prepare('SELECT COUNT(*) as count FROM colordle_answers').first<Record<string, unknown>>(),
    env.DB.prepare('SELECT COUNT(*) as count FROM colorfle_answers').first<Record<string, unknown>>(),
    env.DB.prepare('SELECT MAX(updated_at) as last_update FROM colordle_answers').first<Record<string, unknown>>(),
    env.DB.prepare('SELECT MAX(updated_at) as last_update FROM colorfle_answers').first<Record<string, unknown>>(),
  ]);

  return jsonResponse({
    success: true,
    colordle: {
      totalAnswers: (colordleCount?.count as number) || 0,
      lastUpdate: (lastColordleUpdate?.last_update as string) || null,
    },
    colorfle: {
      totalAnswers: (colorfleCount?.count as number) || 0,
      lastUpdate: (lastColorfleUpdate?.last_update as string) || null,
    },
    today: {
      colordle: getPuzzleDateKeyForGame('colordle'),
      colorfle: getPuzzleDateKeyForGame('colorfle'),
    },
  });
}

async function handleBackfill(env: Env, url: URL): Promise<Response> {
  const startStr = url.searchParams.get('start');
  const endStr = url.searchParams.get('end');
  const game = url.searchParams.get('game') || 'both';

  if (!startStr || !endStr) {
    return errorResponse('Missing start or end date parameters. Use ?start=YYYY-MM-DD&end=YYYY-MM-DD');
  }

  if (!isValidDate(startStr) || !isValidDate(endStr)) {
    return errorResponse('Invalid date format. Use YYYY-MM-DD');
  }

  const startDate = new Date(`${startStr}T12:00:00Z`);
  const endDate = new Date(`${endStr}T12:00:00Z`);
  const colordleToday = getPuzzleDateKeyForGame('colordle');
  const colorfleToday = getPuzzleDateKeyForGame('colorfle');

  if (startDate > endDate) {
    return errorResponse('Start date must be before end date');
  }

  const results = { colordle: 0, colorfle: 0, errors: [] as string[] };

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().slice(0, 10);

    try {
      if ((game === 'both' || game === 'colordle') && dateStr >= COLORDLE_MIN_DATE && dateStr <= colordleToday) {
        const answer = await ensureColordleAnswer(env.DB, dateStr);
        if (answer) {
          results.colordle += 1;
        } else {
          results.errors.push(`${dateStr}: No verified Colordle answer is available yet.`);
        }
      }

      if ((game === 'both' || game === 'colorfle') && dateStr >= COLORFLE_MIN_DATE && dateStr <= colorfleToday) {
        await ensureColorfleAnswer(env.DB, dateStr);
        results.colorfle += 1;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.errors.push(`${dateStr}: ${message}`);
    }

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return jsonResponse({
    success: true,
    message: `Backfilled ${results.colordle} colordle and ${results.colorfle} colorfle answers`,
    ...results,
  });
}

async function handleClear(env: Env, url: URL): Promise<Response> {
  const game = url.searchParams.get('game') || 'both';
  const confirm = url.searchParams.get('confirm');

  if (confirm !== 'yes') {
    return errorResponse('Add ?confirm=yes to confirm database clear. This action is irreversible.');
  }

  const results = { colordle: 0, colorfle: 0 };

  try {
    if (game === 'both' || game === 'colordle') {
      const result = await env.DB.prepare('DELETE FROM colordle_answers').run();
      results.colordle = result.meta?.changes || 0;
    }
    if (game === 'both' || game === 'colorfle') {
      const result = await env.DB.prepare('DELETE FROM colorfle_answers').run();
      results.colorfle = result.meta?.changes || 0;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return errorResponse(`Failed to clear database: ${message}`, 500);
  }

  return jsonResponse({
    success: true,
    message: `Cleared ${results.colordle} colordle and ${results.colorfle} colorfle answers`,
    ...results,
  });
}

async function handleCron(env: Env): Promise<void> {
  console.log('Running cron job at', new Date().toISOString());

  const targetDates = {
    colordle: getPuzzleDateKeyForGame('colordle'),
    colorfle: getPuzzleDateKeyForGame('colorfle'),
  };
  console.log('Target dates:', targetDates);

  const storedAnswers = await Promise.allSettled([
    ensureColordleAnswer(env.DB, targetDates.colordle),
    ensureColorfleAnswer(env.DB, targetDates.colorfle),
  ]);

  const colordleStored = storedAnswers[0].status === 'fulfilled' && Boolean(storedAnswers[0].value);
  const colorfleStored = storedAnswers[1].status === 'fulfilled' && Boolean(storedAnswers[1].value);

  if (colordleStored) {
    console.log('Colordle answer for', targetDates.colordle, 'ensured in DB');
  } else {
    console.error('Failed to ensure colordle answer:', getSettledError(storedAnswers[0]));
  }

  if (colorfleStored) {
    console.log('Colorfle answer for', targetDates.colorfle, 'ensured in DB');
  } else {
    console.error('Failed to ensure colorfle answer:', getSettledError(storedAnswers[1]));
  }

  try {
    const nowIso = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare(
        'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))'
      ).bind('last_cron_run', nowIso),
      env.DB.prepare(
        'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))'
      ).bind('last_cron_colordle_date', targetDates.colordle),
      env.DB.prepare(
        'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))'
      ).bind('last_cron_colorfle_date', targetDates.colorfle),
      env.DB.prepare(
        'INSERT OR REPLACE INTO metadata (key, value, updated_at) VALUES (?, ?, datetime(\'now\'))'
      ).bind('last_cron_status', colordleStored && colorfleStored ? 'stored' : 'store_failed'),
    ]);
  } catch (error) {
    console.error('Failed to update metadata:', error);
  }

  if (!colordleStored || !colorfleStored) {
    console.log('Skipping GitHub rebuild because at least one daily answer failed to persist.');
    return;
  }

  try {
    const rebuildTriggered = await triggerGitHubRebuild(env, targetDates);
    console.log('GitHub rebuild triggered:', rebuildTriggered);
  } catch (error) {
    console.error('Failed to trigger GitHub rebuild:', error);
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (request.method !== 'GET' && !path.startsWith('/api/admin')) {
      return errorResponse('Method not allowed', 405);
    }

    try {
      if (path === '/api/today') {
        return await handleToday(env);
      }

      if (path === '/api/colordle/today') {
        return await handleColordleToday(env);
      }

      if (path === '/api/colorfle/today') {
        return await handleColorfleToday(env);
      }

      if (path === '/api/colordle/archive') {
        const month = url.searchParams.get('month');
        if (month) {
          return await handleColordleMonthArchive(env, month);
        }
        return errorResponse('Missing month parameter. Use ?month=YYYY-MM');
      }

      if (path === '/api/colorfle/archive') {
        const month = url.searchParams.get('month');
        if (month) {
          return await handleColorfleMonthArchive(env, month);
        }
        return errorResponse('Missing month parameter. Use ?month=YYYY-MM');
      }

      const colordleDateMatch = path.match(/^\/api\/colordle\/archive\/(\d{4}-\d{2}-\d{2})$/);
      if (colordleDateMatch) {
        return await handleColordleArchive(env, colordleDateMatch[1]);
      }

      const colorfleDateMatch = path.match(/^\/api\/colorfle\/archive\/(\d{4}-\d{2}-\d{2})$/);
      if (colorfleDateMatch) {
        return await handleColorfleArchive(env, colorfleDateMatch[1]);
      }

      if (path === '/api/colordle/search') {
        const color = url.searchParams.get('color') || url.searchParams.get('q');
        if (!color) {
          return errorResponse('Missing color search parameter. Use ?color=name or ?q=name');
        }
        return await handleColordleColorSearch(env, color);
      }

      if (path === '/api/stats') {
        return await handleStats(env);
      }

      if (path === '/api/admin/backfill') {
        return await handleBackfill(env, url);
      }

      if (path === '/api/admin/clear') {
        return await handleClear(env, url);
      }

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
            'GET /api/admin/clear?confirm=yes&game=both',
          ],
          today: {
            colordle: getPuzzleDateKeyForGame('colordle'),
            colorfle: getPuzzleDateKeyForGame('colorfle'),
          },
        });
      }

      return errorResponse('Not found', 404);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Unhandled error:', error);
      return errorResponse(`Internal server error: ${message}`, 500);
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleCron(env));
  },
};
