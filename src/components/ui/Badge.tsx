import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Tone = 'primary' | 'accent' | 'gold' | 'success' | 'danger' | 'navy' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: Tone;
  /** Optional leading icon glyph (emoji or icon name omitted — keep text only). */
  dot?: boolean;
}

/** Small status / league / reward tag. */
export function Badge({ label, tone = 'neutral', dot = false }: BadgeProps) {
  const { colors, radius, type, spacing } = useTheme();
  const toneStyle = toneStyles[tone];

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.base,
        {
          backgroundColor: toneStyle.bg(colors),
          borderRadius: radius.full,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.xs,
        },
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: toneStyle.fg(colors) }]} />}
      <Text style={[type.caption, { color: toneStyle.fg(colors), fontSize: 10 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

const toneStyles = {
  neutral: {
    bg: (c: ReturnType<typeof useTheme>['colors']) => c.surface,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.textSecondary,
  },
  navy: {
    bg: (c: ReturnType<typeof useTheme>['colors']) => c.navySurface,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.onNavy,
  },
  accent: {
    bg: (c: ReturnType<typeof useTheme>['colors']) => c.warningSoft,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.warning,
  },
  gold: {
    bg: (c: ReturnType<typeof useTheme>['colors']) => c.warningSoft,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.warning,
  },
  success: {
    bg: (c: ReturnType<typeof useTheme>['colors']) => c.successSoft,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.success,
  },
  danger: {
    bg: (c: ReturnType<typeof useTheme>['colors']) => c.dangerSoft,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.danger,
  },
  primary: {
    bg: (c: ReturnType<typeof useTheme>['colors']) => c.infoSoft,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.primary,
  },
} as const;