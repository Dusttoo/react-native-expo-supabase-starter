import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'
import { Profile, ProfileUpdate } from '../types'

export class ProfileService {
  constructor(private client: SupabaseClient<Database>) {}

  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  }

  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    const { data, error } = await this.client
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
