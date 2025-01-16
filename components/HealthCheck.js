'use client'

import { useEffect, useState } from 'react'

export default function HealthCheck() {
    const [status, setStatus] = useState({ error: null, loading: true })

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL
                if (!apiUrl) {
                    throw new Error('API URL is not configured')
                }

                const response = await fetch(`${apiUrl}/health/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                setStatus({ error: null, loading: false })
                console.log('Health check successful:', data)
            } catch (error) {
                console.error('Health check failed:', error)
                setStatus({
                    error: `Connection failed: ${error.message}`,
                    loading: false
                })
            }
        }

        checkHealth()
        const interval = setInterval(checkHealth, 30000)

        return () => clearInterval(interval)
    }, [])

    if (status.loading) return null

    if (status.error) {
        return (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                <p className="text-sm font-medium">Backend Connection Error</p>
                <p className="text-xs mt-1">{status.error}</p>
                <p className="text-xs mt-1">API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
            </div>
        )
    }

    return null
} 