import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { CompetitiveChallenge } from '@/features/competition/types';
import { formatXp } from '@/utils/formatting';
import { Card } from '@/components/ui/Card';

interface ChallengeCardProps {
  challenge: CompetitiveChallenge;
  onPress?: () => void;
}

/** Weekly / seasonal community challenge card. */
export function ChallengeCard({ challenge, onPress }: ChallengeCardProps) {
  const { colors, type, spacing } = useTheme();
  const target = Number(challenge.target?.n ?? 1);
  const progress = Math.min(1, (challenge.progress ?? 0) / target);
  const done = challenge.completed ?? false;

  return (
    <Card onPress={onPress} style={done ? { borderColor: colors.success } : undefined}>
      <View style={styles.top}>
        <View style={{ flex: 1 }}>
          <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>WEEKLY CHALLENGE</Text>
          <Text style={[type.sectionTitle, { color: colors.text, marginTop: 2 }]}>{challenge.title}</Text>
        </View>
        <View style={[styles.xp, { backgroundColor: colors.warningSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }]}>
          <Text style={[type.label, { color: colors.warning, fontSize: 11 }]}>{formatXp(challenge.rewardXp)}</Text>
        </View>
      </View>
      {challenge.description && (
        <Text style={[type.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>{challenge.description}</Text>
      )}
      <View style={{ marginTop: spacing.md, gap: 4 }}>
        <ProgressBar progress={progress} color={done ? colors.success : colors.accent} />
        <Text style={[type.caption, { color: colors.textMuted, fontSize: 10 }]}>
          {done ? 'COMPLETED' : `${challenge.progress ?? 0}/${target} ${challenge.metric}`}
        </Text>
      </View>
      {challenge.premium && (
        <View style={[styles.pro, { backgroundColor: colors.infoSoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8, alignSelf: 'flex-start' }]}>
          <Text style={[type.caption, { color: colors.primary, fontSize: 9 }]}>PRO CHALLENGE</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', gap: 10 },
  xp: {},
  pro: {},
});