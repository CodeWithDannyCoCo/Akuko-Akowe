'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from './api'

const AuthContext = createContext({})

const clearAuthData = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

const isTokenExpired = (token) => {
    if (!token) return true
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.exp * 1000 < Date.now()
    } catch (error) {
        console.error('Token validation error:', error)
        return true
    }
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const router = useRouter()

    // Add isAuthenticated computed value
    const isAuthenticated = !!user

    const updateUser = (userData) => {
        if (!userData) {
            console.error('No user data provided for update')
            return
        }
        setUser(userData)
    }

    const login = async (credentials) => {
        setError(null)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            if (!apiUrl) {
                throw new Error('API URL is not configured')
            }

            const response = await fetch(`${apiUrl}/auth/login/`, {
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

            // Clear any existing auth data before setting new ones
            clearAuthData()

            // Store tokens - handle both token formats
            if (data.access || data.token) {
                const accessToken = data.access || data.token

                // Validate token before storing
                if (isTokenExpired(accessToken)) {
                    throw new Error('Received expired token from server')
                }

                localStorage.setItem('accessToken', accessToken)

                // Store refresh token if available
                const refreshToken = data.refresh
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken)
                }

                // Set cookie for middleware
                document.cookie = `accessToken=${accessToken}; path=/; max-age=2592000; SameSite=Strict` // 30 days
            } else {
                throw new Error('No access token received from server')
            }

            // Store user data if available
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
                setUser(data.user)
            }

            // Fetch user data using the new token
            try {
                const userData = await api.getCurrentUser()
                setUser(userData)
            } catch (error) {
                console.error('Error fetching user data:', error)
                clearAuthData()
                throw new Error('Failed to fetch user data after login')
            }

            router.push('/')
        } catch (error) {
            console.error('Login error:', error)
            setError(error.message)
            clearAuthData()
            throw error
        }
    }

    const logout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            if (!apiUrl) {
                throw new Error('API URL is not configured')
            }

            const token = localStorage.getItem('accessToken')
            if (!token) {
                throw new Error('No access token found')
            }

            const response = await fetch(`${apiUrl}/auth/logout/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Logout failed')
            }
        } catch (error) {
            console.error('Logout error:', error)
            // Even if the server request fails, we should still clear local auth data
        } finally {
            clearAuthData()
            setUser(null)
            setError(null)
            router.push('/login')
        }
    }

    const signup = async (userData) => {
        setError(null)
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            if (!apiUrl) {
                throw new Error('API URL is not configured')
            }

            const response = await fetch(`${apiUrl}/auth/signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                credentials: 'include',
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Registration failed')
            }

            const data = await response.json()

            // Clear any existing auth data before setting new ones
            clearAuthData()

            // Store tokens - handle both token formats
            if (data.access || data.token) {
                const accessToken = data.access || data.token

                // Validate token before storing
                if (isTokenExpired(accessToken)) {
                    throw new Error('Received expired token from server')
                }

                localStorage.setItem('accessToken', accessToken)

                // Store refresh token if available
                const refreshToken = data.refresh
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken)
                }

                // Set cookie for middleware
                document.cookie = `accessToken=${accessToken}; path=/; max-age=2592000; SameSite=Strict` // 30 days
            } else {
                throw new Error('No access token received from server')
            }

            // Store user data if available
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user))
                setUser(data.user)
            }

            // Fetch user data using the new token
            try {
                const userData = await api.getCurrentUser()
                setUser(userData)
            } catch (error) {
                console.error('Error fetching user data:', error)
                clearAuthData()
                throw new Error('Failed to fetch user data after signup')
            }

            router.push('/')
        } catch (error) {
            console.error('Signup error:', error)
            setError(error.message)
            clearAuthData()
            throw error
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                if (token) {
                    // Check if token is expired
                    if (isTokenExpired(token)) {
                        throw new Error('Token expired')
                    }

                    const userData = await api.getCurrentUser()
                    setUser(userData)
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                clearAuthData()
                setUser(null)
                setError('Session expired. Please login again.')
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            isAuthenticated,
            login,
            logout,
            signup,
            updateUser
        }}>
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