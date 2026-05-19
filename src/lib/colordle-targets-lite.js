/**
 * Lightweight colordle target color resolver for client-side components.
 * Uses pre-resolved color data (generated at build time) instead of
 * importing delta-e, color-space, or color-name-list (which use CommonJS require()
 * and crash in the browser).
 */

import targetColorNames from '../data/colordle-targets.json' with { type: 'json' };
import resolvedHexMap from '../data/colordle-resolved-colors.json' with { type: 'json' };

function normalizeColorName(name) {
  return name.toLowerCase().replace(/ /g, '');
}

let targetColorsCache = null;

export function getTargetColorsLite() {
  if (targetColorsCache) return targetColorsCache;

  const targets = [];
  for (const name of targetColorNames.colors) {
    const normalized = normalizeColorName(name);
    const hex = resolvedHexMap[normalized] || '#888888';
    const displayName = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    targets.push({ name: displayName, hex });
  }

  targetColorsCache = targets;
  return targetColorsCache;
}

export function getColordleDayNum(date = new Date()) {
  const COLORDLE_START_DATE = new Date('2024-01-01T12:00:00Z');
  const diffMs = date.getTime() - COLORDLE_START_DATE.getTime();
  return Math.floor(diffMs / 86400000);
}
