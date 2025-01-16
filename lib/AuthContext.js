'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { api } from './api'
import { useRouter } from 'next/navigation'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken')
                const storedUser = localStorage.getItem('user')

                if (token) {
                    // First set the stored user data if available
                    if (storedUser) {
                        setUser(JSON.parse(storedUser))
                    }

                    try {
                        // Verify token and get fresh user data
                        const userData = await api.getCurrentUser()
                        setUser(userData)
                        localStorage.setItem('user', JSON.stringify(userData))
                    } catch (error) {
                        console.error('Auth verification failed:', error)
                        // Only clear auth data and redirect if token is explicitly invalid
                        if (error.message === 'Invalid token' || error.message === 'Token has expired') {
                            localStorage.removeItem('accessToken')
                            localStorage.removeItem('user')
                            setUser(null)
                            // Only redirect to login if we're not already there
                            if (!window.location.pathname.includes('/login')) {
                                router.push('/login')
                            }
                        }
                    }
                } else if (!window.location.pathname.includes('/login')) {
                    // Only redirect if there's no token and we're not already on the login page
                    router.push('/login')
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        initAuth()
    }, [router])

    const updateUser = (updatedUser) => {
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    const login = async (credentials) => {
        try {
            const response = await api.login(credentials)
            setUser(response.user)
            router.push('/')
            return response
        } catch (error) {
            throw error
        }
    }

    const logout = () => {
        api.logout()
        setUser(null)
        router.push('/login')
    }

    const signup = async (userData) => {
        try {
            const response = await api.signup(userData)
            setUser(response.user)
            router.push('/')
            return response
        } catch (error) {
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            signup,
            updateUser,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}