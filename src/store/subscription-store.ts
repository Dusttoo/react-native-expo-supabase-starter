import { create } from 'zustand'
import { SubscriptionTier, SubscriptionOffering } from '../types'

interface SubscriptionState {
  tier: SubscriptionTier
  isActive: boolean
  offerings: SubscriptionOffering | null
  isLoading: boolean
  error: string | null
  setTier: (tier: SubscriptionTier) => void
  setOfferings: (offerings: SubscriptionOffering | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  tier: 'free',
  isActive: false,
  offerings: null,
  isLoading: false,
  error: null,
  setTier: (tier) =>
    set({ tier, isActive: tier !== 'free', error: null }),
  setOfferings: (offerings) => set({ offerings }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () =>
    set({ tier: 'free', isActive: false, offerings: null, error: null, isLoading: false }),
}))
