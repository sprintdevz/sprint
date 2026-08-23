import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ThemeColors } from '@/constants/colors';
import { spacing, radius, shadows } from '@/constants/spacing';
import { type } from '@/constants/typography';
import { springs, durations, easing } from '@/constants/animations';

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
  type: typeof type;
  springs: typeof springs;
  durations: typeof durations;
  easing: typeof easing;
}

/**
 * Resolves the active semantic theme.
 * Every screen should derive its styles from this hook so dark mode,
 * high-contrast and future theming stay centralized.
 */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
    spacing,
    radius,
    shadows,
    type,
    springs,
    durations,
    easing,
  };
}