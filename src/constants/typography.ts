import { TextStyle } from 'react-native';

/**
 * SPRINT typography — bold, athletic, high-impact.
 * Display type uses Space Grotesk (bundled via @expo-google-fonts/space-grotesk).
 * Body copy falls back to the system font for optimal readability and
 * dynamic-type support.
 */

export const fontFamilies = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_600SemiBold',
  displayLight: 'SpaceGrotesk_500Medium',
  /** System font */
  body: 'System',
} as const;

export type FontFamily = keyof typeof fontFamilies;

export const fontSizes = {
  /** 11 — captions, badges */
  caption: 11,
  /** 12 — labels, helper text */
  xs: 12,
  /** 14 — default body */
  md: 14,
  /** 16 — emphasized body */
  lg: 16,
  /** 18 — section titles */
  xl: 18,
  /** 22 — card titles */
  '2xl': 22,
  /** 28 — screen titles */
  '3xl': 28,
  /** 34 — hero numbers (ratings, XP) */
  '4xl': 34,
  /** 44 — ELO reveal */
  '5xl': 44,
} as const;

export type FontSize = keyof typeof fontSizes;

export const lineHeights: Record<FontSize, number> = {
  caption: 14,
  xs: 16,
  md: 20,
  lg: 22,
  xl: 24,
  '2xl': 28,
  '3xl': 34,
  '4xl': 40,
  '5xl': 50,
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 1,
  caps: 1.6,
} as const;

interface TypeStyle extends TextStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

function makeStyle(
  size: FontSize,
  family: FontFamily,
  letter: number = letterSpacing.normal,
): TypeStyle {
  return {
    fontFamily: fontFamilies[family],
    fontSize: fontSizes[size],
    lineHeight: lineHeights[size],
    letterSpacing: letter,
  };
}

/** Precomposed text style presets. */
export const type = {
  /** Big display numerals: ELO, XP, reps. */
  displayHero: makeStyle('5xl', 'display', letterSpacing.tight),
  displayLarge: makeStyle('4xl', 'display', letterSpacing.tight),
  displayTitle: makeStyle('3xl', 'display', letterSpacing.tight),
  title: makeStyle('2xl', 'displayMedium'),
  sectionTitle: makeStyle('xl', 'displayMedium'),
  body: makeStyle('md', 'body'),
  bodySmall: makeStyle('xs', 'body'),
  caption: makeStyle('caption', 'body', letterSpacing.caps),
  label: makeStyle('xs', 'displayMedium', letterSpacing.caps),
  button: makeStyle('lg', 'displayMedium'),
  stat: makeStyle('4xl', 'display'),
  statSmall: makeStyle('2xl', 'display'),
} as const;

export type TypePreset = keyof typeof type;