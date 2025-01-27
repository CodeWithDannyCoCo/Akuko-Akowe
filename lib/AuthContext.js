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
            localStorage.setItem('accessToken', data.access)

            // Fetch user data after successful login
            const userData = await api.getCurrentUser()
            setUser(userData)

            router.push('/')
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const logout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL
            if (!apiUrl) {
                throw new Error('API URL is not configured')
            }

            await fetch(`${apiUrl}/auth/logout/`, {
                method: 'POST',
                credentials: 'include',
            })
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('accessToken')
            setUser(null)
            router.push('/login')
        }
    }

    const signup = async (userData) => {
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
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.detail || 'Registration failed')
            }

            const data = await response.json()
            localStorage.setItem('accessToken', data.access)

            // Fetch user data after successful registration
            const userResponse = await api.getCurrentUser()
            setUser(userResponse)

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
                if (token) {
                    const userData = await api.getCurrentUser()
                    setUser(userData)
                }
            } catch (error) {
                console.error('Auth initialization error:', error)
                localStorage.removeItem('accessToken')
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