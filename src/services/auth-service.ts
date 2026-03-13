import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

export class AuthService {
  constructor(private client: SupabaseClient<Database>) {}

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.client.auth.signOut()
    if (error) throw error
  }

  async getSession() {
    const { data, error } = await this.client.auth.getSession()
    if (error) throw error
    return data.session
  }
}
