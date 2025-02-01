'use client'

import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { Search, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function CommentsManagement() {
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchComments()
    }, [])

    const fetchComments = async () => {
        try {
            setLoading(true)
            const data = await api.getAdminComments()
            setComments(data)
        } catch (err) {
            console.error('Error fetching comments:', err)
            setError('Failed to load comments')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return

        try {
            await api.deleteComment(commentId)
            setComments(comments.filter(comment => comment.id !== commentId))
        } catch (err) {
            console.error('Error deleting comment:', err)
        }
    }

    const filteredComments = comments.filter(comment =>
        comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comment.author.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-4 rounded-lg">
                {error}
            </div>
        )
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Comments Management
            </h1>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search comments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Comments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Comment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Author
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Post
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredComments.map((comment) => (
                                <tr key={comment.id}>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                            {comment.content}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 flex-shrink-0">
                                                {comment.author.avatar ? (
                                                    <img
                                                        className="h-8 w-8 rounded-full object-cover"
                                                        src={comment.author.avatar}
                                                        alt={comment.author.username}
                                                    />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                        <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                            {comment.author.username[0].toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm text-gray-900 dark:text-white">
                                                    {comment.author.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 dark:text-white line-clamp-1">
                                            <Link href={`/posts/${comment.post.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                                                {comment.post.title}
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(comment.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link
                                            href={`/posts/${comment.post.id}`}
                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-4"
                                            title="View post"
                                        >
                                            <Eye size={20} />
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                            title="Delete comment"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
} 