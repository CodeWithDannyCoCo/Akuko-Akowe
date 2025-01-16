'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function HealthCheck() {
    const [status, setStatus] = useState({ error: null, loading: true });

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setStatus({ error: null, loading: false });
                console.log('Health check successful:', data);
            } catch (error) {
                console.error('Health check failed:', error);
                setStatus({ 
                    error: `Connection failed: ${error.message}. Please check the API URL: ${process.env.NEXT_PUBLIC_API_URL}`, 
                    loading: false 
                });
            }
        };

        const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
        checkHealth(); // Initial check

        return () => clearInterval(interval);
    }, []);

    if (status.loading) return null;

    if (status.error) {
        return (
            <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-medium">Backend Connection Error</p>
                <p className="text-xs mt-1">{status.error}</p>
            </div>
        );
    }

    return null;
} 