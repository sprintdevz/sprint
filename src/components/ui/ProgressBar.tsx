import { View, StyleSheet, type DimensionValue } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { clamp } from '@/utils/numbers';

interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  /** Track width in points (default fills parent). */
  height?: number;
  color?: string;
  trackColor?: string;
  /** Animate on change (uses native driver where possible). */
  animated?: boolean;
  accessibilityLabel?: string;
}

/** Linear progress bar used everywhere progression is shown. */
export function ProgressBar({
  progress,
  height = 8,
  color,
  trackColor,
  animated = true,
  accessibilityLabel,
}: ProgressBarProps) {
  const { colors, radius } = useTheme();
  const width: DimensionValue = `${Math.round(clamp(progress, 0, 1) * 100)}%`;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamp(progress, 0, 1) * 100) }}
      style={[
        styles.track,
        {
          height,
          borderRadius: radius.full,
          backgroundColor: trackColor ?? colors.skeleton,
        },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: animated ? width : width,
            height: '100%',
            borderRadius: radius.full,
            backgroundColor: color ?? colors.accent,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fill: { position: 'absolute', left: 0, top: 0 },
});