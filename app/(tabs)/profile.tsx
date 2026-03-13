import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native'
import { router, type Href } from 'expo-router'
import { useAuthStore } from '@/store/auth-store'
import { useProfile } from '@/hooks/useProfile'
import { useSubscriptionTier } from '@/hooks/useSubscription'
import { supabase } from '@/lib/supabase'
import { SubscriptionTier } from '@/types'

const TIER_CONFIG: Record<SubscriptionTier, { label: string; color: string; bg: string }> = {
  free: { label: 'Free', color: '#fff', bg: '#6B7280' },
  pro: { label: 'Pro', color: '#fff', bg: '#3B82F6' },
  premium: { label: 'Premium', color: '#fff', bg: '#F59E0B' },
}

function Avatar({ name, email }: { name: string | null; email: string | undefined }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (email?.[0] ?? '?').toUpperCase()

  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  )
}

function TierBadge({ tier }: { tier: SubscriptionTier }) {
  const config = TIER_CONFIG[tier]
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user)
  const { data: profile, isLoading, isError, refetch } = useProfile(user?.id ?? '')
  const { tier, isPremium } = useSubscriptionTier()

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut()
    if (error) Alert.alert('Sign out failed', error.message)
  }

  function handleUpgrade() {
    router.push('/paywall' as Href)
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar name={profile?.full_name ?? null} email={user?.email} />
        <View style={styles.headerInfo}>
          <Text style={styles.fullName}>{profile?.full_name ?? 'No name set'}</Text>
          {profile?.username ? (
            <Text style={styles.username}>@{profile.username}</Text>
          ) : null}
          <Text style={styles.email}>{user?.email}</Text>
        </View>
        <TierBadge tier={tier} />
      </View>

      <View style={styles.divider} />

      {/* Subscription section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.tierRow}>
          <Text style={styles.tierLabel}>Current plan</Text>
          <TierBadge tier={tier} />
        </View>

        {!isPremium && (
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeText}>
              {tier === 'free' ? '⚡ Upgrade to Pro' : '⚡ Upgrade to Premium'}
            </Text>
          </TouchableOpacity>
        )}

        {isPremium && (
          <Text style={styles.manageSub}>
            Manage your subscription in the App Store or Play Store.
          </Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  fullName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  username: {
    fontSize: 14,
    color: '#6B7280',
  },
  email: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  section: {
    paddingVertical: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierLabel: {
    fontSize: 16,
    color: '#111827',
  },
  upgradeButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  upgradeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  manageSub: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 15,
  },
  errorText: {
    color: '#6B7280',
    fontSize: 15,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  retryText: {
    color: '#374151',
    fontWeight: '600',
  },
})
