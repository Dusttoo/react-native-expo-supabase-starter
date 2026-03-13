import { Redirect } from 'expo-router'

// Entry point: redirect based on auth state.
// Replace this with a useSession() check once auth is wired up.
export default function Index() {
  return <Redirect href="/(auth)/sign-in" />
}
