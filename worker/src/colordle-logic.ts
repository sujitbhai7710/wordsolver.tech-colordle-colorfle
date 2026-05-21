import {
  getColordleDayNumber,
  getTargetColorNames,
  resolveTargetColors,
  type ColorData,
} from '../../src/lib/colordle.ts';

export const COLORDLE_START_DATE = new Date('2023-08-07T12:00:00Z');

const COLORDLE_SOURCE_URL = 'https://colordle.ryantanen.com/colors.json';
const COLORDLE_CACHE_TTL_MS = 5 * 60 * 1000;
const COLORDLE_SOURCE_HEADERS = {
  accept: 'application/json',
  'accept-language': 'ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7',
  referer: 'https://colordle.ryantanen.com/',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 WordSolverX Colordle Worker',
};

interface ColordleDataset {
  fetchedAt: number;
  latestDate: string | null;
  source: 'bundled' | 'live';
  targetNames: string[];
  targetColors: ColorData[];
}

let datasetCache: ColordleDataset | null = null;
let datasetPromise: Promise<ColordleDataset> | null = null;

function dateFromDateKey(dateStr: string): Date {
  return new Date(`${dateStr}T12:00:00Z`);
}

function buildDateKey(index: number): string | null {
  if (index < 0) {
    return null;
  }

  const date = new Date(COLORDLE_START_DATE);
  date.setUTCDate(date.getUTCDate() + index);
  return date.toISOString().slice(0, 10);
}

function getDayOffset(date: Date): number {
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const start = Date.UTC(
    COLORDLE_START_DATE.getUTCFullYear(),
    COLORDLE_START_DATE.getUTCMonth(),
    COLORDLE_START_DATE.getUTCDate()
  );
  return Math.floor((current - start) / 86400000);
}

function buildDataset(targetNames: string[], source: 'bundled' | 'live'): ColordleDataset {
  return {
    fetchedAt: Date.now(),
    latestDate: buildDateKey(targetNames.length - 1),
    source,
    targetNames,
    targetColors: resolveTargetColors(targetNames),
  };
}

async function fetchLiveTargetNames(): Promise<string[]> {
  const response = await fetch(COLORDLE_SOURCE_URL, {
    headers: COLORDLE_SOURCE_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`Colordle source responded with ${response.status}`);
  }

  const payload = await response.json() as { colors?: unknown };
  if (!payload || !Array.isArray(payload.colors) || payload.colors.length === 0) {
    throw new Error('Colordle source returned an empty colors list');
  }

  return payload.colors.map((value) => String(value));
}

function getBundledTargetNames(): string[] {
  return getTargetColorNames().map((value) => String(value));
}

async function loadColordleDataset(): Promise<ColordleDataset> {
  if (datasetCache && Date.now() - datasetCache.fetchedAt < COLORDLE_CACHE_TTL_MS) {
    return datasetCache;
  }

  if (datasetPromise) {
    return datasetPromise;
  }

  datasetPromise = (async () => {
    const bundledTargetNames = getBundledTargetNames();
    let targetNames = bundledTargetNames;
    let source: 'bundled' | 'live' = 'bundled';

    try {
      const liveTargetNames = await fetchLiveTargetNames();
      if (liveTargetNames.length >= bundledTargetNames.length) {
        targetNames = liveTargetNames;
        source = 'live';
      } else {
        console.warn(
          `Live Colordle source returned ${liveTargetNames.length} colors, shorter than bundled fallback ${bundledTargetNames.length}. Keeping bundled dataset.`
        );
      }
    } catch (error) {
      console.warn('Unable to refresh live Colordle targets; using bundled dataset.', error);
    }

    const dataset = buildDataset(targetNames, source);
    datasetCache = dataset;
    return dataset;
  })();

  try {
    return await datasetPromise;
  } finally {
    datasetPromise = null;
  }
}

export async function getLatestAvailableColordleDate(): Promise<string | null> {
  const dataset = await loadColordleDataset();
  return dataset.latestDate;
}

export async function getColordleAnswer(dateStr: string): Promise<{
  date: string;
  dayNumber: number;
  colorName: string;
  colorHex: string;
  formattedDate: string;
} | null> {
  const date = dateFromDateKey(dateStr);
  const dayOffset = getDayOffset(date);

  if (dayOffset < 0) {
    return null;
  }

  const dataset = await loadColordleDataset();
  if (dayOffset >= dataset.targetColors.length) {
    return null;
  }

  const answer = dataset.targetColors[dayOffset];

  return {
    date: dateStr,
    dayNumber: getColordleDayNumber(date),
    colorName: answer.name,
    colorHex: answer.hex,
    formattedDate: date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }),
  };
}
