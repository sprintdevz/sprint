import { useEffect } from 'react';
import { Redirect } from 'expo-router';

/** Profile → settings shortcut. */
export default function ProfileSettingsScreen() {
  useEffect(() => undefined, []);
  return <Redirect href="/settings/index" />;
}