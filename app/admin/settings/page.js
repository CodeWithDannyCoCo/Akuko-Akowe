'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { Save } from 'lucide-react'

export default function SettingsManagement() {
    const [settings, setSettings] = useState({
        site_name: '',
        maintenance_mode: false,
        allow_registration: true,
        default_user_role: 'user'
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            const data = await api.getAdminSettings()
            setSettings(data)
        } catch (err) {
            console.error('Error fetching settings:', err)
            setError('Failed to load settings')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSuccess(false)
        setError(null)

        try {
            await api.updateAdminSettings(settings)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            console.error('Error updating settings:', err)
            setError('Failed to update settings')
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Site Settings
            </h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Site Name */}
                    <div>
                        <label htmlFor="site_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Site Name
                        </label>
                        <input
                            type="text"
                            id="site_name"
                            name="site_name"
                            value={settings.site_name}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Maintenance Mode */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="maintenance_mode"
                            name="maintenance_mode"
                            checked={settings.maintenance_mode}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="maintenance_mode" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Maintenance Mode
                        </label>
                    </div>

                    {/* Allow Registration */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="allow_registration"
                            name="allow_registration"
                            checked={settings.allow_registration}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="allow_registration" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                            Allow New User Registration
                        </label>
                    </div>

                    {/* Default User Role */}
                    <div>
                        <label htmlFor="default_user_role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Default User Role
                        </label>
                        <select
                            id="default_user_role"
                            name="default_user_role"
                            value={settings.default_user_role}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                        </select>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-4 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-200 p-4 rounded-lg">
                            Settings updated successfully!
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 