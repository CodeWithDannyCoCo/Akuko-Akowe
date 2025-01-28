'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { Shield, ShieldOff, Trash2, Search } from 'lucide-react'
import DashboardCard from '../components/DashboardCard'

export default function UsersManagement() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const data = await api.getAdminUsers()
            setUsers(data)
        } catch (err) {
            setError('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleToggle = async (userId, currentRole) => {
        try {
            const newRole = currentRole === 'staff' ? 'user' : 'staff'
            await api.updateUserRole(userId, newRole)
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ))
        } catch (err) {
            console.error('Error updating user role:', err)
        }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return

        try {
            await api.deleteUser(userId)
            setUsers(users.filter(user => user.id !== userId))
        } catch (err) {
            console.error('Error deleting user:', err)
        }
    }

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    Users Management
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage user accounts and permissions
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* Users List */}
            <DashboardCard>
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th scope="col" className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th scope="col" className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        {user.avatar ? (
                                                            <img
                                                                className="h-10 w-10 rounded-full object-cover"
                                                                src={user.avatar}
                                                                alt={user.username}
                                                            />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                                <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                                                    {user.username && user.username.length > 0 ? user.username[0].toUpperCase() : '?'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {user.username}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(user.date_joined).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'staff'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-400'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleRoleToggle(user.id, user.role)}
                                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg"
                                                        title={user.role === 'staff' ? 'Remove staff role' : 'Make staff'}
                                                    >
                                                        {user.role === 'staff' ? (
                                                            <ShieldOff size={18} />
                                                        ) : (
                                                            <Shield size={18} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DashboardCard>
        </div>
    )
} 