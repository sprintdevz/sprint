import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
}

/** Avatar with initials fallback. */
export function Avatar({ name, uri, size = 48 }: AvatarProps) {
  const { colors, radius, type } = useTheme();
  const initials = (name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View
      accessibilityLabel={`Avatar for ${name ?? 'athlete'}`}
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: colors.navySurface,
        },
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: radius.full }} />
      ) : (
        <Text style={[type.label, { color: colors.onNavy, fontSize: size * 0.35 }]}>{initials || '?'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});