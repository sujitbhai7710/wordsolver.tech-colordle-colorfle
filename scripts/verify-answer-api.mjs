import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  getBoundedColordleDailyAnswer,
  getBundledTargetColorNames,
  getColordleBundledLatestDateKey,
  getColordleDayNum,
} from '../src/lib/colordle.js';
import { buildColorfleAnswerPayload } from '../src/lib/colorfle.js';

const DEFAULT_BASE = 'https://colordleanswer-api.wordleanswerofficial.workers.dev';
const COLORDLE_MIN_DATE = '2023-08-07';
const COLORFLE_MIN_DATE = '2022-04-25';
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SAMPLE_COLORDLE_DATES = [
  '2023-08-07',
  '2023-09-19',
  '2023-12-31',
  '2024-02-14',
  '2024-05-25',
  '2024-08-08',
  '2024-11-30',
  '2025-02-17',
  '2025-06-01',
  '2025-09-23',
  '2026-01-15',
  '2026-05-18',
];
const SAMPLE_COLORFLE_DATES = [
  '2022-04-25',
  '2022-08-01',
  '2023-01-15',
  '2023-06-30',
  '2023-11-11',
  '2024-03-05',
  '2024-07-20',
  '2024-12-24',
  '2025-04-09',
  '2025-10-31',
  '2026-02-14',
  '2026-05-22',
];
const COLORDLE_MONTH_SAMPLES = [
  ['2023-08', '2023-08-07'],
  ['2024-02', '2024-02-14'],
  ['2025-09', '2025-09-23'],
  ['2026-05', '2026-05-18'],
];
const COLORFLE_MONTH_SAMPLES = [
  ['2022-04', '2022-04-25'],
  ['2023-11', '2023-11-11'],
  ['2024-12', '2024-12-24'],
  ['2026-05', '2026-05-22'],
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '..', '..');
const mainColordleDataPath = path.join(workspaceRoot, 'wordsolverx-z-ai', 'static', 'colordle_data.json');

const argBase = process.argv
  .slice(2)
  .find((value) => value.startsWith('--base='))
  ?.slice('--base='.length);
const apiBase = normalizeBase(argBase || process.env.ANSWER_API_BASE || process.env.PUBLIC_ANSWER_API_BASE || DEFAULT_BASE);

const mainColordleData = JSON.parse(await readFile(mainColordleDataPath, 'utf8'));
const mainColordleEntries = new Map(mainColordleData.entries.map((entry) => [entry.date, entry]));

const results = [];
let failures = 0;

function normalizeBase(value) {
  return String(value).replace(/\/+$/, '');
}

function normalizeHex(value) {
  return String(value).trim().toLowerCase();
}

function normalizeName(value) {
  return String(value).trim();
}

function parseDateKey(dateKey) {
  if (!DATE_KEY_RE.test(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }
  return new Date(`${dateKey}T12:00:00Z`);
}

function formatDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(dateKey, days) {
  const date = parseDateKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateKey(date);
}

function dayDiff(startKey, endKey) {
  const start = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

function daysInclusive(startKey, endKey) {
  return dayDiff(startKey, endKey) + 1;
}

function dateRangeForMonth(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  const first = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDate = new Date(Date.UTC(year, month, 0, 12, 0, 0));
  return { first, last: formatDateKey(lastDate) };
}

function countAvailableDatesInMonth(monthKey, minDate, maxDate) {
  const { first, last } = dateRangeForMonth(monthKey);
  const start = first > minDate ? first : minDate;
  const end = last < maxDate ? last : maxDate;

  if (start > end) {
    return 0;
  }

  return daysInclusive(start, end);
}

function buildExpectedColordle(dateKey) {
  const mainEntry = mainColordleEntries.get(dateKey) || null;
  const localAnswer = getBoundedColordleDailyAnswer(parseDateKey(dateKey));
  const bundledLatest = getColordleBundledLatestDateKey();

  if (mainEntry === null) {
    if (localAnswer !== null) {
      throw new Error(`Local Colordle bundle still resolves ${dateKey} after main data ends at ${mainColordleData.latestDate}`);
    }
    return null;
  }

  if (localAnswer === null) {
    throw new Error(`Local Colordle bundle is missing ${dateKey} even though main data includes it`);
  }

  if (bundledLatest !== mainColordleData.latestDate) {
    throw new Error(`Bundled Colordle latest date ${bundledLatest} does not match main data ${mainColordleData.latestDate}`);
  }

  if (getBundledTargetColorNames().length !== mainColordleData.entryCount) {
    throw new Error(
      `Bundled Colordle target count ${getBundledTargetColorNames().length} does not match main data ${mainColordleData.entryCount}`
    );
  }

  if (normalizeName(localAnswer.name) !== normalizeName(mainEntry.color.name)) {
    throw new Error(`Local Colordle name mismatch for ${dateKey}: ${localAnswer.name} != ${mainEntry.color.name}`);
  }

  if (normalizeHex(localAnswer.hex) !== normalizeHex(mainEntry.color.hex)) {
    throw new Error(`Local Colordle hex mismatch for ${dateKey}: ${localAnswer.hex} != ${mainEntry.color.hex}`);
  }

  const dayNumber = getColordleDayNum(parseDateKey(dateKey));
  if (dayNumber !== mainEntry.dayNum) {
    throw new Error(`Local Colordle day number mismatch for ${dateKey}: ${dayNumber} != ${mainEntry.dayNum}`);
  }

  return {
    date: dateKey,
    dayNumber,
    colorName: mainEntry.color.name,
    colorHex: mainEntry.color.hex,
  };
}

function buildExpectedColorfle(dateKey) {
  const answer = buildColorfleAnswerPayload(parseDateKey(dateKey), 0);
  return {
    date: dateKey,
    puzzleNumber: answer.puzzleNumber,
    mode: answer.mode,
    colors: answer.colors,
    targetColor: answer.targetColor,
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertColordlePayloadMatches(actual, expected, label) {
  assert(actual && typeof actual === 'object', `${label}: expected object payload`);
  assert(actual.success === true, `${label}: success flag missing`);
  assert(actual.date === expected.date, `${label}: date ${actual.date} != ${expected.date}`);
  assert(actual.dayNumber === expected.dayNumber, `${label}: day number ${actual.dayNumber} != ${expected.dayNumber}`);
  assert(
    normalizeName(actual.colorName) === normalizeName(expected.colorName),
    `${label}: color name ${actual.colorName} != ${expected.colorName}`
  );
  assert(
    normalizeHex(actual.colorHex) === normalizeHex(expected.colorHex),
    `${label}: color hex ${actual.colorHex} != ${expected.colorHex}`
  );
}

function assertColorflePayloadMatches(actual, expected, label) {
  assert(actual && typeof actual === 'object', `${label}: expected object payload`);
  assert(actual.success === true, `${label}: success flag missing`);
  assert(actual.date === expected.date, `${label}: date ${actual.date} != ${expected.date}`);
  assert(actual.puzzleNumber === expected.puzzleNumber, `${label}: puzzle number ${actual.puzzleNumber} != ${expected.puzzleNumber}`);
  assert(actual.mode === expected.mode, `${label}: mode ${actual.mode} != ${expected.mode}`);
  assert(
    normalizeHex(actual.targetColor?.hex) === normalizeHex(expected.targetColor.hex),
    `${label}: target hex ${actual.targetColor?.hex} != ${expected.targetColor.hex}`
  );
  assert(Array.isArray(actual.colors), `${label}: colors payload missing`);
  assert(actual.colors.length === expected.colors.length, `${label}: colors length mismatch`);

  actual.colors.forEach((color, index) => {
    const expectedColor = expected.colors[index];
    assert(color.index === expectedColor.index, `${label}: color index ${index} mismatch`);
    assert(normalizeName(color.name) === normalizeName(expectedColor.name), `${label}: color name ${index} mismatch`);
    assert(normalizeHex(color.hex) === normalizeHex(expectedColor.hex), `${label}: color hex ${index} mismatch`);
    assert(Math.abs(color.weight - expectedColor.weight) < 1e-9, `${label}: color weight ${index} mismatch`);
  });
}

function getPuzzleDateKeyForGame(game, now = new Date()) {
  const configs = {
    colordle: { hour: 16, minute: 30, offsetDays: 1 },
    colorfle: { hour: 15, minute: 0, offsetDays: 1 },
  };
  const config = configs[game];
  const boundary = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    config.hour,
    config.minute,
    30,
    0
  );
  const visibleDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + (now.getTime() >= boundary ? config.offsetDays : config.offsetDays - 1),
      12,
      0,
      0
    )
  );
  return formatDateKey(visibleDate);
}

function isNearBoundary(game, now = new Date(), toleranceSeconds = 120) {
  const configs = {
    colordle: { hour: 16, minute: 30 },
    colorfle: { hour: 15, minute: 0 },
  };
  const config = configs[game];
  const boundaryToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    config.hour,
    config.minute,
    30,
    0
  );
  const delta = Math.abs(now.getTime() - boundaryToday);
  return delta <= toleranceSeconds * 1000;
}

function withCacheBust(pathname) {
  const separator = pathname.includes('?') ? '&' : '?';
  return `${pathname}${separator}verify=${Date.now()}`;
}

async function fetchJson(pathname, expectedStatus = 200) {
  const url = `${apiBase}${withCacheBust(pathname)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  if (response.status !== expectedStatus) {
    throw new Error(`${pathname} returned ${response.status} instead of ${expectedStatus}: ${text}`);
  }

  return body;
}

async function runCheck(name, action) {
  try {
    await action();
    results.push({ name, ok: true });
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, ok: false, message });
    console.error(`FAIL ${name}`);
    console.error(`  ${message}`);
  }
}

let statsPayload;
let todayPayload;

await runCheck('health endpoint', async () => {
  const payload = await fetchJson('/health');
  assert(payload.status === 'ok', `health status ${payload.status}`);
  assert(payload.service === 'colordleanswer-api', `health service ${payload.service}`);
});

await runCheck('local Colordle bundle matches main repo data', async () => {
  assert(mainColordleData.entryCount === mainColordleData.entries.length, 'main Colordle entry count does not match entries array');
  assert(getColordleBundledLatestDateKey() === mainColordleData.latestDate, 'bundled Colordle latest date drifted from main repo');

  for (const dateKey of ['2023-08-07', '2024-05-25', '2025-09-23', '2026-05-18']) {
    buildExpectedColordle(dateKey);
  }
});

await runCheck('stats endpoint and D1 counts', async () => {
  statsPayload = await fetchJson('/api/stats');
  assert(statsPayload.success === true, 'stats success flag missing');
  assert(statsPayload.today?.colordle, 'stats today.colordle missing');
  assert(statsPayload.today?.colorfle, 'stats today.colorfle missing');
  assert(statsPayload.colordle.totalAnswers === mainColordleData.entryCount, `colordle totalAnswers ${statsPayload.colordle.totalAnswers} != ${mainColordleData.entryCount}`);

  const expectedColorfleRows = daysInclusive(COLORFLE_MIN_DATE, statsPayload.today.colorfle);
  assert(
    statsPayload.colorfle.totalAnswers === expectedColorfleRows,
    `colorfle totalAnswers ${statsPayload.colorfle.totalAnswers} != ${expectedColorfleRows}`
  );
});

await runCheck('today bundle endpoint', async () => {
  todayPayload = await fetchJson('/api/today');
  assert(todayPayload.success === true, 'today success flag missing');
  assert(todayPayload.dates?.colordle, 'today colordle date missing');
  assert(todayPayload.dates?.colorfle, 'today colorfle date missing');

  if (!isNearBoundary('colordle')) {
    const expectedColordleDate = getPuzzleDateKeyForGame('colordle');
    assert(
      todayPayload.dates.colordle === expectedColordleDate,
      `today colordle date ${todayPayload.dates.colordle} != ${expectedColordleDate}`
    );
  }

  if (!isNearBoundary('colorfle')) {
    const expectedColorfleDate = getPuzzleDateKeyForGame('colorfle');
    assert(
      todayPayload.dates.colorfle === expectedColorfleDate,
      `today colorfle date ${todayPayload.dates.colorfle} != ${expectedColorfleDate}`
    );
  }

  const expectedColordle = buildExpectedColordle(todayPayload.dates.colordle);
  if (expectedColordle === null) {
    assert(todayPayload.colordle === null, 'today colordle should be null after official data ends');
  } else {
    assertColordlePayloadMatches({ success: true, ...todayPayload.colordle }, expectedColordle, 'today colordle');
  }

  const expectedColorfle = buildExpectedColorfle(todayPayload.dates.colorfle);
  assertColorflePayloadMatches({ success: true, ...todayPayload.colorfle }, expectedColorfle, 'today colorfle');
});

await runCheck('colordle today endpoint', async () => {
  const todayDate = todayPayload?.dates?.colordle || statsPayload?.today?.colordle || getPuzzleDateKeyForGame('colordle');
  const expected = buildExpectedColordle(todayDate);

  if (expected === null) {
    const payload = await fetchJson('/api/colordle/today', 503);
    assert(payload.requestedDate === todayDate, `colordle today requestedDate ${payload.requestedDate} != ${todayDate}`);
    assert(
      payload.availableThroughDate === mainColordleData.latestDate,
      `colordle today availableThroughDate ${payload.availableThroughDate} != ${mainColordleData.latestDate}`
    );
    return;
  }

  const payload = await fetchJson('/api/colordle/today');
  assertColordlePayloadMatches(payload, expected, 'colordle today');
});

await runCheck('colorfle today endpoint', async () => {
  const todayDate = todayPayload?.dates?.colorfle || statsPayload?.today?.colorfle || getPuzzleDateKeyForGame('colorfle');
  const payload = await fetchJson('/api/colorfle/today');
  assertColorflePayloadMatches(payload, buildExpectedColorfle(todayDate), 'colorfle today');
});

for (const dateKey of SAMPLE_COLORDLE_DATES) {
  await runCheck(`colordle archive ${dateKey}`, async () => {
    const payload = await fetchJson(`/api/colordle/archive/${dateKey}`);
    const expected = buildExpectedColordle(dateKey);
    assert(expected !== null, `${dateKey} should exist in official Colordle data`);
    assertColordlePayloadMatches(payload, expected, `colordle archive ${dateKey}`);
  });
}

for (const dateKey of SAMPLE_COLORFLE_DATES) {
  await runCheck(`colorfle archive ${dateKey}`, async () => {
    const payload = await fetchJson(`/api/colorfle/archive/${dateKey}`);
    assertColorflePayloadMatches(payload, buildExpectedColorfle(dateKey), `colorfle archive ${dateKey}`);
  });
}

for (const [monthKey, sampleDate] of COLORDLE_MONTH_SAMPLES) {
  await runCheck(`colordle month archive ${monthKey}`, async () => {
    const payload = await fetchJson(`/api/colordle/archive?month=${monthKey}`);
    assert(payload.success === true, `colordle month ${monthKey}: success flag missing`);
    assert(payload.month === monthKey, `colordle month ${monthKey}: echoed month mismatch`);
    const expectedCount = countAvailableDatesInMonth(monthKey, COLORDLE_MIN_DATE, mainColordleData.latestDate);
    assert(payload.answers.length === expectedCount, `colordle month ${monthKey}: ${payload.answers.length} rows != ${expectedCount}`);
    const sample = payload.answers.find((entry) => entry.date === sampleDate);
    assert(sample, `colordle month ${monthKey}: missing sample date ${sampleDate}`);
    assertColordlePayloadMatches({ success: true, ...sample }, buildExpectedColordle(sampleDate), `colordle month ${monthKey}`);
  });
}

for (const [monthKey, sampleDate] of COLORFLE_MONTH_SAMPLES) {
  await runCheck(`colorfle month archive ${monthKey}`, async () => {
    const payload = await fetchJson(`/api/colorfle/archive?month=${monthKey}`);
    assert(payload.success === true, `colorfle month ${monthKey}: success flag missing`);
    assert(payload.month === monthKey, `colorfle month ${monthKey}: echoed month mismatch`);
    const expectedCount = countAvailableDatesInMonth(monthKey, COLORFLE_MIN_DATE, statsPayload.today.colorfle);
    assert(payload.answers.length === expectedCount, `colorfle month ${monthKey}: ${payload.answers.length} rows != ${expectedCount}`);
    const sample = payload.answers.find((entry) => entry.date === sampleDate);
    assert(sample, `colorfle month ${monthKey}: missing sample date ${sampleDate}`);
    assertColorflePayloadMatches({ success: true, ...sample }, buildExpectedColorfle(sampleDate), `colorfle month ${monthKey}`);
  });
}

await runCheck('colordle future guard', async () => {
  const testDate = addDays(mainColordleData.latestDate, 1);
  const todayDate = statsPayload.today.colordle;

  if (testDate <= todayDate) {
    const payload = await fetchJson(`/api/colordle/archive/${testDate}`, 503);
    assert(payload.requestedDate === testDate, `colordle future guard requestedDate ${payload.requestedDate} != ${testDate}`);
    assert(
      payload.availableThroughDate === mainColordleData.latestDate,
      `colordle future guard availableThroughDate ${payload.availableThroughDate} != ${mainColordleData.latestDate}`
    );
    return;
  }

  const payload = await fetchJson(`/api/colordle/archive/${testDate}`, 400);
  assert(
    String(payload.error || '').includes(`Date must be between ${COLORDLE_MIN_DATE} and ${todayDate}`),
    `colordle future guard range message mismatch: ${payload.error}`
  );
});

await runCheck('colorfle future guard', async () => {
  const testDate = addDays(statsPayload.today.colorfle, 1);
  const payload = await fetchJson(`/api/colorfle/archive/${testDate}`, 400);
  assert(
    String(payload.error || '').includes(`Date must be between ${COLORFLE_MIN_DATE} and ${statsPayload.today.colorfle}`),
    `colorfle future guard range message mismatch: ${payload.error}`
  );
});

console.log('');
console.log(`Checked ${results.length} endpoint and dataset assertions against ${apiBase}`);
console.log(`Passed: ${results.length - failures}`);
console.log(`Failed: ${failures}`);

if (failures > 0) {
  process.exitCode = 1;
}
