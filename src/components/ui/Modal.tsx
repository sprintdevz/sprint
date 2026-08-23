import { Modal as RNModal, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { IconButton } from '@/components/ui/IconButton';

interface ModalProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Accessible modal with dim overlay and close affordance. */
export function Modal({ visible, title, onClose, children }: ModalProps) {
  const { colors, radius, type, spacing } = useTheme();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: colors.overlay }]} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius['2xl'],
              padding: spacing['2xl'],
              maxWidth: 520,
              width: '100%',
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[type.title, { color: colors.text }]}>{title}</Text>
            <IconButton icon="close" onPress={onClose} accessibilityLabel="Close" size={20} />
          </View>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    ...Platform.select({
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.3, shadowRadius: 32, elevation: 12 },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});