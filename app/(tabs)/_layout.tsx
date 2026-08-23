import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { palette } from '@/constants/colors';
import type { IconName } from '@/types/common';

const TABS: Array<{ name: string; label: string; icon: IconName; iconActive: IconName }> = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'train', label: 'Train', icon: 'barbell-outline', iconActive: 'barbell' },
  { name: 'progress', label: 'Progress', icon: 'trending-up-outline', iconActive: 'trending-up' },
  { name: 'compete', label: 'Compete', icon: 'podium-outline', iconActive: 'podium' },
  { name: 'profile', label: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

export default function TabsLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: isDark ? palette.navy900 : colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons name={focused ? tab.iconActive : tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}