import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatDelta } from '@/utils/formatting';
import { Ionicons } from '@expo/vector-icons';

interface RatingChangeProps {
  delta: number;
  size?: 'sm' | 'lg';
}

/** Animated-feel rating delta chip — green up / red down / neutral. */
export function RatingChange({ delta, size = 'sm' }: RatingChangeProps) {
  const { colors, type } = useTheme();
  const up = delta > 0;
  const down = delta < 0;
  const color = up ? colors.success : down ? colors.danger : colors.textMuted;

  return (
    <View style={styles.wrap} accessible accessibilityLabel={`${up ? 'Up' : down ? 'Down' : 'No change'} ${Math.abs(delta)} rating`}>
      <Ionicons
        name={up ? 'arrow-up' : down ? 'arrow-down' : 'remove'}
        size={size === 'lg' ? 20 : 14}
        color={color}
      />
      <Text
        style={[
          size === 'lg' ? type.statSmall : type.bodySmall,
          { color, fontWeight: '800', fontVariant: ['tabular-nums'] },
        ]}
      >
        {formatDelta(delta)}
      </Text>
    </View>
  );
}

function format(d: number): string {
  return d > 0 ? `+${Math.round(d)}` : `${Math.round(d)}`;
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});