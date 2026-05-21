// Colorfle game logic - matches colorfle.com exactly
// Based on reference repo: toviralideasyt7/wordsolverx-z-ai
// Colorfle uses a deterministic seeded PRNG - no external data needed

import seedrandom from 'seedrandom';

export const COLORS = [
  '#FFFFFF', '#FFFAC8', '#FABEBE', '#AAFFC3', '#E6BEFF',
  '#46F0F0', '#FFE119', '#BCF60C', '#F58231', '#3CB44B',
  '#F032E6', '#808000', '#008080', '#9A6324', '#E6194B',
  '#4363D8', '#911EB4', '#800000', '#000075', '#000000'
];

export const COLOR_NAMES = [
  'White', 'Light Yellow', 'Pink', 'Light Green', 'Lavender',
  'Cyan', 'Yellow', 'Lime', 'Orange', 'Green',
  'Magenta', 'Olive', 'Teal', 'Brown', 'Red',
  'Blue', 'Purple', 'Maroon', 'Navy', 'Black'
];

export const NUM_ANSWER_BLOCKS = [3, 4];
export const WEIGHTS: number[][] = [
  [0.5, 0.34, 0.16],
  [0.4, 0.3, 0.2, 0.1]
];

const LAUNCH_DATE = new Date('4/25/2022 17:00:00');

interface RGB { r: number; g: number; b: number; }
interface YCC { r: number; y: number; b: number; }

function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(rgb: RGB): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r)));
  const g = Math.max(0, Math.min(255, Math.round(rgb.g)));
  const b = Math.max(0, Math.min(255, Math.round(rgb.b)));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToYcc(rgb: RGB): YCC {
  const t = Math.min(rgb.r, rgb.g, rgb.b);
  const o = Math.min(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
  const a = rgb.r - t;
  const l = rgb.g - t;
  const r = rgb.b - t;
  const s = Math.min(a, l);
  const n = a - s;
  const d = (l + s) / 2;
  const c = (r + l - s) / 2;
  const i = Math.max(n, d, c, 1) / Math.max(a, l, r, 1);

  return {
    r: n / i + o,
    y: d / i + o,
    b: c / i + o
  };
}

function yccToRgb(ycc: YCC): RGB {
  const t = Math.min(ycc.r, ycc.y, ycc.b);
  const o = Math.min(255 - ycc.r, 255 - ycc.y, 255 - ycc.b);
  const a = ycc.r - t;
  const l = ycc.y - t;
  const r = ycc.b - t;
  const s = Math.min(l, r);
  const n = a + l - s;
  const d = l + 2 * s;
  const c = 2 * (r - s);
  const i = Math.max(n, d, c, 1) / Math.max(a, l, r, 1);

  return {
    r: n / i + o,
    g: d / i + o,
    b: c / i + o
  };
}

function mixColors(colorIndices: number[], mode = 0): RGB {
  const weights = WEIGHTS[mode];
  const yccMix: YCC = { r: 0, y: 0, b: 0 };

  for (let i = 0; i < colorIndices.length; i++) {
    const converted = rgbToYcc(hexToRgb(COLORS[colorIndices[i]]));
    yccMix.r += converted.r * weights[i];
    yccMix.y += converted.y * weights[i];
    yccMix.b += converted.b * weights[i];
  }

  yccMix.r = Math.min(255, Math.round(yccMix.r));
  yccMix.y = Math.min(255, Math.round(yccMix.y));
  yccMix.b = Math.min(255, Math.round(yccMix.b));

  const yccResult = yccToRgb(yccMix);

  const rgbMix: RGB = { r: 0, g: 0, b: 0 };
  for (let i = 0; i < colorIndices.length; i++) {
    const converted = hexToRgb(COLORS[colorIndices[i]]);
    rgbMix.r += converted.r * weights[i];
    rgbMix.g += converted.g * weights[i];
    rgbMix.b += converted.b * weights[i];
  }

  rgbMix.r = Math.min(255, Math.round(rgbMix.r));
  rgbMix.g = Math.min(255, Math.round(rgbMix.g));
  rgbMix.b = Math.min(255, Math.round(rgbMix.b));

  return {
    r: Math.round((yccResult.r + rgbMix.r) / 2),
    g: Math.round((yccResult.g + rgbMix.g) / 2),
    b: Math.round((yccResult.b + rgbMix.b) / 2)
  };
}

// Get puzzle number for a date
export function getPuzzleNumber(date: Date): number {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const launchUtcMs = LAUNCH_DATE.getTime() + LAUNCH_DATE.getTimezoneOffset() * 60000;
  const diffMs = utcMs - launchUtcMs;
  return Math.floor(diffMs / 86400000);
}

// Get the seed string for a date and mode
function getSeedString(date: Date, mode = 0): string {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const utc = new Date(utcMs);
  // Colorfle rolls at 15:00 UTC (midnight JST)
  const reset = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 15));
  if (utcMs >= reset.getTime()) {
    reset.setUTCDate(reset.getUTCDate() + 1);
  }
  return `${mode} ${reset.getUTCDate()} ${reset.getUTCMonth()} ${reset.getUTCFullYear()}`;
}

// Get the full puzzle answer for a given date and mode
export function getColorfleAnswer(dateStr: string, mode = 0): {
  date: string;
  puzzleNumber: number;
  mode: number;
  colors: { index: number; name: string; hex: string; weight: number }[];
  targetColor: { rgb: RGB; hex: string };
  formattedDate: string;
} {
  const date = new Date(dateStr + 'T12:00:00Z');
  const puzzleNumber = getPuzzleNumber(date);
  const rng = seedrandom(getSeedString(date, mode));
  const numBlocks = NUM_ANSWER_BLOCKS[mode];
  const chosen: number[] = [];
  const pool = Array.from({ length: 20 }, (_, index) => index);

  for (let i = 0; i < numBlocks; i++) {
    const pickIndex = Math.floor(rng() * pool.length);
    chosen[i] = pool[pickIndex];
    pool.splice(pickIndex, 1);
  }

  const targetColor = mixColors(chosen, mode);
  const weights = WEIGHTS[mode];
  
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
  });

  return {
    date: dateStr,
    puzzleNumber,
    mode,
    colors: chosen.map((colorIdx, position) => ({
      index: colorIdx,
      name: COLOR_NAMES[colorIdx],
      hex: COLORS[colorIdx],
      weight: weights[position]
    })),
    targetColor: {
      rgb: targetColor,
      hex: rgbToHex(targetColor)
    },
    formattedDate
  };
}
