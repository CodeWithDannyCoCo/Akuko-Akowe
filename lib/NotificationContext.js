'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import Notification from '../components/Notification'

const NotificationContext = createContext({})

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState(null)

    const showNotification = useCallback(({ type = 'success', message, autoClose = true, duration }) => {
        setNotification({ type, message, autoClose, duration })
    }, [])

    const clearNotification = useCallback(() => {
        setNotification(null)
    }, [])

    return (
        <NotificationContext.Provider value={{ showNotification, clearNotification }}>
            {children}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={clearNotification}
                    autoClose={notification.autoClose}
                    duration={notification.duration}
                />
            )}
        </NotificationContext.Provider>
    )
}

export function useNotification() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
} 