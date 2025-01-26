'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from './api'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const login = async (credentials) => {
        try {
            const response = await fetch(`${api.API_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(credentials),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Login failed')
            }

            const data = await response.json()

            // Store both tokens
            if (data.token) {
                localStorage.setItem('accessToken', data.token)
                if (data.refresh) {
                    localStorage.setItem('refreshToken', data.refresh)
                }
            }

            // Store user data if available
            if (data.user) {
                setUser(data.user)
                localStorage.setItem('user', JSON.stringify(data.user))
            } else {
                // Fetch user data if not included in response
                const userData = await api.getCurrentUser()
                setUser(userData)
                localStorage.setItem('user', JSON.stringify(userData))
            }

            router.push('/')
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken')
            await fetch(`${api.API_URL}/auth/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
                credentials: 'include',
            })
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            setUser(null)
            router.push('/login')
        }
    }

    const signup = async (userData) => {
        try {
            const response = await fetch(`${api.API_URL}/auth/signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Registration failed')
            }

            const data = await response.json()

            // Store both tokens
            if (data.token) {
                localStorage.setItem('accessToken', data.token)
                if (data.refresh) {
                    localStorage.setItem('refreshToken', data.refresh)
                }
            }

            // Store user data if available
            if (data.user) {
                setUser(data.user)
                localStorage.setItem('user', JSON.stringify(data.user))
            }

            router.push('/')
        } catch (error) {
            console.error('Signup error:', error)
            throw error
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                const storedUser = localStorage.getItem('user')

                if (token) {
                    if (storedUser) {
                        setUser(JSON.parse(storedUser))
                    }
                    // Verify token by fetching current user
                    const userData = await api.getCurrentUser()
                    setUser(userData)
                    localStorage.setItem('user', JSON.stringify(userData))
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('user')
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, signup }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}