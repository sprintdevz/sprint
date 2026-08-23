import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { CheetahAnimation } from '@/components/mascot/CheetahAnimation';
import type { CheetahExpression } from '@/components/mascot/Cheetah';

interface MascotBubbleProps {
  text: string;
  expression?: CheetahExpression;
  /** 'above' | 'below' | 'side' — bubble position relative to the cheetah. */
  position?: 'above' | 'below' | 'side';
  size?: number;
}

/** Cheetah + speech bubble used across onboarding, coaching and results. */
export function MascotBubble({ text, expression = 'happy', position = 'above', size = 96 }: MascotBubbleProps) {
  const { colors, radius, type, spacing } = useTheme();

  const bubble = (
    <View
      accessibilityRole="text"
      style={[
        styles.bubble,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          maxWidth: 260,
        },
      ]}
    >
      <Text style={[type.bodySmall, { color: colors.text, textAlign: 'center' }]}>{text}</Text>
      <View
        style={[
          styles.tail,
          {
            backgroundColor: colors.surface,
            left: '50%',
            marginLeft: -6,
          },
        ]}
      />
    </View>
  );

  const cheetah = <CheetahAnimation mode="idle" expression={expression} size={size} />;

  if (position === 'side') {
    return (
      <View style={styles.side}>
        {cheetah}
        {bubble}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {position === 'above' ? (
        <>
          {bubble}
          {cheetah}
        </>
      ) : (
        <>
          {cheetah}
          {bubble}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 8 },
  side: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bubble: {
    position: 'relative',
  },
  tail: {
    position: 'absolute',
    bottom: -8,
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
  },
});