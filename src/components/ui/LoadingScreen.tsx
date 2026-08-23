import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { MascotBubble } from '@/components/mascot/MascotBubble';

interface LoadingScreenProps {
  label?: string;
  /** Full-screen (no header) or embedded. */
  fullScreen?: boolean;
}

/** Branded loading state — never a blank screen. */
export function LoadingScreen({ label = 'Loading…', fullScreen = true }: LoadingScreenProps) {
  const { colors, type, spacing } = useTheme();

  return (
    <View style={[styles.base, fullScreen && styles.fullScreen, { backgroundColor: colors.background }]}>
      <MascotBubble text="Loading…" position="below" />
      <Text style={[type.body, { color: colors.textSecondary, marginTop: spacing.lg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  fullScreen: { flex: 1 },
});