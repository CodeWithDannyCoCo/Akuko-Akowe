'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../lib/AuthContext'
import {
    LayoutDashboard, Users, FileText, MessageSquare,
    Settings, LogOut, Menu, X, Bell, ArrowLeft
} from 'lucide-react'

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const { user, isAuthenticated, loading, logout } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && (!isAuthenticated || !user?.is_staff)) {
            router.push('/login')
        }
    }, [isAuthenticated, user, loading, router])

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Posts', href: '/admin/posts', icon: FileText },
        { name: 'Comments', href: '/admin/comments', icon: MessageSquare },
        { name: 'Settings', href: '/admin/settings', icon: Settings },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!isAuthenticated || !user?.is_staff) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Top Navigation Bar */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30">
                <div className="flex items-center justify-between h-full px-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
                            aria-label="Toggle menu"
                        >
                            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                        <div className="ml-3 lg:ml-0">
                            <h1 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate">
                                Admin Dashboard
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Back to Main Feed Link */}
                        <Link
                            href="/"
                            className="hidden sm:flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">Main Feed</span>
                        </Link>

                        <button
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Notifications"
                        >
                            <Bell size={20} />
                        </button>
                        <div className="hidden sm:block border-l border-gray-200 dark:border-gray-700 h-8 mx-2"></div>
                        <div className="flex items-center">
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                                    {user.username}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Staff Admin</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar - Updated for better mobile experience */}
            <aside
                className={`fixed top-16 left-0 bottom-0 w-[280px] sm:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 z-30 overflow-y-auto`}
            >
                <nav className="flex flex-col h-full py-4">
                    <div className="flex-1 space-y-1 px-3">
                        {/* Back to Main Feed - Mobile */}
                        <Link
                            href="/"
                            className="flex items-center px-4 py-3 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <ArrowLeft className="w-5 h-5 mr-3 flex-shrink-0" />
                            <span className="font-medium">Back to Main Feed</span>
                        </Link>

                        {/* Regular navigation items */}
                        {navigation.map((item) => {
                            const Icon = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span className="font-medium truncate">{item.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </aside>

            {/* Main Content - Updated for better spacing on mobile */}
            <main className={`pt-16 transition-all duration-200 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    {children}
                </div>
            </main>
        </div>
    )
} 