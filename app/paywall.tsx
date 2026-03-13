import { useState, useEffect } from 'react'
import { router } from 'expo-router'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useOfferings, usePurchasePackage, useRestorePurchases, useSubscriptionTier } from '@/hooks/useSubscription'
import { SubscriptionPackage } from '@/types'

const FEATURE_LIST: Record<'pro' | 'premium', string[]> = {
  pro: [
    'Unlimited access to all core features',
    'Priority support',
    'No ads',
  ],
  premium: [
    'Everything in Pro',
    'Early access to new features',
    'Dedicated support',
    'Custom integrations',
  ],
}

function PackageCard({
  pkg,
  isSelected,
  onSelect,
}: {
  pkg: SubscriptionPackage
  isSelected: boolean
  onSelect: () => void
}) {
  const isAnnual = pkg.packageType === 'ANNUAL'
  return (
    <TouchableOpacity
      style={[styles.packageCard, isSelected && styles.packageCardSelected]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      <View style={styles.packageRow}>
        <View>
          <Text style={styles.packageTitle}>
            {isAnnual ? 'Annual' : 'Monthly'}
          </Text>
          {isAnnual && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save ~17%</Text>
            </View>
          )}
        </View>
        <Text style={styles.packagePrice}>{pkg.product.priceString}</Text>
      </View>
      <Text style={styles.packageSubtitle}>
        {pkg.product.description}
      </Text>
      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  )
}

export default function PaywallScreen() {
  const { tier } = useSubscriptionTier()
  const { data: offering, isLoading: offeringsLoading } = useOfferings()
  const purchaseMutation = usePurchasePackage()
  const restoreMutation = useRestorePurchases()

  // Default to the annual package if available
  const defaultPkg = offering?.annual ?? offering?.monthly ?? offering?.availablePackages[0]
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultPkg?.identifier)

  // Sync default selection when offerings load
  useEffect(() => {
    if (!selectedId && defaultPkg) setSelectedId(defaultPkg.identifier)
  }, [defaultPkg])

  const featuresKey = tier === 'free' ? 'pro' : 'premium'
  const headline = tier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Premium'
  const subheadline =
    tier === 'free'
      ? 'Unlock all features and get the most out of this app.'
      : 'Take it further with Premium — our highest tier.'

  async function handlePurchase() {
    if (!selectedId) return
    try {
      await purchaseMutation.mutateAsync(selectedId)
      router.back()
    } catch (err: any) {
      // User cancellations throw with a specific userCancelled flag — don't show an alert
      if (err?.userCancelled) return
      Alert.alert('Purchase failed', err?.message ?? 'Something went wrong.')
    }
  }

  async function handleRestore() {
    try {
      await restoreMutation.mutateAsync()
      Alert.alert('Restored', 'Your purchases have been restored.')
      router.back()
    } catch {
      Alert.alert('Restore failed', 'No purchases found to restore.')
    }
  }

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.subheadline}>{subheadline}</Text>

        {/* Feature list */}
        <View style={styles.features}>
          {FEATURE_LIST[featuresKey].map((f) => (
            <Text key={f} style={styles.featureItem}>{f}</Text>
          ))}
        </View>

        {/* Packages */}
        {offeringsLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" style={{ marginVertical: 32 }} />
        ) : !offering ? (
          <Text style={styles.noOfferings}>
            No offerings available. Check back later.
          </Text>
        ) : (
          <View style={styles.packages}>
            {offering.availablePackages.map((pkg) => (
              <PackageCard
                key={pkg.identifier}
                pkg={pkg}
                isSelected={selectedId === pkg.identifier}
                onSelect={() => setSelectedId(pkg.identifier)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.purchaseButton, (!selectedId || purchaseMutation.isPending) && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={!selectedId || purchaseMutation.isPending}
        >
          {purchaseMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.purchaseText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRestore}
          disabled={restoreMutation.isPending}
          style={styles.restoreButton}
        >
          <Text style={styles.restoreText}>
            {restoreMutation.isPending ? 'Restoring…' : 'Restore purchases'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 16,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subheadline: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  features: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  featureItem: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  packages: {
    gap: 12,
  },
  packageCard: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    gap: 6,
    position: 'relative',
  },
  packageCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  packagePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  packageSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  savingsBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  radioOuter: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  noOfferings: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginVertical: 32,
    fontSize: 15,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  purchaseButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseButtonDisabled: {
    opacity: 0.5,
  },
  purchaseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  restoreText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
})
