import { AuthService } from '../../src/services/auth-service'

function createMockAuthClient(overrides: Record<string, jest.Mock> = {}) {
  return {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      ...overrides,
    },
  } as any
}

describe('AuthService', () => {
  describe('signIn', () => {
    it('returns session data on success', async () => {
      const mockSession = { user: { id: 'user-uuid-1' }, access_token: 'token' }
      const mockClient = createMockAuthClient({
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
      })

      const service = new AuthService(mockClient)
      const result = await service.signIn('test@example.com', 'password123')

      expect(result.session).toEqual(mockSession)
      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('throws on auth error', async () => {
      const authError = { message: 'Invalid login credentials' }
      const mockClient = createMockAuthClient({
        signInWithPassword: jest.fn().mockResolvedValue({
          data: { session: null },
          error: authError,
        }),
      })

      const service = new AuthService(mockClient)

      await expect(service.signIn('test@example.com', 'wrong')).rejects.toEqual(authError)
    })
  })

  describe('signUp', () => {
    it('returns user data on success', async () => {
      const mockUser = { id: 'user-uuid-2', email: 'new@example.com' }
      const mockClient = createMockAuthClient({
        signUp: jest.fn().mockResolvedValue({
          data: { user: mockUser, session: null },
          error: null,
        }),
      })

      const service = new AuthService(mockClient)
      const result = await service.signUp('new@example.com', 'password123')

      expect(result.user).toEqual(mockUser)
    })

    it('throws when email is already registered', async () => {
      const authError = { message: 'User already registered' }
      const mockClient = createMockAuthClient({
        signUp: jest.fn().mockResolvedValue({
          data: { user: null, session: null },
          error: authError,
        }),
      })

      const service = new AuthService(mockClient)

      await expect(service.signUp('existing@example.com', 'password123')).rejects.toEqual(
        authError
      )
    })
  })

  describe('signOut', () => {
    it('calls signOut on the client', async () => {
      const mockClient = createMockAuthClient({
        signOut: jest.fn().mockResolvedValue({ error: null }),
      })

      const service = new AuthService(mockClient)
      await service.signOut()

      expect(mockClient.auth.signOut).toHaveBeenCalled()
    })

    it('throws on error', async () => {
      const authError = { message: 'Sign out failed' }
      const mockClient = createMockAuthClient({
        signOut: jest.fn().mockResolvedValue({ error: authError }),
      })

      const service = new AuthService(mockClient)

      await expect(service.signOut()).rejects.toEqual(authError)
    })
  })

  describe('getSession', () => {
    it('returns the current session', async () => {
      const mockSession = { user: { id: 'user-uuid-1' }, access_token: 'token' }
      const mockClient = createMockAuthClient({
        getSession: jest.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
      })

      const service = new AuthService(mockClient)
      const result = await service.getSession()

      expect(result).toEqual(mockSession)
    })

    it('returns null when no session exists', async () => {
      const mockClient = createMockAuthClient({
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: null,
        }),
      })

      const service = new AuthService(mockClient)
      const result = await service.getSession()

      expect(result).toBeNull()
    })
  })
})
