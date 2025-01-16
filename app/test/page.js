'use client'

import { useEffect, useState } from 'react'
import { api } from '../../lib/api'

export default function TestConnection() {
    const [status, setStatus] = useState('Loading...')
    const [error, setError] = useState(null)

    useEffect(() => {
        const testConnection = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/test/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                const data = await response.json()
                setStatus('Connected to backend! Response: ' + JSON.stringify(data))
            } catch (err) {
                setError('Failed to connect to backend: ' + err.message)
                console.error('Connection error:', err)
            }
        }

        testConnection()
    }, [])

    return (
        <div className="p-4">
            <h1 className="text-2xl mb-4">Backend Connection Test</h1>
            {error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div className="text-green-500">{status}</div>
            )}
        </div>
    )
} 