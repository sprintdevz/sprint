import { Pressable, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { tap as hapticTap, success as hapticSuccess } from '@/services/haptics';

interface ExerciseCounterProps {
  achieved: number;
  target: number;
  onIncrement: () => void;
  onIncrementBy?: (amount: number) => void;
  disabled?: boolean;
  size?: 'md' | 'lg';
}

/** Big tap-to-count — the satisfying rep counter. */
export function ExerciseCounter({ achieved, target, onIncrement, onIncrementBy, disabled, size = 'lg' }: ExerciseCounterProps) {
  const { colors, radius, type, spacing } = useTheme();
  const big = size === 'lg';
  const complete = achieved >= target;

  return (
    <View style={styles.wrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add rep"
        disabled={disabled || complete}
        onPress={() => {
          if (achieved + 1 >= target) void hapticSuccess();
          else void hapticTap();
          onIncrement();
        }}
        style={({ pressed }) => [
          styles.counter,
          {
            width: big ? 120 : 96,
            height: big ? 120 : 96,
            borderRadius: radius.full,
            backgroundColor: complete ? colors.success : colors.navySurface,
            borderWidth: 6,
            borderColor: complete ? colors.successSoft : colors.primary,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Text style={[type.displayHero, { color: complete ? '#FFFFFF' : colors.onNavy, fontSize: big ? 40 : 32 }]}>
          {achieved}
        </Text>
        <Text style={[type.caption, { color: complete ? '#FFFFFF' : colors.onNavyMuted, fontSize: 10 }]}>
          / {target} TARGET
        </Text>
      </Pressable>

      {onIncrementBy && (
        <View style={[styles.quickRow, { marginTop: spacing.md }]}>
          {[5, 10].map((n) => (
            <Pressable
              key={n}
              onPress={() => onIncrementBy(n)}
              style={[styles.quick, { backgroundColor: colors.surface, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.xs }]}
            >
              <Text style={[type.label, { color: colors.primary, fontSize: 12 }]}>+{n}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  counter: { alignItems: 'center', justifyContent: 'center' },
  quickRow: { flexDirection: 'row', gap: 8 },
  quick: { alignSelf: 'center' },
});