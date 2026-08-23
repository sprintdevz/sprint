import { Pressable, View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Raised emphasis (hero cards). */
  emphasis?: boolean;
  /** Strong navy hero card (dark + light safe). */
  navy?: boolean;
  onPress?: () => void;
}

/** Rounded surface card — the core content container. */
export function Card({ children, style, emphasis = false, navy = false, onPress }: CardProps) {
  const { colors, radius, shadows, spacing } = useTheme();
  const bg = navy ? colors.navySurface : emphasis ? colors.surfaceElevated : colors.surface;

  const shell = [
    styles.base,
    {
      backgroundColor: bg,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: navy ? 0 : StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...(emphasis ? shadows.md : shadows.sm),
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [shell, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }

  return <View style={shell}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
  },
});