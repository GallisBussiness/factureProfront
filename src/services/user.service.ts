import { authClient } from '@/auth/auth-client'

export interface ListUsersQuery {
  searchValue?: string
  searchField?: 'email' | 'name'
  searchOperator?: 'contains' | 'starts_with' | 'ends_with'
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  filterField?: string
  filterValue?: string | number | boolean
  filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte'
}

export interface UserData {
  id: string
  email: string
  emailVerified: boolean
  name: string
  image?: string | null
  role?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ListUsersResponse {
  users: UserData[]
  total: number
  limit?: number
  offset?: number
}

export interface CreateUserData {
  email: string
  password: string
  name: string
  role?: string
}

class UserServiceClass {
  async listUsers(query?: ListUsersQuery): Promise<ListUsersResponse> {
    const { data, error } = await authClient.admin.listUsers({
      query: query || {},
    })
    if (error) throw error
    return data as ListUsersResponse
  }

  async createUser(userData: CreateUserData): Promise<UserData> {
    const { data, error } = await authClient.admin.createUser(userData as Parameters<typeof authClient.admin.createUser>[0])
    if (error) throw error
    return data as unknown as UserData
  }

  async setRole(userId: string, role: string): Promise<UserData> {
    const { data, error } = await authClient.admin.setRole({
      userId,
      role: role as 'user' | 'admin',
    })
    if (error) throw error
    return data as unknown as UserData
  }

  async updateUser(userId: string, userData: Record<string, unknown>): Promise<UserData> {
    const { data, error } = await authClient.admin.updateUser({
      userId,
      data: userData,
    })
    if (error) throw error
    return data as unknown as UserData
  }

  async banUser(userId: string, banReason?: string, banExpiresIn?: number): Promise<void> {
    const { error } = await authClient.admin.banUser({
      userId,
      banReason,
      banExpiresIn,
    })
    if (error) throw error
  }

  async unbanUser(userId: string): Promise<void> {
    const { error } = await authClient.admin.unbanUser({
      userId,
    })
    if (error) throw error
  }

  async removeUser(userId: string): Promise<void> {
    const { error } = await authClient.admin.removeUser({
      userId,
    })
    if (error) throw error
  }

  async listUserSessions(userId: string): Promise<unknown[]> {
    const { data, error } = await authClient.admin.listUserSessions({
      userId,
    })
    if (error) throw error
    return data as unknown as unknown[]
  }

  async revokeUserSession(sessionToken: string): Promise<void> {
    const { error } = await authClient.admin.revokeUserSession({
      sessionToken,
    })
    if (error) throw error
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const { error } = await authClient.admin.revokeUserSessions({
      userId,
    })
    if (error) throw error
  }

  async impersonateUser(userId: string): Promise<void> {
    const { error } = await authClient.admin.impersonateUser({
      userId,
    })
    if (error) throw error
  }

  async stopImpersonating(): Promise<void> {
    await authClient.admin.stopImpersonating()
  }
}

export const UserService = new UserServiceClass()
