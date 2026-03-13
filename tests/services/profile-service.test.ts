import { ProfileService } from '../../src/services/profile-service'
import { createSupabaseChainMock } from '../helpers/supabase-chain-mock'
import { createMockProfile } from '../helpers/factories/profile.factory'

describe('ProfileService', () => {
  describe('getProfile', () => {
    it('returns a profile for a given user', async () => {
      const mockProfile = createMockProfile({ username: 'dusty' })
      const { from, chain } = createSupabaseChainMock(mockProfile)
      const mockClient = { from } as any

      const service = new ProfileService(mockClient)
      const result = await service.getProfile('user-uuid-1')

      expect(result).toEqual(mockProfile)
      expect(from).toHaveBeenCalledWith('profiles')
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-uuid-1')
      expect(chain.single).toHaveBeenCalled()
    })

    it('throws when the query fails', async () => {
      const dbError = { message: 'Permission denied', code: '42501' }
      const { from } = createSupabaseChainMock(null, dbError)
      const mockClient = { from } as any

      const service = new ProfileService(mockClient)

      await expect(service.getProfile('user-uuid-1')).rejects.toEqual(dbError)
    })
  })

  describe('updateProfile', () => {
    it('updates and returns the profile', async () => {
      const updatedProfile = createMockProfile({ username: 'newname' })
      const { from, chain } = createSupabaseChainMock(updatedProfile)
      const mockClient = { from } as any

      const service = new ProfileService(mockClient)
      const result = await service.updateProfile('user-uuid-1', { username: 'newname' })

      expect(result).toEqual(updatedProfile)
      expect(from).toHaveBeenCalledWith('profiles')
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-uuid-1')
    })
  })
})
