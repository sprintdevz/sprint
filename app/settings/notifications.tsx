import { useState } from 'react';
import { ScrollView, View, Text, Switch, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { useNotifications } from '@/hooks/useNotifications';
import type { NotificationPreferences } from '@/features/notifications/types';
import { type } from '@/constants/typography';

const ROWS: Array<{ key: keyof NotificationPreferences; label: string; hint: string }> = [
  { key: 'sessionReminders', label: 'Session reminders', hint: 'Your 25-minute session is waiting.' },
  { key: 'streakAlerts', label: 'Streak alerts', hint: 'One session keeps your streak alive.' },
  { key: 'milestoneAlerts', label: 'Milestone alerts', hint: 'You are 18 ELO away from Gold II.' },
  { key: 'challengeAlerts', label: 'Challenge alerts', hint: 'Your weekly challenge ends tomorrow.' },
  { key: 'friendActivity', label: 'Friend activity', hint: 'A friend just beat a personal best.' },
];

/** Full notification control — contextual only, never spam. */
export default function NotificationsSettingsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { prefs, setPrefs, ask } = useNotifications();
  const [permission, setPermission] = useState<boolean | null>(null);

  const toggle = (key: keyof NotificationPreferences) => {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  };

  const enable = async () => {
    const ok = await ask();
    setPermission(ok);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 12 }}>
      <Text style={[type.displayTitle, { color: colors.text }]}>Notifications</Text>
      <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
        Useful, contextual, never spammy. Complete control — off means off.
      </Text>

      {permission === false && (
        <Text style={[type.bodySmall, { color: colors.danger }]}>
          Notifications are disabled on this device. Enable them in system settings.
        </Text>
      )}

      {ROWS.map((row) => (
        <SwitchRow key={row.key} label={row.label} hint={row.hint} value={Boolean(prefs[row.key])} onToggle={() => toggle(row.key)} />
      ))}

      <Button label="ENABLE NOTIFICATIONS" variant="secondary" onPress={() => void enable()} />
    </ScrollView>
  );
}

function SwitchRow({ label, hint, value, onToggle }: { label: string; hint: string; value: boolean; onToggle: () => void }) {
  const { colors, radius, type } = useTheme();
  return (
    <View style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={[type.bodySmall, { color: colors.text, fontWeight: '700' }]}>{label}</Text>
        <Text style={[type.caption, { color: colors.textMuted, fontSize: 10, marginTop: 2 }]}>{hint}</Text>
      </View>
      <SwitchTrack value={value} onPress={onToggle} />
    </View>
  );
}

function SwitchTrack({ value, onPress }: { value: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Switch
      accessibilityLabel="Toggle"
      value={value}
      onValueChange={onPress}
      trackColor={{ false: colors.skeleton, true: colors.primary }}
      thumbColor="#FFFFFF"
    />
  );
}

const styles = StyleSheet.create({});