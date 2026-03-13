export type { Database } from './database'

import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type SubscriptionTier = Database['public']['Enums']['subscription_tier']
