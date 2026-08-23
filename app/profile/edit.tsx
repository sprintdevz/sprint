import { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useUserStore } from '@/store/userStore';
import { type } from '@/constants/typography';

/** Edit profile — name, username, avatar (upload wired via storage service). */
export default function EditProfileScreen() {
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useUserStore((s) => s.profile);
  const update = useUserStore((s) => s.updateProfile);
  const [name, setName] = useState(profile?.fullName ?? '');
  const [username, setUsername] = useState(profile?.username ?? '');
  const [saved, setSaved] = useState(false);

  const save = () => {
    update({ fullName: name.trim(), username: username.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 16 }}>
      <Text style={[type.displayTitle, { color: colors.text }]}>Edit profile</Text>
      <View style={{ alignItems: 'center', marginTop: 8 }}>
        <Avatar name={name} uri={profile?.avatarUrl} size={88} />
      </View>

      <Text style={[type.label, { color: colors.textSecondary }]}>FULL NAME</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.textMuted}
        style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />

      <Text style={[type.label, { color: colors.textSecondary }]}>USERNAME</Text>
      <TextInput value={username} onChangeText={setUsername} placeholder="Username" placeholderTextColor={colors.textMuted} autoCapitalize="none"
        style={[styles.input, { backgroundColor: colors.inputBackground, borderRadius: radius.md, color: colors.text }]} />

      <Button label="SAVE CHANGES" onPress={save} size="lg" disabled={!name.trim()} />
      {saved && <Text style={[type.bodySmall, { color: colors.success, textAlign: 'center' }]}>Saved ✓</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: { padding: 16, fontSize: 16 },
});