import { authClient, useSession, type Session, type User } from '@/auth/auth-client'
import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useAuth() {
  const session = useSession()
  const navigate = useNavigate()

  const signOut = useCallback(async () => {
    await authClient.signOut()
    navigate({ to: '/' })
  }, [navigate])

  const isAuthenticated = !!session.data?.user
  const user = session.data?.user as User | null

  return {
    session: session.data as Session | null,
    user,
    isAuthenticated,
    isPending: session.isPending,
    error: session.error,
    signOut,
  }
}
