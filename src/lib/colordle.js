import colorSpace from 'color-space';
import deltaE from 'delta-e';
import { colornames } from 'color-name-list';

const rgbLab = colorSpace.rgb.lab;
const getDeltaE00 = deltaE.getDeltaE00 || deltaE.default?.getDeltaE00 || deltaE;

const COLOR_OVERRIDES = {
  bloodred: { name: 'Blood Red', hex: '#980002' },
  oceanblue: { name: 'Ocean Blue', hex: '#009dc4' },
  shadow: { name: 'Shadow', hex: '#837050' },
  chili: { name: 'Chili', hex: '#be4b41' },
  redwine: { name: 'Red Wine', hex: '#8c0034' },
  coralred: { name: 'Coral Red', hex: '#ff4040' },
  bubble: { name: 'Bubble', hex: '#eaf5e7' },
  patinagreen: { name: 'Patina Green', hex: '#b9eab3' },
  nude: { name: 'Nude', hex: '#f2d2bd' },
  brightpink: { name: 'Bright Pink', hex: '#ff007f' },
  vermillion: { name: 'Vermilion', hex: '#f4320c' },
  darksalmon: { name: 'Dark Salmon', hex: '#e9967a' },
  redwine: { name: 'Red Wine', hex: '#8c0034' },
  brownorange: { name: 'Brown Orange', hex: '#b06a3c' },
  yelloworange: { name: 'Yellow Orange', hex: '#ffae42' },
  brownish: { name: 'Brownish', hex: '#8b6c42' },
  oxblood: { name: 'Ox Blood', hex: '#4a0000' },
  dustyrose: { name: 'Dusty Rose', hex: '#c5a3a3' },
  barbiepink: { name: 'Barbie Pink', hex: '#e0218a' },
  purewhite: { name: 'Pure White', hex: '#ffffff' },
  ashgrey: { name: 'Ash Grey', hex: '#b0b0b0' },
  pastelred: { name: 'Pastel Red', hex: '#ff6961' },
  steelblue: { name: 'Steel Blue', hex: '#4682b4' },
  orangebrown: { name: 'Orange Brown', hex: '#b06a3c' },
  cerise: { name: 'Cerise', hex: '#de3163' },
  purplepink: { name: 'Purple Pink', hex: '#c77dba' },
  rouge: { name: 'Rouge', hex: '#c7a4be' },
  brightwhite: { name: 'Bright White', hex: '#f8f8ff' },
  '3amlatte': { name: '3AM Latte', hex: '#a67b5b' },
  palepink: { name: 'Pale Pink', hex: '#fadadd' },
  mulberry: { name: 'Mulberry', hex: '#c54b8c' },
  bubblegum: { name: 'Bubble Gum', hex: '#ff69b4' },
  iris: { name: 'Iris', hex: '#5a4fcf' },
  candyapplered: { name: 'Candy Apple Red', hex: '#ff0800' },
  powderblue: { name: 'Powder Blue', hex: '#b0e0e6' },
  cerulean: { name: 'Cerulean', hex: '#007ba7' },
  burntumber: { name: 'Burnt Umber', hex: '#8a3324' },
  rosepink: { name: 'Rose Pink', hex: '#ff66cc' },
  darkviolet: { name: 'Dark Violet', hex: '#8b00ff' },
  coolgrey: { name: 'Cool Grey', hex: '#8c92ac' },
  cinnabar: { name: 'Cinnabar', hex: '#e34234' },
  paleblue: { name: 'Pale Blue', hex: '#add8e6' },
  greige: { name: 'Greige', hex: '#b9b2a4' },
  grapefruit: { name: 'Grapefruit', hex: '#fd5956' },
  whitesmoke_color: { name: 'White Smoke', hex: '#f5f5f5' },
  redpurple: { name: 'Red Purple', hex: '#e03c31' },
  neonpink: { name: 'Neon Pink', hex: '#ff10f0' },
  fossil: { name: 'Fossil', hex: '#a89984' },
  blueblue: { name: 'Blue Blue', hex: '#003399' },
  bluish: { name: 'Bluish', hex: '#4884d0' },
  indianred: { name: 'Indian Red', hex: '#cd5c5c' },
  flax: { name: 'Flax', hex: '#eedc82' },
  fireengine: { name: 'Fire Engine', hex: '#ce2029' },
  rosewood: { name: 'Rosewood', hex: '#65000b' },
  ghostwhite: { name: 'Ghost White', hex: '#f8f8ff' },
  greyish: { name: 'Greyish', hex: '#a9a9a9' },
  lightbeige: { name: 'Light Beige', hex: '#f5f5dc' },
  alabaster: { name: 'Alabaster', hex: '#e6dfd0' },
  iceblue: { name: 'Ice Blue', hex: '#d6fffa' },
  pastelorange: { name: 'Pastel Orange', hex: '#ffb347' },
  pinkish: { name: 'Pinkish', hex: '#d8a2c4' },
  neonyellow: { name: 'Neon Yellow', hex: '#ccff00' },
  deeppurple: { name: 'Deep Purple', hex: '#36013f' },
  creamy: { name: 'Creamy', hex: '#fffdd0' },
  midnightblue: { name: 'Midnight Blue', hex: '#191970' },
  pinky: { name: 'Pinky', hex: '#fc86aa' },
  fuchsia_color: { name: 'Fuchsia', hex: '#ff00ff' },
  royalpurple: { name: 'Royal Purple', hex: '#6b3fa0' },
  salt: { name: 'Salt', hex: '#f0f0e8' },
  cherryred: { name: 'Cherry Red', hex: '#de3163' },
  ecru: { name: 'Ecru', hex: '#c2b280' },
  amaranth: { name: 'Amaranth', hex: '#e52b50' },
  vermilion: { name: 'Vermilion', hex: '#f4320c' },
  rubyred: { name: 'Ruby Red', hex: '#9b111e' },
  rosegold: { name: 'Rose Gold', hex: '#b76e79' },
  gainsboro: { name: 'Gainsboro', hex: '#dcdcdc' },
  darkmaroon: { name: 'Dark Maroon', hex: '#3c0000' },
  orangepink: { name: 'Orange Pink', hex: '#ff6f61' },
  electricblue: { name: 'Electric Blue', hex: '#7df9ff' },
  stop: { name: 'Stop', hex: '#ff0000' },
  ultramarine: { name: 'Ultramarine', hex: '#120a8f' },
  seashell: { name: 'Seashell', hex: '#fff5ee' },
  cloudy: { name: 'Cloudy', hex: '#a8a9ad' },
  burntred: { name: 'Burnt Red', hex: '#9a3b3b' },
  concrete: { name: 'Concrete', hex: '#95a5a6' },
  pinkpurple: { name: 'Pink Purple', hex: '#c77dba' },
  blackberry: { name: 'Blackberry', hex: '#43182f' },
  snowwhite: { name: 'Snow White', hex: '#fffafa' },
  rosered: { name: 'Rose Red', hex: '#c21e56' },
  greybrown: { name: 'Grey Brown', hex: '#7f7053' },
  frost: { name: 'Frost', hex: '#e0f7fa' },
  misty: { name: 'Misty', hex: '#c4c4bc' },
  cool: { name: 'Cool', hex: '#a3b5c7' },
  ghost: { name: 'Ghost', hex: '#f8f8ff' },
  pastelpurple: { name: 'Pastel Purple', hex: '#b19cd9' },
  dove: { name: 'Dove', hex: '#c0c0c0' },
  whiteblue: { name: 'White Blue', hex: '#e0e8f0' },
  winered: { name: 'Wine Red', hex: '#722f37' },
  palegrey: { name: 'Pale Grey', hex: '#d3d3d3' },
  bloodorange: { name: 'Blood Orange', hex: '#cc1100' },
  springgreen: { name: 'Spring Green', hex: '#00ff7f' },
  lightteal: { name: 'Light Teal', hex: '#90e4c1' },
  coconut: { name: 'Coconut', hex: '#f8f0e3' },
  pewter: { name: 'Pewter', hex: '#96a8a1' },
  blueviolet: { name: 'Blue Violet', hex: '#8a2be2' },
  redpink: { name: 'Red Pink', hex: '#ff4040' },
  amethyst: { name: 'Amethyst', hex: '#9966cc' },
  pomegranate: { name: 'Pomegranate', hex: '#c41e3a' },
  reddishbrown: { name: 'Reddish Brown', hex: '#6e3b24' },
  chalk: { name: 'Chalk', hex: '#f0ead6' },
  lead_color: { name: 'Lead', hex: '#5a5a5a' },
  canary_color: { name: 'Canary', hex: '#ffef00' },
  platinum: { name: 'Platinum', hex: '#e5e4e2' },
  brightblue: { name: 'Bright Blue', hex: '#0066ff' },
  neonpurple: { name: 'Neon Purple', hex: '#b300ff' },
  pastelpink_color: { name: 'Pastel Pink', hex: '#ffd1dc' },
  burntSienna: { name: 'Burnt Sienna', hex: '#e97451' },
  cottoncandy: { name: 'Cotton Candy', hex: '#ffbcd9' },
  lipstickred: { name: 'Lipstick Red', hex: '#c00020' },
  yellowgreen_color: { name: 'Yellow Green', hex: '#9acd32' },
  cranberry: { name: 'Cranberry', hex: '#9e003a' },
  brownishred: { name: 'Brownish Red', hex: '#8b2500' },
  darkrose: { name: 'Dark Rose', hex: '#b5485d' },
  pinkorange: { name: 'Pink Orange', hex: '#ff7f50' },
  brightpurple: { name: 'Bright Purple', hex: '#be29ec' },
  greywhite: { name: 'Grey White', hex: '#f0efe8' },
  crimsonred: { name: 'Crimson Red', hex: '#990000' },
  porcelain: { name: 'Porcelain', hex: '#f0ebe4' },
  seablue: { name: 'Sea Blue', hex: '#006994' },
  brownsugar: { name: 'Brown Sugar', hex: '#af6e4d' },
  pinkred_color: { name: 'Pink Red', hex: '#ff4040' },
};

// Build color lookup from color-name-list
let allColorsCache = null;

function normalizeColorName(name) {
  return name.toLowerCase().replace(/ /g, '');
}

export function getAllColors() {
  if (allColorsCache) return allColorsCache;

  const colors = [];
  const seen = new Set();

  const appendColor = (color) => {
    const normalized = normalizeColorName(color.name);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    colors.push(color);
  };

  for (const color of colornames) {
    appendColor(color);
  }

  for (const color of Object.values(COLOR_OVERRIDES)) {
    appendColor(color);
  }

  allColorsCache = colors;
  return allColorsCache;
}

export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function colorDiff(c1, c2) {
  try {
    const color1 = rgbLab([c1.r, c1.g, c1.b]);
    const color2 = rgbLab([c2.r, c2.g, c2.b]);
    const color1LAB = { L: color1[0], A: color1[1], B: color1[2] };
    const color2LAB = { L: color2[0], A: color2[1], B: color2[2] };
    const dE = getDeltaE00(color1LAB, color2LAB);
    return Math.max(0, 100 - dE);
  } catch (e) {
    console.error('Error calculating color difference:', e);
    return 0;
  }
}

export function findBestCandidates(candidates, guesses) {
  if (guesses.length === 0) return candidates;

  return candidates.filter((candidate) => {
    const candidateRgb = hexToRgb(candidate.hex);
    if (!candidateRgb) return false;

    return guesses.every((g) => {
      const guessRgb = hexToRgb(g.guess.hex);
      if (!guessRgb) return false;
      const calculatedPercent = colorDiff(candidateRgb, guessRgb);
      return Math.abs(calculatedPercent - g.percent) < 0.02;
    });
  });
}

// Target colors from the existing data
import targetColorNames from '../data/colordle-targets.json' with { type: 'json' };

let targetColorsCache = null;
let colorLookupCache = null;

function getColorLookup() {
  if (colorLookupCache) return colorLookupCache;

  const colorMap = new Map();
  for (const c of getAllColors()) {
    const normalized = normalizeColorName(c.name);
    if (!colorMap.has(normalized)) {
      colorMap.set(normalized, c);
    }
  }

  colorLookupCache = colorMap;
  return colorLookupCache;
}

export function getBundledTargetColorNames() {
  return targetColorNames.colors;
}

export function resolveTargetColors(targetNames) {
  const colorMap = getColorLookup();
  const orderedTargets = [];

  for (const name of targetNames) {
    const normalizedName = normalizeColorName(name);
    const match = colorMap.get(normalizedName);
    if (match) {
      orderedTargets.push(match);
    } else {
      orderedTargets.push({ name, hex: '#000000' });
    }
  }

  return orderedTargets;
}

export function getTargetColors() {
  if (targetColorsCache) return targetColorsCache;
  targetColorsCache = resolveTargetColors(targetColorNames.colors);
  return targetColorsCache;
}

export function getUniqueTargetColors() {
  const targets = getTargetColors();
  const seen = new Set();
  const unique = [];

  for (const t of targets) {
    const key = normalizeColorName(t.name);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(t);
    }
  }

  return unique;
}

// Get today's colordle answer
const COLORDLE_START_DATE = new Date('2024-01-01T12:00:00Z');

export function getColordleDayNum(date = new Date()) {
  const diffMs = date.getTime() - COLORDLE_START_DATE.getTime();
  return Math.floor(diffMs / 86400000);
}

export function getColordleToday() {
  const dayNum = getColordleDayNum();
  const targets = getTargetColors();
  const color = targets[dayNum % targets.length];
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return {
    color,
    dayNum,
    formattedDate,
    dateKey: today.toISOString().slice(0, 10)
  };
}
