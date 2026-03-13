import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'

interface AuthState {
  session: Session | null
  user: User | null
  isLoading: boolean
  setSession: (session: Session | null) => void
  setLoading: (isLoading: boolean) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isLoading: true,
  setSession: (session) =>
    set({ session, user: session?.user ?? null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ session: null, user: null, isLoading: false }),
}))
