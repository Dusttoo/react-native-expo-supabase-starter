import { Redirect, Tabs } from 'expo-router'
import { useAuthStore } from '@/store/auth-store'

export default function TabsLayout() {
  const { session, isLoading } = useAuthStore()

  if (isLoading) return null

  // Unauthenticated users can't access tabs
  if (!session) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tabs>
  )
}
