import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SubscriptionService } from '../services/subscription-service'
import { useSubscriptionStore } from '../store/subscription-store'

const subscriptionService = new SubscriptionService()

export const subscriptionKeys = {
  offerings: ['subscription', 'offerings'] as const,
  tier: ['subscription', 'tier'] as const,
}

export function useOfferings() {
  return useQuery({
    queryKey: subscriptionKeys.offerings,
    queryFn: () => subscriptionService.getOfferings(),
    staleTime: 1000 * 60 * 10, // offerings don't change often
  })
}

export function usePurchasePackage() {
  const queryClient = useQueryClient()
  const setTier = useSubscriptionStore((s) => s.setTier)

  return useMutation({
    mutationFn: (packageIdentifier: string) =>
      subscriptionService.purchasePackage(packageIdentifier),
    onSuccess: (tier) => {
      setTier(tier)
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.tier })
    },
  })
}

export function useRestorePurchases() {
  const queryClient = useQueryClient()
  const setTier = useSubscriptionStore((s) => s.setTier)

  return useMutation({
    mutationFn: () => subscriptionService.restorePurchases(),
    onSuccess: (tier) => {
      setTier(tier)
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.tier })
    },
  })
}

export function useSubscriptionTier() {
  const storeTier = useSubscriptionStore((s) => s.tier)
  const isActive = useSubscriptionStore((s) => s.isActive)
  const isLoading = useSubscriptionStore((s) => s.isLoading)

  const isPro = storeTier === 'pro' || storeTier === 'premium'
  const isPremium = storeTier === 'premium'

  const requiresTier = useCallback(
    (requiredTier: 'pro' | 'premium'): boolean => {
      if (requiredTier === 'pro') return isPro
      if (requiredTier === 'premium') return isPremium
      return false
    },
    [isPro, isPremium]
  )

  return { tier: storeTier, isActive, isLoading, isPro, isPremium, requiresTier }
}
