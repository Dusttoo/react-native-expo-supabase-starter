import { useEffect, useRef } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as SplashScreen from 'expo-splash-screen'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { useSubscriptionStore } from '@/store/subscription-store'
import { SubscriptionService } from '@/services/subscription-service'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

const subscriptionService = new SubscriptionService()

function AuthListener() {
  const setSession = useAuthStore((s) => s.setSession)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [setSession])

  return null
}

function PurchasesListener() {
  const user = useAuthStore((s) => s.user)
  const { setTier, setLoading, setError, reset } = useSubscriptionStore()
  const configured = useRef(false)

  useEffect(() => {
    // Configure once — safe to call multiple times but only needs to run once
    if (!configured.current) {
      subscriptionService.configure()
      configured.current = true
    }
  }, [])

  useEffect(() => {
    if (!user) {
      // User signed out — reset RC identity and subscription state
      subscriptionService.logOut().catch(() => {})
      reset()
      return
    }

    setLoading(true)
    subscriptionService
      .identifyUser(user.id)
      .then((tier) => setTier(tier))
      .catch((err) => setError(err?.message ?? 'Failed to load subscription'))
  }, [user, setTier, setLoading, setError, reset])

  return null
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener />
      <PurchasesListener />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
        <Stack.Screen
          name="paywall"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </QueryClientProvider>
  )
}
