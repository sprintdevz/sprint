import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { SessionTimer } from '@/components/training/SessionTimer';
import { Button } from '@/components/ui/Button';

interface RestTimerProps {
  /** Rest duration in seconds. */
  seconds?: number;
  onComplete: () => void;
  onSkip: () => void;
}

/** Rest phase between challenges — countdown with skip. */
export function RestTimer({ seconds = 30, onComplete, onSkip }: RestTimerProps) {
  const { colors, type, spacing } = useTheme();
  const [startedAt] = useState(() => Date.now());
  const [running, setRunning] = useState(true);

  return (
    <View style={{ alignItems: 'center', gap: spacing.lg, padding: spacing['2xl'] }}>
      <Text style={[type.caption, { color: colors.textMuted }]}>REST</Text>
      <SessionTimer running={running} startAt={startedAt} durationSec={seconds} onComplete={onComplete} />
      <Text style={[type.bodySmall, { color: colors.textSecondary, textAlign: 'center' }]}>
        Catch your breath. Next challenge starts automatically.
      </Text>
      <Button label="SKIP REST →" variant="ghost" onPress={() => { setRunning(false); onSkip(); }} />
    </View>
  );
}