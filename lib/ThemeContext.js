'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => { },
})

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        // Try to get theme from localStorage during initialization
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme) {
                return savedTheme;
            }
            // If no saved theme, check system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light'
    })

    useEffect(() => {
        // Handle system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            const newTheme = e.matches ? 'dark' : 'light'
            if (!localStorage.getItem('theme')) {
                setTheme(newTheme)
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    useEffect(() => {
        // Apply theme class
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
        localStorage.setItem('theme', theme)
    }, [theme])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
} 