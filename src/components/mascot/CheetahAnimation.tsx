import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Cheetah, type CheetahExpression, type CheetahProps } from '@/components/mascot/Cheetah';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type AnimationMode = 'idle' | 'bounce' | 'celebration' | 'run';

interface CheetahAnimationProps extends Omit<CheetahProps, 'pose'> {
  mode?: AnimationMode;
  expression?: CheetahExpression;
  size?: number;
  pose?: CheetahProps['pose'];
}

/**
 * Animated cheetah.
 * - idle: subtle breathing/ear twitch
 * - bounce: playful idle ground bounce
 * - celebration: victory hop (results, achievements)
 * - run: horizontal dash (session intro)
 * Honors reduced-motion — falls back to static idle pose.
 */
export function CheetahAnimation({
  mode = 'idle',
  expression = 'happy',
  size = 120,
  pose,
}: CheetahAnimationProps) {
  const reduceMotion = useReducedMotion();
  const y = useSharedValue(0);
  const x = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    if (mode === 'idle') {
      y.value = withRepeat(withSequence(withTiming(-4, { duration: 900, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 900, easing: Easing.inOut(Easing.quad) })), -1, true);
    } else if (mode === 'bounce') {
      y.value = withRepeat(withSequence(withSpring(-16, { damping: 6, stiffness: 140 }), withSpring(0, { damping: 10, stiffness: 160 })), -1);
    } else if (mode === 'celebration') {
      y.value = withSequence(withSpring(-26, { damping: 8, stiffness: 130 }), withSpring(0, { damping: 6, stiffness: 110 }));
      scale.value = withSequence(withSpring(1.15, { damping: 8, stiffness: 160 }), withSpring(1, { damping: 10, stiffness: 140 }));
      rotate.value = withSequence(withTiming(-5, { duration: 120 }), withTiming(6, { duration: 160 }), withTiming(0, { duration: 140 }));
    } else if (mode === 'run') {
      x.value = withRepeat(withTiming(28, { duration: 500, easing: Easing.linear }), 2, true);
      rotate.value = withRepeat(withTiming(3, { duration: 500, easing: Easing.linear }), 2, true);
    }
    return () => {
      y.value = 0;
      x.value = 0;
      scale.value = 1;
      rotate.value = 0;
    };
  }, [mode, reduceMotion, y, x, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { translateX: x.value }, { rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]} accessible accessibilityLabel="SPRINT cheetah mascot">
      <Cheetah size={size} expression={expression} pose={mode === 'run' ? 'running' : pose} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
});