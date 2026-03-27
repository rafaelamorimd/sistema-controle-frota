import { create } from 'zustand'
import type { User } from '../types'

function fnCarregarUsuarioDoStorage(): User | null {
  const strRaw = localStorage.getItem('user')
  if (strRaw == null || strRaw === '' || strRaw === 'undefined') {
    if (strRaw === 'undefined') {
      localStorage.removeItem('user')
    }
    return null
  }
  try {
    const obj = JSON.parse(strRaw) as unknown
    if (obj && typeof obj === 'object') {
      return obj as User
    }
    return null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

function fnCarregarTokenDoStorage(): string | null {
  const strRaw = localStorage.getItem('token')
  if (strRaw == null || strRaw === '' || strRaw === 'undefined') {
    if (strRaw === 'undefined') {
      localStorage.removeItem('token')
    }
    return null
  }
  return strRaw
}

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
  user: fnCarregarUsuarioDoStorage(),
  token: fnCarregarTokenDoStorage(),
  loading: !!fnCarregarTokenDoStorage(),
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
