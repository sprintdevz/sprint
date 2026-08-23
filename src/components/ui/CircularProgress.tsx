import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';
import { clamp } from '@/utils/numbers';

interface CircularProgressProps {
  /** 0..1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Center label. */
  label?: string;
  sublabel?: string;
}

/** Ring progress — used for mastery, league progress, session rings. */
export function CircularProgress({
  progress,
  size = 64,
  strokeWidth = 6,
  color,
  trackColor,
  label,
  sublabel,
}: CircularProgressProps) {
  const { colors, type } = useTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * clamp(progress, 0, 1);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor ?? colors.surface}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color ?? colors.accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {(label || sublabel) && (
        <View style={styles.center}>
          {label && <Text style={[type.statSmall, { color: colors.text }]}>{label}</Text>}
          {sublabel && <Text style={[type.caption, { color: colors.textMuted, fontSize: 9 }]}>{sublabel}</Text>}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});