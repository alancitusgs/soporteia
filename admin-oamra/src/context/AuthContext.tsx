import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { AuthUser, LoginResponse } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('admin_token')
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (token) {
      // Verificar token al cargar
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Token invalido')
          return res.json()
        })
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('admin_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || 'Error de autenticacion')
    }

    const data: LoginResponse = await res.json()
    localStorage.setItem('admin_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAdmin: user?.rol === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
