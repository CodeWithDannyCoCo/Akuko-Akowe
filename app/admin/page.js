'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '../../lib/api'
import DashboardCard from './components/DashboardCard'
import LoadingSpinner from '../../components/LoadingSpinner'
import Logo from '../../components/Logo'
import {
    Users, FileText, MessageSquare, TrendingUp,
    Calendar, Filter, ArrowUp, ArrowDown
} from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import { chartConfig } from './utils/chartConfig'

export default function AdminDashboard() {
    const router = useRouter()
    const [stats, setStats] = useState(null)
    const [activities, setActivities] = useState([])
    const [timeRange, setTimeRange] = useState('week')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchDashboardData()
    }, [timeRange])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            const [statsData, activityData] = await Promise.all([
                api.getAdminStats(),
                api.getAdminActivity()
            ])
            setStats(statsData)
            setActivities(activityData)
        } catch (err) {
            setError(err.message || 'Failed to load dashboard data')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <LoadingSpinner />
    if (error) return <div className="text-red-500">{error}</div>

    const StatCard = ({ title, value, trend, icon: Icon, color }) => (
        <DashboardCard>
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${color}`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {trend >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        </span>
                        <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Math.abs(trend)}%
                        </span>
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{title}</p>
                </div>
            </div>
        </DashboardCard>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard Overview
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Track your platform's performance and growth
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="year">Last 12 Months</option>
                    </select>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                    title="Total Users"
                    value={stats?.users?.total || 0}
                    trend={stats?.users?.trend || 0}
                    icon={Users}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Posts"
                    value={stats?.posts?.total || 0}
                    trend={stats?.posts?.trend || 0}
                    icon={FileText}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Comments"
                    value={stats?.comments?.total || 0}
                    trend={stats?.comments?.trend || 0}
                    icon={MessageSquare}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Engagement Rate"
                    value={`${stats?.engagement?.total || 0}%`}
                    trend={stats?.engagement?.trend || 0}
                    icon={TrendingUp}
                    color="bg-orange-500"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <DashboardCard className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        User Growth
                    </h3>
                    <div className="h-[250px] sm:h-[300px]">
                        {stats?.userGrowth && <Line {...chartConfig(stats.userGrowth)} />}
                    </div>
                </DashboardCard>
                <DashboardCard className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Content Activity
                    </h3>
                    <div className="h-[250px] sm:h-[300px]">
                        {stats?.contentActivity && <Bar {...chartConfig(stats.contentActivity)} />}
                    </div>
                </DashboardCard>
            </div>

            {/* Recent Activity */}
            <DashboardCard className="mt-4 sm:mt-6">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Activity
                    </h3>
                    <button
                        onClick={() => router.push('/admin/activity')}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800"
                    >
                        View All
                    </button>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-full flex-shrink-0 ${activity.type === 'success'
                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-600'
                                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                                    }`}>
                                    {activity.icon === 'Users' ? <Users className="w-4 h-4" /> :
                                        activity.icon === 'FileText' ? <FileText className="w-4 h-4" /> :
                                            <MessageSquare className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 dark:text-white break-words">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {new Date(activity.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardCard>
        </div>
    )
} 