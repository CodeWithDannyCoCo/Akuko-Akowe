'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export default function HealthCheck() {
    const [health, setHealth] = useState({ status: 'checking', message: 'Checking API status...' })
    const [error, setError] = useState(null)

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await fetch(`${api.API_URL}/health/`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                })

                if (!response.ok) {
                    throw new Error(`API returned ${response.status}`)
                }

                const data = await response.json()
                setHealth(data)
                setError(null)
            } catch (err) {
                setError(err.message)
                setHealth({ status: 'unhealthy', message: 'API is not responding' })
            }
        }

        checkHealth()
        // Set up polling every 30 seconds
        const interval = setInterval(checkHealth, 30000)

        return () => clearInterval(interval)
    }, [])

    if (error) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
                <p>Error: {error}</p>
            </div>
        )
    }

    return (
        <div className={`p-4 rounded-md ${health.status === 'healthy'
            ? 'bg-green-100 text-green-700'
            : health.status === 'checking'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}>
            <p className="font-medium">Status: {health.status}</p>
            <p>{health.message}</p>
            {health.database && <p>Database: {health.database}</p>}
            {health.timestamp && (
                <p className="text-sm mt-2">
                    Last checked: {new Date(health.timestamp).toLocaleString()}
                </p>
            )}
        </div>
    )
} 