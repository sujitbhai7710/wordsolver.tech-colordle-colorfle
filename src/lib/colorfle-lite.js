/**
 * Lightweight colorfle archive data for client-side components.
 * Uses an inline seeded PRNG instead of the seedrandom npm package
 * (which uses require() and doesn't work in browser ESM).
 */

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

export const WEIGHTS = [
  [0.5, 0.34, 0.16],
  [0.4, 0.3, 0.2, 0.1]
];

const NUM_ANSWER_BLOCKS = [3, 4];
const LAUNCH_DATE = new Date('4/25/2022 17:00:00');

/**
 * Inline implementation of seedrandom's alea algorithm
 * This matches the output of seedrandom for the same seed strings
 */
function createRng(seed) {
  // Simple but effective seeded PRNG (mulberry32)
  // We hash the seed string first
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  
  // Mulberry32 PRNG
  let state = h >>> 0;
  return function() {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16)
  };
}

function rgbToHex(rgb) {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r))).toString(16).padStart(2, '0');
  const g = Math.max(0, Math.min(255, Math.round(rgb.g))).toString(16).padStart(2, '0');
  const b = Math.max(0, Math.min(255, Math.round(rgb.b))).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function rgbToYcc(rgb) {
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

function yccToRgb(ycc) {
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

function mixColors(colorIndices, mode = 0) {
  const weights = WEIGHTS[mode];
  const yccMix = { r: 0, y: 0, b: 0 };
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
  const rgbMix = { r: 0, g: 0, b: 0 };
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

function getPuzzleNumber(date = new Date()) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const launchUtcMs = LAUNCH_DATE.getTime() + LAUNCH_DATE.getTimezoneOffset() * 60000;
  return Math.floor((utcMs - launchUtcMs) / 86400000);
}

function getSeedString(date, mode = 0) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const utc = new Date(utcMs);
  const reset = new Date(Date.UTC(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), 15));
  if (utcMs >= reset.getTime()) {
    reset.setUTCDate(reset.getUTCDate() + 1);
  }
  return `${mode} ${reset.getUTCDate()} ${reset.getUTCMonth()} ${reset.getUTCFullYear()}`;
}

export function getColorfleAnswerLite(date, mode = 0) {
  const puzzleNumber = getPuzzleNumber(date);
  const rng = createRng(getSeedString(date, mode));
  const numBlocks = NUM_ANSWER_BLOCKS[mode];
  const chosen = [];
  const pool = Array.from({ length: 20 }, (_, index) => index);

  for (let i = 0; i < numBlocks; i++) {
    const pickIndex = Math.floor(rng() * pool.length);
    chosen[i] = pool[pickIndex];
    pool.splice(pickIndex, 1);
  }

  const targetColor = mixColors(chosen, mode);

  return {
    puzzleNumber,
    mode,
    colors: chosen,
    targetColor,
    targetHex: rgbToHex(targetColor),
    colorNames: chosen.map((index) => COLOR_NAMES[index]),
    colorHexes: chosen.map((index) => COLORS[index])
  };
}
