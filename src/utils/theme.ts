import { ThemeId } from '../types';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tag: string;
  color: string; // Primary accent hex
  bg: string;    // Base surface hex
}

export const PRESET_THEMES: ThemeDefinition[] = [
  { id: 'oled', name: 'Refract OLED', tag: 'True Pitch Black', color: '#00f0ff', bg: '#000000' },
  { id: 'midnight', name: 'Stealth Midnight', tag: 'Pure Monochrome', color: '#f8fafc', bg: '#050507' },
  { id: 'obsidian', name: 'Obsidian Dark', tag: 'Cyan Glow', color: '#06b6d4', bg: '#070a10' },
  { id: 'carbon', name: 'Carbon Gold', tag: 'Amber / Gold', color: '#f59e0b', bg: '#080806' },
  { id: 'dracula', name: 'Dracula Neon', tag: 'Gothic Violet', color: '#bd93f9', bg: '#090611' },
  { id: 'nord', name: 'Nordic Frost', tag: 'Arctic Ice Blue', color: '#38bdf8', bg: '#060a0f' },
  { id: 'emerald', name: 'Cyber Emerald', tag: 'Matrix Green', color: '#10b981', bg: '#030805' },
  { id: 'crimson', name: 'Crimson Protocol', tag: 'Rose Red', color: '#f43f5e', bg: '#090305' },
  { id: 'titanium', name: 'Titanium Cobalt', tag: 'Electric Blue', color: '#3b82f6', bg: '#050914' },
  { id: 'sunset', name: 'Sunset Mirage', tag: 'Sunset Amber', color: '#f97316', bg: '#0a0604' },
  { id: 'synthwave', name: 'Synthwave 80s', tag: 'Neon Fuchsia', color: '#e879f9', bg: '#0c0410' },
  { id: 'tokyo', name: 'Tokyo Cyberpunk', tag: 'Hyper Pink', color: '#ff2a85', bg: '#0a030b' },
  { id: 'amethyst', name: 'Royal Amethyst', tag: 'Deep Purple', color: '#a855f7', bg: '#080410' },
  { id: 'volt', name: 'Acid Volt', tag: 'Electric Lime', color: '#a3e635', bg: '#060903' },
  { id: 'phantom', name: 'Phantom Smoke', tag: 'Gunmetal Silver', color: '#94a3b8', bg: '#060709' },
  { id: 'matcha', name: 'Matcha Botanical', tag: 'Forest Sage', color: '#4ade80', bg: '#040a05' },
  { id: 'solar', name: 'Solar Flare', tag: 'Bright Solar Gold', color: '#eab308', bg: '#090803' },
];

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}

export function adjustHexBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (val: number) => {
    const newVal = Math.min(255, Math.max(0, Math.round(val + (255 * percent) / 100)));
    return newVal.toString(16).padStart(2, '0');
  };
  return `#${adjust(rgb.r)}${adjust(rgb.g)}${adjust(rgb.b)}`;
}

export function isValidHex(hex: string): boolean {
  return /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(hex.trim());
}

export function formatHex(hex: string): string {
  const clean = hex.trim().replace(/^#+/, '');
  return `#${clean.toUpperCase()}`;
}

export function applyTheme(
  themeId: ThemeId,
  customColors?: { primary: string; secondary: string }
) {
  const root = document.documentElement;

  // Clear previous theme-* classes
  const classes = Array.from(root.classList).filter((c) => !c.startsWith('theme-'));
  classes.push(`theme-${themeId}`, 'dark');
  root.className = classes.join(' ');

  if (themeId === 'custom') {
    const primary = customColors?.primary || '#00f0ff';
    const secondary = customColors?.secondary || '#000000';
    const rgb = hexToRgb(primary) || { r: 0, g: 240, b: 255 };

    root.style.setProperty('--bg-primary', secondary);
    root.style.setProperty('--bg-surface', adjustHexBrightness(secondary, 6));
    root.style.setProperty('--bg-subtle', adjustHexBrightness(secondary, 12));
    root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.08)');
    root.style.setProperty('--border-hover', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`);
    root.style.setProperty('--accent-color', primary);
    root.style.setProperty('--accent-300', adjustHexBrightness(primary, 20));
    root.style.setProperty('--accent-400', primary);
    root.style.setProperty('--accent-600', adjustHexBrightness(primary, -15));
    root.style.setProperty('--accent-glow', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`);
  } else {
    // Clear inline custom properties so class-level rules take effect
    root.style.removeProperty('--bg-primary');
    root.style.removeProperty('--bg-surface');
    root.style.removeProperty('--bg-subtle');
    root.style.removeProperty('--border-color');
    root.style.removeProperty('--border-hover');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--accent-300');
    root.style.removeProperty('--accent-400');
    root.style.removeProperty('--accent-600');
    root.style.removeProperty('--accent-glow');
  }
}
