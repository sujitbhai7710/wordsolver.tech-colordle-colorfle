import { colornames } from 'color-name-list';

import resolvedColorData from '../../src/data/colordle-resolved-data.json';
import targetColorNames from '../../src/data/colordle-targets.json';

export interface ColorData {
  name: string;
  hex: string;
}

const COLORDLE_START_DATE = new Date('2023-08-07T12:00:00Z');
const COLORDLE_DAY_OFFSET = 500;

let colorLookupCache: Map<string, ColorData> | null = null;

function normalizeColorName(name: string): string {
  return name.toLowerCase().replace(/ /g, '');
}

function prettifyFallbackName(name: string): string {
  return name
    .replace(/([a-z])([A-Z0-9])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getUtcDayDifference(date: Date, startDate: Date): number {
  const current = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const start = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
  return Math.floor((current - start) / 86400000);
}

function getColorLookup(): Map<string, ColorData> {
  if (colorLookupCache) {
    return colorLookupCache;
  }

  const lookup = new Map<string, ColorData>();

  for (const color of colornames) {
    const normalized = normalizeColorName(color.name);
    if (!lookup.has(normalized)) {
      lookup.set(normalized, { name: color.name, hex: color.hex });
    }
  }

  for (const [normalized, color] of Object.entries(resolvedColorData)) {
    lookup.set(normalized, color);
  }

  colorLookupCache = lookup;
  return colorLookupCache;
}

export function getTargetColorNames(): string[] {
  return targetColorNames.colors.map((value) => String(value));
}

export function resolveTargetColors(targetNames: string[]): ColorData[] {
  const colorLookup = getColorLookup();

  return targetNames.map((name) => {
    const normalized = normalizeColorName(name);
    const match = colorLookup.get(normalized);
    if (match) {
      return match;
    }

    return {
      name: prettifyFallbackName(name),
      hex: '#000000',
    };
  });
}

export function getColordleDayNumber(date: Date = new Date()): number {
  return COLORDLE_DAY_OFFSET + getUtcDayDifference(date, COLORDLE_START_DATE);
}
