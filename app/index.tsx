import { Redirect } from 'expo-router'
import { useAuthStore } from '@/store/auth-store'

export default function Index() {
  const { session, isLoading } = useAuthStore()

  // Let the splash screen hold while the session is being hydrated
  if (isLoading) return null

  return <Redirect href={session ? '/(tabs)' : '/(auth)/sign-in'} />
}
