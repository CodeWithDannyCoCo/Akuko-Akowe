'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '../../lib/api'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function ResetPasswordContent() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token')
        }
        if (!email) {
            setError('Invalid or missing email')
        }
    }, [token, email])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!email) {
            setError('Invalid or missing email')
            setLoading(false)
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long')
            setLoading(false)
            return
        }

        try {
            await api.resetPassword(token, password, email)
            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.')
            console.error('Password reset error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Password Reset Successful
                </h2>
                <p className="text-gray-600 mb-6">
                    Your password has been successfully reset. You will be redirected to the login page shortly.
                </p>
                <Link
                    href="/login"
                    className="text-blue-500 hover:text-blue-600"
                >
                    Go to Login
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    New Password
                </label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300
                        bg-white text-gray-900
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-colors duration-200"
                        required
                        disabled={loading}
                        minLength={8}
                        placeholder="Enter new password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters
                </p>
            </div>

            <div>
                <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Confirm New Password
                </label>
                <div className="relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300
                        bg-white text-gray-900
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-colors duration-200"
                        required
                        disabled={loading}
                        minLength={8}
                        placeholder="Confirm new password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        {showConfirmPassword ? (
                            <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                            <EyeIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                className={`w-full bg-blue-500 text-white px-4 py-2.5 rounded-lg
                font-medium hover:bg-blue-600
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-colors duration-200
                ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={loading || !token}
            >
                {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
        </form>
    )
} 