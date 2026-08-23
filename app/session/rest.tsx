import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { RestTimer } from '@/components/training/RestTimer';
import { MascotBubble } from '@/components/mascot/MascotBubble';

/** REST phase between challenges. */
export default function RestScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const goNext = () => {
    router.replace('/session/challenge');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MascotBubble text="Breathe. The next one is waiting." expression="happy" position="above" size={80} />
      <RestTimer seconds={30} onComplete={goNext} onSkip={goNext} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});