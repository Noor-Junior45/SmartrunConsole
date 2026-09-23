import type { CSSProperties } from 'react';

// Color Swatch and CSS Mapping Utility for Giriraj Catalog and Storefront

export interface ColorMeta {
  hex: string;
  isLight?: boolean;
  label: string;
  gradient?: string;
}

export const COMMON_COLOR_MAP: Record<string, ColorMeta> = {
  red: { hex: '#dc2626', label: 'Red' },
  white: { hex: '#ffffff', isLight: true, label: 'White' },
  black: { hex: '#0f172a', label: 'Black' },
  green: { hex: '#16a34a', label: 'Green' },
  blue: { hex: '#2563eb', label: 'Blue' },
  yellow: { hex: '#eab308', isLight: true, label: 'Yellow' },
  'green / yellow': { 
    hex: '#16a34a', 
    label: 'Green / Yellow', 
    gradient: 'linear-gradient(135deg, #16a34a 50%, #eab308 50%)' 
  },
  'green/yellow': { 
    hex: '#16a34a', 
    label: 'Green / Yellow', 
    gradient: 'linear-gradient(135deg, #16a34a 50%, #eab308 50%)' 
  },
  'yellow / green': { 
    hex: '#16a34a', 
    label: 'Yellow / Green', 
    gradient: 'linear-gradient(135deg, #16a34a 50%, #eab308 50%)' 
  },
  'yellow/green': { 
    hex: '#16a34a', 
    label: 'Yellow / Green', 
    gradient: 'linear-gradient(135deg, #16a34a 50%, #eab308 50%)' 
  },
  grey: { hex: '#64748b', label: 'Grey' },
  gray: { hex: '#64748b', label: 'Gray' },
  'dark grey': { hex: '#334155', label: 'Dark Grey' },
  'light grey': { hex: '#cbd5e1', isLight: true, label: 'Light Grey' },
  brown: { hex: '#78350f', label: 'Brown' },
  orange: { hex: '#ea580c', label: 'Orange' },
  purple: { hex: '#9333ea', label: 'Purple' },
  pink: { hex: '#db2777', label: 'Pink' },
  gold: { hex: '#d97706', label: 'Gold' },
  golden: { hex: '#d97706', label: 'Golden' },
  silver: { hex: '#94a3b8', label: 'Silver' },
  ivory: { hex: '#fefce8', isLight: true, label: 'Ivory' },
  copper: { hex: '#b45309', label: 'Copper' },
  beige: { hex: '#f5f5dc', isLight: true, label: 'Beige' },
  bronze: { hex: '#8c6239', label: 'Bronze' },
};

/**
 * Returns the hex code and lighting properties for a color name or custom hex.
 * Falls back to a refined neutral slate dot (#94a3b8) if color is not found.
 */
export function getColorInfo(colorName: string, customHex?: string): { hex: string; isLight: boolean; label: string; gradient?: string } {
  if (customHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(customHex.trim())) {
    const norm = customHex.trim().toLowerCase();
    const isLight = norm === '#fff' || norm === '#ffffff' || norm === '#fefce8' || norm === '#f5f5dc';
    return {
      hex: norm,
      isLight,
      label: colorName.trim() || norm,
    };
  }

  const normalized = colorName.trim().toLowerCase();
  const match = COMMON_COLOR_MAP[normalized];
  if (match) {
    return {
      hex: match.hex,
      isLight: Boolean(match.isLight),
      label: colorName.trim(),
      gradient: match.gradient,
    };
  }

  // Check if string itself is a valid hex code (e.g. #ff0000)
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
    return {
      hex: normalized,
      isLight: normalized.toLowerCase() === '#fff' || normalized.toLowerCase() === '#ffffff',
      label: colorName.trim(),
    };
  }

  // Fallback to neutral gray swatch
  return {
    hex: '#94a3b8',
    isLight: false,
    label: colorName.trim(),
  };
}

export function getColorSwatchStyle(colorName: string, customHex?: string): CSSProperties {
  const info = getColorInfo(colorName, customHex);
  if (info.gradient) {
    return { background: info.gradient };
  }
  return { backgroundColor: info.hex };
}
