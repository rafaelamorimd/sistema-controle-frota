import { create } from 'zustand'
import type { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  validateSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: !!localStorage.getItem('token'),
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token, loading: false })
  },
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null, loading: false })
  },
  isAuthenticated: () => !!get().token,
  validateSession: async () => {
    const token = get().token
    if (!token) {
      set({ loading: false })
      return
    }
    try {
      const { default: api } = await import('../services/api')
      const { data } = await api.get<User>('/auth/me')
      set({ user: data, loading: false })
    } catch {
      get().logout()
    }
  },
}))
