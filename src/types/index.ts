export type { Database } from './database'

import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type SubscriptionTier = Database['public']['Enums']['subscription_tier']

// RevenueCat offering/package shape (mirrors what rc-purchases returns)
export interface SubscriptionPackage {
  identifier: string
  packageType: string
  product: {
    identifier: string
    title: string
    description: string
    price: number
    priceString: string
    currencyCode: string
  }
}

export interface SubscriptionOffering {
  identifier: string
  serverDescription: string
  availablePackages: SubscriptionPackage[]
  monthly: SubscriptionPackage | null
  annual: SubscriptionPackage | null
  lifetime: SubscriptionPackage | null
}
