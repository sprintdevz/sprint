import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

interface AthleteHeaderProps {
  name: string | null;
  sportName: string;
  position?: string | null;
  avatarUrl?: string | null;
  streakDays?: number;
  onAvatarPress?: () => void;
}

/** Top of the home screen: "Hey, Alex!" + streak chip. */
export function AthleteHeader({ name, sportName, position, avatarUrl, streakDays = 0, onAvatarPress }: AthleteHeaderProps) {
  const { colors, type, spacing } = useTheme();
  const first = (name ?? 'Athlete').split(' ')[0] ?? 'Athlete';

  return (
    <View style={styles.wrap}>
      <Avatar name={name} uri={avatarUrl} size={44} />
      <View style={styles.info}>
        <Text style={[type.sectionTitle, { color: colors.text }]}>Hey, {first}!</Text>
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>
          {sportName}
          {position ? ` · ${position}` : ''}
        </Text>
      </View>
      <View style={styles.right}>
        {streakDays > 0 && (
          <View style={[styles.streak, { backgroundColor: colors.warningSoft, borderRadius: spacing.sm }]}>
            <Text style={[type.caption, { color: colors.warning, fontWeight: '800' }]}>
              🔥 {streakDays} DAY STREAK
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  info: { flex: 1 },
  right: { alignItems: 'flex-end' },
  streak: { paddingHorizontal: 10, paddingVertical: 6 },
});