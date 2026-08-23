import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { CircularProgress } from '@/components/ui/CircularProgress';
import type { IconName } from '@/types/common';

export interface SkillNodeProps {
  name: string;
  /** 0..1 */
  mastery: number;
  rating: number;
  stageLabel: string;
  stageColor: string;
  icon?: IconName;
  locked?: boolean;
  isWeakest?: boolean;
  onPress?: () => void;
}

/** One node in the skill tree — a skill with its mastery ring. */
export function SkillNode({ name, mastery, rating, stageLabel, stageColor, icon = 'basketball', locked, isWeakest, onPress }: SkillNodeProps) {
  const { colors, radius, type } = useTheme();

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.node,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: 12,
          borderWidth: isWeakest ? 2 : 1,
          borderColor: isWeakest ? colors.accent : colors.border,
          opacity: locked ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <CircularProgress progress={mastery} size={46} strokeWidth={4} color={locked ? colors.textMuted : stageColor} label="" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
          {name}
        </Text>
        <Text style={[type.caption, { color: stageColor, fontSize: 9, fontWeight: '700' }]}>
          {locked ? 'LOCKED' : stageLabel.toUpperCase()}
        </Text>
        <Text style={[type.caption, { color: colors.textMuted, fontSize: 10, fontVariant: ['tabular-nums'] }]}>
          {Math.round(rating)}
        </Text>
      </View>
      <Ionicons name={locked ? 'lock-closed' : 'chevron-forward'} size={16} color={locked ? colors.textMuted : colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  node: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});