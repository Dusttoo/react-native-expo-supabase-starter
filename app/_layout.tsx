import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AuthListener() {
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    // Hydrate session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Keep store in sync with Supabase auth events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [setSession])

  return null
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  )
}
