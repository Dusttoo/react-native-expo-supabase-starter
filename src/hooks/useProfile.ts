import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { ProfileService } from '../services/profile-service'
import { ProfileUpdate } from '../types'

const profileService = new ProfileService(supabase)

export const profileKeys = {
  all: ['profiles'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => profileService.getProfile(userId),
    enabled: !!userId,
  })
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (updates: ProfileUpdate) =>
      profileService.updateProfile(userId, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.detail(userId), data)
    },
  })
}
