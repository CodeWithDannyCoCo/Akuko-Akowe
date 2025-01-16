'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function HealthCheck() {
    const [status, setStatus] = useState({ checking: true, error: null })

    useEffect(() => {
        const checkConnection = async () => {
            try {
                console.log('Checking API connection...')
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health-check/`)
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                console.log('API connection successful:', data)
                setStatus({ checking: false, error: null })
            } catch (error) {
                console.error('API connection failed:', error)
                setStatus({
                    checking: false,
                    error: `Failed to connect to ${process.env.NEXT_PUBLIC_API_URL}`
                })
            }
        }

        checkConnection()
    }, [])

    if (status.checking) {
        return (
            <div className="fixed bottom-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg">
                Checking backend connection...
            </div>
        )
    }

    if (status.error) {
        return (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-medium">Backend Connection Error</p>
                <p className="text-xs mt-1">{status.error}</p>
            </div>
        )
    }

    return null
} 