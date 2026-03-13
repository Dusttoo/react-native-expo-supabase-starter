import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { router, type Href } from 'expo-router'
import { useSubscriptionTier } from '@/hooks/useSubscription'

interface FeatureCardProps {
  title: string
  description: string
  tier: 'free' | 'pro' | 'premium'
  isUnlocked: boolean
}

function FeatureCard({ title, description, tier, isUnlocked }: FeatureCardProps) {
  const TIER_COLORS: Record<string, string> = {
    free: '#6B7280',
    pro: '#3B82F6',
    premium: '#F59E0B',
  }

  return (
    <View style={[styles.card, !isUnlocked && styles.cardLocked]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={[styles.tierPill, { backgroundColor: TIER_COLORS[tier] }]}>
          <Text style={styles.tierPillText}>{tier.charAt(0).toUpperCase() + tier.slice(1)}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{description}</Text>

      {!isUnlocked && (
        <TouchableOpacity style={styles.lockRow} onPress={() => router.push('/paywall' as Href)}>
          <Text style={styles.lockIcon}>🔒</Text>
          <Text style={styles.lockText}>
            Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)} to unlock
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default function HomeScreen() {
  const { isPro, isPremium, requiresTier } = useSubscriptionTier()

  const features = [
    {
      title: 'Core Dashboard',
      description: 'Access your main dashboard and basic analytics.',
      tier: 'free' as const,
      isUnlocked: true,
    },
    {
      title: 'Advanced Analytics',
      description: 'Deep-dive reports, custom date ranges, and export to CSV.',
      tier: 'pro' as const,
      isUnlocked: requiresTier('pro'),
    },
    {
      title: 'Priority Support',
      description: 'Dedicated support with a guaranteed 4-hour response time.',
      tier: 'pro' as const,
      isUnlocked: requiresTier('pro'),
    },
    {
      title: 'Custom Integrations',
      description: 'Connect your own tools via webhook and REST API.',
      tier: 'premium' as const,
      isUnlocked: requiresTier('premium'),
    },
  ]

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Home</Text>
      <Text style={styles.subheading}>
        {isPremium
          ? 'You have full access to all features.'
          : isPro
          ? 'Upgrade to Premium to unlock everything.'
          : 'Upgrade to unlock more features.'}
      </Text>

      <View style={styles.featureList}>
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </View>

      {!isPremium && (
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => router.push('/paywall' as Href)}
        >
          <Text style={styles.upgradeText}>
            ⚡ {isPro ? 'Upgrade to Premium' : 'Upgrade to Pro'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 28,
    lineHeight: 22,
  },
  featureList: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    gap: 6,
  },
  cardLocked: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tierPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  lockIcon: {
    fontSize: 13,
  },
  lockText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  upgradeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
})
