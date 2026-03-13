import { Redirect, Stack } from 'expo-router'
import { useAuthStore } from '@/store/auth-store'

export default function AuthLayout() {
  const { session, isLoading } = useAuthStore()

  if (isLoading) return null

  // Authenticated users have no business on auth screens
  if (session) return <Redirect href="/(tabs)" />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  )
}
