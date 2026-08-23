import { Pressable, ActivityIndicator, StyleSheet, Text, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { press as hapticPress } from '@/services/haptics';
import type { IconName } from '@/types/common';

const variantColors = {
  primary: {
    background: (c: ReturnType<typeof useTheme>['colors']) => c.primary,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.primaryText,
  },
  secondary: {
    background: (c: ReturnType<typeof useTheme>['colors']) => c.surface,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.text,
  },
  outline: {
    background: (c: ReturnType<typeof useTheme>['colors']) => 'transparent',
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.primary,
  },
  ghost: {
    background: (c: ReturnType<typeof useTheme>['colors']) => 'transparent',
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.textSecondary,
  },
  accent: {
    background: (c: ReturnType<typeof useTheme>['colors']) => c.accent,
    fg: (c: ReturnType<typeof useTheme>['colors']) => c.accentText,
  },
  danger: {
    background: (c: ReturnType<typeof useTheme>['colors']) => c.danger,
    fg: (c: ReturnType<typeof useTheme>['colors']) => '#FFFFFF',
  },
} as const;

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconAfter?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Primary call-to-action button with haptic feedback and loading state. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  iconAfter,
  style,
  testID,
}: ButtonProps) {
  const { colors, radius, type, spacing } = useTheme();

  const background = variantColors[variant].background(colors);
  const fg = variantColors[variant].fg(colors);
  const dim = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: dim, busy: loading }}
      disabled={dim}
      onPress={() => {
        hapticPress();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderRadius: radius.lg,
          paddingHorizontal: size === 'lg' ? spacing['2xl'] : spacing.lg,
          paddingVertical: size === 'sm' ? spacing.sm : size === 'md' ? spacing.md : spacing.lg,
          opacity: dim ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text
          style={[
            type.button,
            {
              color: fg,
              fontSize: size === 'sm' ? 14 : type.button.fontSize,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
  },
});