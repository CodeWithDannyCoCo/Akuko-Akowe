'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from './api'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const router = useRouter()

    const clearError = () => setError(null)

    const login = async (credentials) => {
        try {
            setError(null)
            setLoading(true)

            const response = await fetch(`${api.API_URL}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(credentials),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Login failed. Please check your credentials.')
            }

            // Store both tokens
            if (data.token) {
                localStorage.setItem('accessToken', data.token)
                if (data.refresh) {
                    localStorage.setItem('refreshToken', data.refresh)
                }
            } else {
                throw new Error('Authentication failed: No token received')
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
            return { success: true, message: 'Login successful' }
        } catch (error) {
            const errorMessage = error.message || 'An unexpected error occurred during login'
            setError(errorMessage)
            console.error('Login error:', error)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        try {
            setError(null)
            setLoading(true)
            const refreshToken = localStorage.getItem('refreshToken')

            if (refreshToken) {
                await fetch(`${api.API_URL}/auth/logout/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                    credentials: 'include',
                })
            }

            return { success: true, message: 'Logout successful' }
        } catch (error) {
            console.error('Logout error:', error)
            // Continue with cleanup even if server logout fails
        } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
            setUser(null)
            setLoading(false)
            router.push('/login')
        }
    }

    const signup = async (userData) => {
        try {
            setError(null)
            setLoading(true)

            // Validate required fields
            const requiredFields = ['username', 'email', 'password']
            const missingFields = requiredFields.filter(field => !userData[field])
            if (missingFields.length > 0) {
                throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
            }

            const response = await fetch(`${api.API_URL}/auth/signup/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Registration failed. Please try again.')
            }

            // Store both tokens
            if (data.token) {
                localStorage.setItem('accessToken', data.token)
                if (data.refresh) {
                    localStorage.setItem('refreshToken', data.refresh)
                }
            } else {
                throw new Error('Registration successful but authentication failed')
            }

            // Store user data if available
            if (data.user) {
                setUser(data.user)
                localStorage.setItem('user', JSON.stringify(data.user))
            }

            router.push('/')
            return { success: true, message: 'Registration successful' }
        } catch (error) {
            const errorMessage = error.message || 'An unexpected error occurred during registration'
            setError(errorMessage)
            console.error('Signup error:', error)
            throw new Error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setError(null)
                const token = localStorage.getItem('accessToken')
                const storedUser = localStorage.getItem('user')

                if (token) {
                    if (storedUser) {
                        setUser(JSON.parse(storedUser))
                    }
                    try {
                        // Verify token by fetching current user
                        const userData = await api.getCurrentUser()
                        setUser(userData)
                        localStorage.setItem('user', JSON.stringify(userData))
                    } catch (error) {
                        // If token verification fails, clear everything
                        console.error('Token verification failed:', error)
                        localStorage.removeItem('accessToken')
                        localStorage.removeItem('refreshToken')
                        localStorage.removeItem('user')
                        setUser(null)
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                setError('Failed to initialize authentication')
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
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            clearError,
            login,
            logout,
            signup
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