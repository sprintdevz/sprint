import { useEffect, useRef } from 'react';
import { Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

export type ToastTone = 'success' | 'error' | 'info' | 'xp';

interface ToastProps {
  visible: boolean;
  message: string;
  tone?: ToastTone;
  onHide?: () => void;
  autoHideMs?: number;
}

/** Transient toast — XP gains, errors, confirmations. */
export function Toast({ visible, message, tone = 'info', onHide, autoHideMs = 2600 }: ToastProps) {
  const { colors, radius, type, spacing, shadows } = useTheme();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onHide?.(), autoHideMs);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [visible, autoHideMs, onHide]);

  if (!visible) return null;

  const bg = tones[tone].bg(colors);
  const fg = tones[tone].fg;

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(140)}
      style={[
        styles.base,
        {
          backgroundColor: bg,
          borderRadius: radius.lg,
          paddingVertical: Platform.OS === 'ios' ? 14 : 12,
          paddingHorizontal: spacing.lg,
          ...shadows.lg,
        },
      ]}
      pointerEvents="none"
      accessibilityRole="alert"
    >
      <Text style={[type.body, { color: fg, fontWeight: '700' }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const tones: Record<
  ToastTone,
  { bg: (colors: ReturnType<typeof useTheme>['colors']) => string; fg: string }
> = {
  success: { bg: () => '#16A34A', fg: '#FFFFFF' },
  error: { bg: (c) => c.danger, fg: '#FFFFFF' },
  info: { bg: (c) => c.primary, fg: '#FFFFFF' },
  xp: { bg: (c) => c.accent, fg: '#FFFFFF' },
};