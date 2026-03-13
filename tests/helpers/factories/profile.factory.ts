import { Profile } from '../../../src/types'

export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-uuid-1',
    updated_at: '2024-01-01T00:00:00Z',
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: null,
    subscription_tier: 'free',
    ...overrides,
  }
}
