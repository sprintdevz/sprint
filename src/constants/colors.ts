/**
 * SPRINT design tokens — the visual identity of the product.
 *
 * Identity: Navy + electric blue + orange/yellow + white.
 * - Navy           → structure, contrast, dark mode foundation
 * - Electric blue  → primary actions, links, selected states
 * - Orange/yellow  → XP, rewards, streaks, achievements, energy
 * - Green          → completed activities, success
 * - Coral/red      → warnings, competitive tension (used sparingly)
 * - White          → readable content surfaces
 */

export const palette = {
  // Navy scale (structure)
  navy950: '#07132B',
  navy900: '#0B1B3A',
  navy800: '#10264E',
  navy700: '#173362',
  navy600: '#1F4278',

  // Electric blue scale (primary action)
  electric500: '#2E6BFF',
  electric600: '#1D4FD0',
  electric400: '#5B8CFF',
  electric300: '#8FB0FF',

  // Orange scale (XP, rewards, energy)
  orange500: '#FF7A1A',
  orange600: '#E56200',
  orange400: '#FF9A4D',
  orange300: '#FFBE8A',

  // Yellow (streaks, highlights)
  yellow400: '#FFC53D',
  yellow300: '#FFD76E',

  // Green (success, completion)
  green500: '#22C55E',
  green600: '#16A34A',
  green400: '#4ADE80',

  // Coral (warnings, competitive tension)
  coral500: '#FF4D5E',
  coral600: '#E02D44',
  coral400: '#FF7B88',

  // Neutrals
  white: '#FFFFFF',
  offWhite: '#F4F7FD',
  slate100: '#E8EDF7',
  slate200: '#D6DEEF',
  slate400: '#8B99B8',
  slate500: '#64718C',
  slate700: '#3B4662',
  slate900: '#1D2440',
  black: '#000000',

  // Transparent overlays
  overlay: 'rgba(7, 19, 43, 0.55)',
  hairline: 'rgba(27, 45, 82, 0.08)',
} as const;

/** Semantic color set resolved per color scheme (light / dark). */
export interface ThemeColors {
  /** App background */
  background: string;
  /** Raised surfaces: cards, sheets */
  surface: string;
  /** Elevated surfaces: modals, floating elements */
  surfaceElevated: string;
  /** Primary text */
  text: string;
  /** Secondary text */
  textSecondary: string;
  /** Muted / disabled text */
  textMuted: string;
  /** Borders / hairlines */
  border: string;
  /** Primary brand color (electric blue) */
  primary: string;
  /** Pressed state of primary */
  primaryPressed: string;
  /** Primary text on primary backgrounds */
  primaryText: string;
  /** Accent / energy color (orange) */
  accent: string;
  /** Accent text on accent backgrounds */
  accentText: string;
  /** Highligh / XP / streak color (yellow/gold) */
  gold: string;
  /** Success (green) */
  success: string;
  /** Success background tint */
  successSoft: string;
  /** Danger (coral) */
  danger: string;
  /** Danger background tint */
  dangerSoft: string;
  /** Warning (orange) */
  warning: string;
  /** Warning background tint */
  warningSoft: string;
  /** Info (electric blue) tint background */
  infoSoft: string;
  /** Brand navy used as text / structure in light mode */
  navy: string;
  /** Navy surface (hero cards, headers) */
  navySurface: string;
  /** Dark text on navy surfaces */
  onNavy: string;
  /** Muted text on navy surfaces */
  onNavyMuted: string;
  /** Input background */
  inputBackground: string;
  /** Skeleton shimmer base */
  skeleton: string;
  /** Toast / overlay dim */
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: '#F4F7FD',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: palette.navy900,
  textSecondary: palette.slate500,
  textMuted: palette.slate400,
  border: palette.hairline,
  primary: palette.electric500,
  primaryPressed: palette.electric600,
  primaryText: '#FFFFFF',
  accent: palette.orange500,
  accentText: '#FFFFFF',
  gold: palette.yellow400,
  success: palette.green500,
  successSoft: '#E7F9EE',
  danger: palette.coral500,
  dangerSoft: '#FFE9EC',
  warning: palette.orange500,
  warningSoft: '#FFF0E0',
  infoSoft: '#E8EFFF',
  navy: palette.navy900,
  navySurface: palette.navy900,
  onNavy: '#FFFFFF',
  onNavyMuted: '#A9BBD9',
  inputBackground: '#EEF2FA',
  skeleton: '#E4EAF5',
  overlay: palette.overlay,
};

export const darkColors: ThemeColors = {
  background: palette.navy950,
  surface: palette.navy900,
  surfaceElevated: palette.navy800,
  text: '#F2F6FF',
  textSecondary: '#A6B3CF',
  textMuted: '#76839F',
  border: 'rgba(255, 255, 255, 0.08)',
  primary: palette.electric400,
  primaryPressed: palette.electric500,
  primaryText: '#06122B',
  accent: palette.orange400,
  accentText: palette.navy950,
  gold: palette.yellow400,
  success: palette.green400,
  successSoft: 'rgba(34, 197, 94, 0.14)',
  danger: palette.coral400,
  dangerSoft: 'rgba(255, 77, 94, 0.14)',
  warning: palette.orange400,
  warningSoft: 'rgba(255, 122, 26, 0.16)',
  infoSoft: 'rgba(46, 107, 255, 0.16)',
  navy: palette.navy800,
  navySurface: palette.navy800,
  onNavy: '#FFFFFF',
  onNavyMuted: '#B9C6E2',
  inputBackground: palette.navy800,
  skeleton: '#1B3158',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

/** Brand color used per sport. */
export const sportColors: Record<string, { primary: string; secondary: string }> = {
  basketball: { primary: palette.orange500, secondary: palette.electric500 },
  soccer: { primary: palette.green500, secondary: palette.navy900 },
  tennis: { primary: palette.green400, secondary: palette.yellow400 },
};