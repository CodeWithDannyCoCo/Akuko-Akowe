'use client';

import { useEffect, useState } from 'react';

export default function APITest() {
    const [status, setStatus] = useState({ loading: true, error: null, data: null });

    useEffect(() => {
        const testAPI = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                console.log('Response status:', response.status);
                const data = await response.json();
                setStatus({
                    loading: false,
                    error: null,
                    data: data,
                });
            } catch (error) {
                console.error('API Test Error:', error);
                setStatus({
                    loading: false,
                    error: error.message,
                    data: null,
                });
            }
        };

        testAPI();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>
            
            <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded">
                    <h2 className="font-semibold">API URL:</h2>
                    <code className="block mt-2">{process.env.NEXT_PUBLIC_API_URL}</code>
                </div>

                {status.loading && (
                    <div className="text-blue-500">Testing connection...</div>
                )}

                {status.error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded">
                        <h2 className="font-semibold">Error:</h2>
                        <pre className="mt-2 whitespace-pre-wrap">{status.error}</pre>
                    </div>
                )}

                {status.data && (
                    <div className="p-4 bg-green-100 text-green-700 rounded">
                        <h2 className="font-semibold">Success:</h2>
                        <pre className="mt-2 whitespace-pre-wrap">
                            {JSON.stringify(status.data, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
} 