'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Notification({
    type = 'success',
    message,
    onClose,
    autoClose = true,
    duration = 5000
}) {
    useEffect(() => {
        if (autoClose && message) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [message, autoClose, duration, onClose])

    if (!message) return null

    const styles = {
        success: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-800 dark:text-green-200',
            border: 'border-green-200 dark:border-green-800',
            icon: 'text-green-500 dark:text-green-400'
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-800 dark:text-red-200',
            border: 'border-red-200 dark:border-red-800',
            icon: 'text-red-500 dark:text-red-400'
        },
        warning: {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            text: 'text-yellow-800 dark:text-yellow-200',
            border: 'border-yellow-200 dark:border-yellow-800',
            icon: 'text-yellow-500 dark:text-yellow-400'
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-800 dark:text-blue-200',
            border: 'border-blue-200 dark:border-blue-800',
            icon: 'text-blue-500 dark:text-blue-400'
        }
    }

    const style = styles[type]

    return (
        <div className={`fixed top-4 right-4 z-50 max-w-md w-full animate-slide-in`}>
            <div className={`${style.bg} ${style.text} ${style.border} p-4 rounded-lg shadow-lg border flex items-start`}>
                <div className="flex-1 mr-2">
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className={`${style.icon} p-1 rounded-full hover:bg-opacity-20 hover:bg-black transition-colors`}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    )
} 