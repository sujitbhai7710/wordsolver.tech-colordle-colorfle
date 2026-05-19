// Color utility functions for Colordle Answer

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(rgb: RGB): string {
  const r = Math.max(0, Math.min(255, Math.round(rgb.r))).toString(16).padStart(2, '0');
  const g = Math.max(0, Math.min(255, Math.round(rgb.g))).toString(16).padStart(2, '0');
  const b = Math.max(0, Math.min(255, Math.round(rgb.b))).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// --- LAB Color Space Conversion ---

function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  // Convert from sRGB to linear RGB
  let rr = r / 255;
  let gg = g / 255;
  let bb = b / 255;

  rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
  gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
  bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

  rr *= 100;
  gg *= 100;
  bb *= 100;

  // sRGB D65
  const x = rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375;
  const y = rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750;
  const z = rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041;

  return [x, y, z];
}

function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  // D65 reference
  const refX = 95.047;
  const refY = 100.0;
  const refZ = 108.883;

  let xx = x / refX;
  let yy = y / refY;
  let zz = z / refZ;

  const epsilon = 0.008856;
  const kappa = 903.3;

  xx = xx > epsilon ? Math.cbrt(xx) : (kappa * xx + 16) / 116;
  yy = yy > epsilon ? Math.cbrt(yy) : (kappa * yy + 16) / 116;
  zz = zz > epsilon ? Math.cbrt(zz) : (kappa * zz + 16) / 116;

  const L = 116 * yy - 16;
  const A = 500 * (xx - yy);
  const B = 200 * (yy - zz);

  return [L, A, B];
}

export function rgbToLab(rgb: RGB): [number, number, number] {
  const [x, y, z] = rgbToXyz(rgb.r, rgb.g, rgb.b);
  return xyzToLab(x, y, z);
}

// --- Delta E CIE2000 ---

export function deltaE2000(
  lab1: [number, number, number],
  lab2: [number, number, number]
): number {
  const L1 = lab1[0], a1 = lab1[1], b1 = lab1[2];
  const L2 = lab2[0], a2 = lab2[1], b2 = lab2[2];

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cavg = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cavg, 7) / (Math.pow(Cavg, 7) + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
  if (h1p < 0) h1p += 360;
  let h2p = Math.atan2(b2, a2p) * 180 / Math.PI;
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * Math.PI / 360);

  const Lavgp = (L1 + L2) / 2;
  const Cavgp = (C1p + C2p) / 2;

  let havgp: number;
  if (C1p * C2p === 0) {
    havgp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    havgp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    havgp = (h1p + h2p + 360) / 2;
  } else {
    havgp = (h1p + h2p - 360) / 2;
  }

  const T = 1
    - 0.17 * Math.cos((havgp - 30) * Math.PI / 180)
    + 0.24 * Math.cos(2 * havgp * Math.PI / 180)
    + 0.32 * Math.cos((3 * havgp + 6) * Math.PI / 180)
    - 0.20 * Math.cos((4 * havgp - 63) * Math.PI / 180);

  const SL = 1 + 0.015 * Math.pow(Lavgp - 50, 2) / Math.sqrt(20 + Math.pow(Lavgp - 50, 2));
  const SC = 1 + 0.045 * Cavgp;
  const SH = 1 + 0.015 * Cavgp * T;

  const RT = -Math.sin(2 * (30 * Math.PI / 180))
    * 2
    * Math.sqrt(Math.pow(Cavgp, 7) / (Math.pow(Cavgp, 7) + Math.pow(25, 7)))
    * Math.sin(2 * (30 * Math.PI / 180 + havgp * Math.PI / 180));

  const dE = Math.sqrt(
    Math.pow(dLp / SL, 2)
    + Math.pow(dCp / SC, 2)
    + Math.pow(dHp / SH, 2)
    + RT * (dCp / SC) * (dHp / SH)
  );

  return dE;
}

// Score: 100 - DeltaE (clamped to 0)
export function colorDiff(c1: RGB, c2: RGB): number {
  try {
    const lab1 = rgbToLab(c1);
    const lab2 = rgbToLab(c2);
    const dE = deltaE2000(lab1, lab2);
    return Math.max(0, 100 - dE);
  } catch {
    return 0;
  }
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '#FFFFFF';
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function normalizeHex(hex: string): string {
  const trimmed = hex.trim();
  let normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  if (normalized.length === 4) {
    normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
  }
  return normalized.toLowerCase();
}

export function isValidHex(hex: string): boolean {
  return /^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(hex.trim());
}
