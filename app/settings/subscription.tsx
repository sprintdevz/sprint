import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { PLANS } from '@/features/subscription/types';
import { useSubscription } from '@/hooks/useSubscription';
import { useUserStore } from '@/store/userStore';
import { trackEvent } from '@/services/analytics';
import { type } from '@/constants/typography';

/** Paywall — Pro comparison, pricing from config (never hardcoded in screens). */
export default function SubscriptionScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { isPro } = useSubscription();
  const user = useUserStore((s) => s.user);
  const pro = PLANS.find((p) => p.id === 'pro')!;
  const free = PLANS.find((p) => p.id === 'free')!;

  const upgrade = () => {
    trackEvent('paywall_viewed', { plan: 'pro' });
    trackEvent('subscription_started', { plan: 'pro' });
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 32, paddingHorizontal: 24, gap: 16 }}>
      <Text style={[type.displayTitle, { color: colors.text }]}>Upgrade your climb.</Text>
      <Text style={[type.bodySmall, { color: colors.textSecondary }]}>
        ELO is always free. Pro unlocks the full training lab.
      </Text>

      {isPro && <Badge label="CURRENTLY ON PRO" tone="gold" />}

      <Card style={{ borderColor: colors.primary, borderWidth: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={[type.title, { color: colors.text }]}>{pro.name}</Text>
          <Text style={[type.statSmall, { color: colors.primary }]}>${pro.priceMonthly}<Text style={{ fontSize: 12 }}>/mo</Text></Text>
        </View>
        {pro.features.map((f) => (
          <Row key={f} text={f} />
        ))}
        <Button label={isPro ? 'MANAGE SUBSCRIPTION' : 'GO PRO'} size="lg" onPress={upgrade} disabled={isPro} />
      </Card>

      <Card>
        <Text style={[type.bodySmall, { color: colors.textMuted }]}>
          FREE — {free.tagline} ({free.features[2] ?? ''})
        </Text>
      </Card>

      <Text style={[type.caption, { color: colors.textMuted, fontSize: 9, textAlign: 'center' }]}>
        Cancel anytime. Pricing managed in config — ask your coach for team plans.
      </Text>
      {void user}
    </ScrollView>
  );
}

function Row({ text }: { text: string }) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 }}>
      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
      <Text style={[type.bodySmall, { color: colors.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({});