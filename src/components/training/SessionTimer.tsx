import { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatClock } from '@/utils/formatting';
import { countdown as hapticCountdown } from '@/services/haptics';

interface SessionTimerProps {
  /** Active seconds remaining, or null to run continuously. */
  running: boolean;
  startAt?: number | null;
  /** Fixed countdown duration (sec), null for count-up. */
  durationSec?: number | null;
  onComplete?: () => void;
}

/** Session / drill timer — counts up (session) or down (rest). */
export function SessionTimer({ running, startAt, durationSec = null, onComplete }: SessionTimerProps) {
  const { colors, type } = useTheme();
  const [now, setNow] = useState(Date.now());
  const done = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    done.current = false;
  }, [durationSec]);

  const started = startAt ?? now;
  const elapsed = Math.max(0, (now - started) / 1000);
  const remaining = durationSec != null ? Math.max(0, durationSec - elapsed) : null;
  const display = remaining != null ? remaining : elapsed;

  useEffect(() => {
    if (running && durationSec != null && remaining !== null && remaining <= 0 && !done.current) {
      done.current = true;
      void hapticCountdown();
      onComplete?.();
    }
    // haptic on low rest (3..1)
    if (running && remaining !== null && remaining <= 3 && remaining > 0) {
      void hapticCountdown();
    }
  }, [running, remaining, durationSec, onComplete]);

  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${Math.round(display)} seconds`}>
      <Text style={[type.displayLarge, { color: colors.text, fontVariant: ['tabular-nums'] }]}>
        {formatClock(display)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
});