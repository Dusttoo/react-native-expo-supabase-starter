# react-native-expo-supabase-starter

A React Native Expo starter with Supabase, RevenueCat, and TanStack Query. The part most starters skip: a production-grade approach to testing Supabase's fluent query builder in Jest.

Built by [Dusty Mumphrey](https://builtbydusty.com). Extracted from the stack behind [ReptiDex](https://reptidex.com). 50 paid subscribers within 9 days of launch.

---

## What This Is

Most React Native + Supabase tutorials end at "it works in the simulator." This starter covers what comes next: a codebase you can actually test, a subscription flow that works across iOS and Android, and patterns that hold up as the app grows.

The testing section is the part worth reading even if you never use the rest of the starter. Supabase's chainable query builder (`.from().select().eq().single()`) creates a specific mocking problem in Jest that most tutorials either ignore or solve badly. This repo solves it correctly.

---

## Stack

- **Expo** (managed workflow): cross-platform iOS and Android from one codebase
- **Supabase**: Postgres with built-in auth and row-level security
- **RevenueCat**: subscription management across iOS and Android
- **TanStack Query**: server state, caching, and background sync
- **Zustand**: lightweight UI state management
- **Jest + Testing Library**: unit and component tests with proper Supabase mocking

---

## Why These Choices

### Expo managed workflow over bare React Native

For a solo launch or small team, the velocity win from Expo's managed workflow outweighs the occasional framework constraint. You get OTA updates, a unified build pipeline, and no Xcode configuration rabbit holes. ReptiDex shipped to the App Store using this setup with no issues.

### Supabase over Firebase

Postgres. Row-level security enforced at the database layer. A real SQL query interface rather than a document model. If your app has relational data (users, collections, records with foreign keys) Supabase fits the shape of the problem better.

### RevenueCat over rolling your own

Receipt validation across iOS and Android is a trap. The App Store and Play Store have different APIs, different validation flows, and different edge cases. RevenueCat abstracts all of it into one SDK with a real-time subscription dashboard. The time saved on a three-tier model (Free / Pro / Premium) is significant.

### TanStack Query and Zustand as separate concerns

Server state and UI state are different problems. TanStack Query owns data that lives on the server: fetching, caching, invalidation, background refresh. Zustand owns local UI state that doesn't need to round-trip. Keeping them separated makes the codebase easier to reason about as features accumulate.

---

## Project Structure

```
react-native-expo-supabase-starter/
├── app/                        # Expo Router file-based navigation
│   ├── (auth)/                 # Auth screens: sign in, sign up
│   └── (tabs)/                 # Main app tabs
├── src/
│   ├── lib/
│   │   └── supabase.ts         # Supabase client with injected config
│   ├── services/               # Data layer: one file per domain
│   ├── hooks/                  # TanStack Query hooks wrapping services
│   ├── store/                  # Zustand stores for UI state
│   └── types/                  # Shared TypeScript types
├── tests/
│   ├── helpers/
│   │   ├── supabase-chain-mock.ts   # Chainable mock for Supabase query builder
│   │   └── factories/               # Data factory functions
│   └── services/               # Service-layer unit tests
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project (free tier works)
- A RevenueCat account with iOS and Android apps configured

### Setup

Clone the repo:

```bash
git clone https://github.com/Dusttoo/react-native-expo-supabase-starter
cd react-native-expo-supabase-starter
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

Required variables:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
EXPO_PUBLIC_REVENUECAT_API_KEY_IOS=your-ios-key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your-android-key
```

Before your first build, update the bundle identifiers in `app.json` to match your app:

```json
"ios": { "bundleIdentifier": "com.yourcompany.yourapp" },
"android": { "package": "com.yourcompany.yourapp" }
```

Leaving these as `com.yourcompany.starter` will cause conflicts if you attempt to submit to the App Store or Play Store.

Start the development server:

```bash
npx expo start
```

### Service-specific setup

Two services require configuration in their respective dashboards before the app will work end-to-end:

- **[Supabase setup](docs/supabase-setup.md)** — create the `profiles` table, RLS policies, and the sign-up trigger
- **[RevenueCat setup](docs/revenuecat-setup.md)** — create entitlements, attach products, and configure your offering

---

## The Testing Approach

This is the section most React Native starters skip. Here's the problem and how to solve it correctly.

### The problem with mocking Supabase in Jest

Supabase queries are fluent chains:

```typescript
const { data } = await supabase
  .from('animals')
  .select('*')
  .eq('owner_id', userId)
  .order('created_at', { ascending: false })
  .limit(10)
```

A naive `jest.mock('@supabase/supabase-js')` breaks because each method in the chain returns a new object. You end up with `cannot read properties of undefined` errors and mocks that look right but don't resolve.

The fix is two things working together: dependency injection so the client is replaceable in tests, and a chainable mock helper that correctly returns `this` at each step.

### Step 1: Inject the client into your services

Services should accept the Supabase client as a parameter rather than importing it directly. This makes the client replaceable in tests without module-level mocking.

```typescript
// src/services/animal-service.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

export class AnimalService {
  constructor(private client: SupabaseClient<Database>) {}

  async getAnimalsForUser(userId: string) {
    const { data, error } = await this.client
      .from('animals')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }
}
```

### Step 2: The chainable mock helper

The key insight is that every method in the chain needs to return the same mock object so the chain stays intact. The terminal call (`.single()`, `.maybeSingle()`, or the bare `await`) is where you inject the resolved value.

```typescript
// tests/helpers/supabase-chain-mock.ts

export function createSupabaseChainMock(resolvedValue: unknown, error?: unknown) {
  const chain: Record<string, jest.Mock> = {}

  const terminal = error
    ? jest.fn().mockRejectedValue(error)
    : jest.fn().mockResolvedValue({ data: resolvedValue, error: null })

  const returnChain = jest.fn().mockReturnValue(chain)

  // Filter methods: all return the chain
  chain.select = returnChain
  chain.insert = returnChain
  chain.update = returnChain
  chain.delete = returnChain
  chain.upsert = returnChain
  chain.eq = returnChain
  chain.neq = returnChain
  chain.gt = returnChain
  chain.gte = returnChain
  chain.lt = returnChain
  chain.lte = returnChain
  chain.like = returnChain
  chain.ilike = returnChain
  chain.in = returnChain
  chain.is = returnChain
  chain.order = returnChain
  chain.limit = returnChain
  chain.range = returnChain

  // Terminal calls: resolve the chain
  chain.single = terminal
  chain.maybeSingle = terminal
  chain.then = jest.fn((resolve: (val: unknown) => void) =>
    Promise.resolve({ data: resolvedValue, error: null }).then(resolve)
  )

  return {
    from: jest.fn().mockReturnValue(chain),
    chain,
  }
}
```

### Step 3: Data factories keep tests readable

Instead of building raw objects inline, factory functions give you typed defaults with overrides only where the test cares:

```typescript
// tests/helpers/factories/animal.factory.ts
import { Animal } from '../../../src/types'

export function createMockAnimal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: 'animal-uuid-1',
    owner_id: 'user-uuid-1',
    name: 'Test Gecko',
    species: 'Correlophus ciliatus',
    morph: 'Harlequin',
    sex: 'female',
    date_of_birth: '2023-01-15',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides,
  }
}
```

### Step 4: Tests that read cleanly

```typescript
// tests/services/animal-service.test.ts
import { AnimalService } from '../../src/services/animal-service'
import { createSupabaseChainMock } from '../helpers/supabase-chain-mock'
import { createMockAnimal } from '../helpers/factories/animal.factory'

describe('AnimalService', () => {
  it('returns animals for a user', async () => {
    const mockAnimals = [
      createMockAnimal({ name: 'Gobi' }),
      createMockAnimal({ id: 'animal-uuid-2', name: 'Mango' }),
    ]

    const { from, chain } = createSupabaseChainMock(mockAnimals)
    const mockClient = { from } as any

    const service = new AnimalService(mockClient)
    const result = await service.getAnimalsForUser('user-uuid-1')

    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Gobi')
    expect(from).toHaveBeenCalledWith('animals')
    expect(chain.eq).toHaveBeenCalledWith('owner_id', 'user-uuid-1')
  })

  it('throws when the query fails', async () => {
    const dbError = { message: 'Permission denied', code: '42501' }
    const { from } = createSupabaseChainMock(null, dbError)
    const mockClient = { from } as any

    const service = new AnimalService(mockClient)

    await expect(service.getAnimalsForUser('user-uuid-1')).rejects.toEqual(dbError)
  })
})
```

### When to use this pattern vs. a full integration mock

The chainable mock is the right tool for unit testing individual service methods. Use it when:

- You want precise `expect()` assertions on which table was queried and with which filters
- Tests need to run fast without network calls
- You're testing error handling and edge cases

For integration-style tests that exercise auth flows or multiple layers together, a full Supabase mock server (like `supabase-js-mock`) is a better fit. The two approaches are complementary.

---

## Running the App

Start the Expo development server:

```bash
npx expo start
```

Then press:
- `i` to open in iOS Simulator
- `a` to open on Android Emulator
- Scan the QR code with the Expo Go app to run on a physical device

> **Note:** `react-native-purchases` (RevenueCat) requires a physical device or a development build for subscription flows to work. Expo Go runs RevenueCat in Preview API Mode, which simulates the SDK but does not make real StoreKit or Play Billing calls. To test real purchases you will need a development build:
> ```bash
> npx expo run:ios
> npx expo run:android
> ```

---

## Running Tests

```bash
npm test
```

Watch mode:

```bash
npm test -- --watch
```

Coverage report:

```bash
npm run test:coverage
```

Tests live in `tests/services/` and follow the chainable mock pattern described in the Testing Approach section above. The test suite covers `AuthService`, `ProfileService`, and `SubscriptionService` — 22 tests, no network calls.

---

## What This Doesn't Cover

This starter is scoped to the patterns that matter most at launch. It does not include:

- Push notifications
- Deep linking configuration
- Offline sync / optimistic updates
- E2E tests with Detox or Maestro
- CI/CD pipeline configuration

These are real concerns in production apps. They're excluded here to keep the core patterns readable.

---

## About

Built by [Dusty Mumphrey](https://builtbydusty.com). I run Built By Dusty, a software studio building custom applications for small businesses and animal breeders. ReptiDex, the app this stack comes from, hit 50 paid subscribers and 200 animals tracked within 9 days of launch.

If you're building a mobile app and want a senior engineer who has shipped one, [I'd like to hear from you](https://builtbydusty.com).