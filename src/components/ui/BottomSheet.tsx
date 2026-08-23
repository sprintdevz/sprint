import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal as RNModal, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Bottom sheet used for session options, confirmations, pickers. */
export function BottomSheet({ visible, onClose, title, children }: BottomSheetProps) {
  const { colors, radius, type, spacing, shadows } = useTheme();
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(400);
  const height = Math.min(Dimensions.get('window').height * 0.72, 560);

  useEffect(() => {
    translateY.value = withSpring(visible ? 0 : 400, { damping: 20, stiffness: 220 });
  }, [visible, translateY]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <Animated.View
          style={[
            styles.sheet,
            {
              height,
              backgroundColor: colors.surfaceElevated,
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
              padding: spacing['2xl'],
              ...shadows.lg,
            },
            reduceMotion ? undefined : sheetStyle,
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.skeleton }]} />
          {title && <Text style={[styles.title, { color: colors.text, marginBottom: spacing.lg }]}>{title}</Text>}
          {children}
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { width: '100%' },
  grabber: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
});