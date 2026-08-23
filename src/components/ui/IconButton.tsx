import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { tap as hapticTap } from '@/services/haptics';
import type { IconName } from '@/types/common';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  size?: number;
  color?: string;
  /** Background circle. */
  raised?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon,
  onPress,
  size = 22,
  color,
  raised = false,
  disabled,
  accessibilityLabel,
  style,
}: IconButtonProps) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? icon}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={10}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          width: size + 24,
          height: size + 24,
          borderRadius: radius.lg,
          backgroundColor: raised ? colors.surface : 'transparent',
          opacity: pressed ? 0.7 : disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size} color={color ?? colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});