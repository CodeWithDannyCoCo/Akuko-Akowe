'use client';

export default function Error({ error, reset }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-red-500 mb-4">
                {error.message || 'Something went wrong'}
            </div>
            <button
                onClick={reset}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
                Try again
            </button>
        </div>
    );
} 