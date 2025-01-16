'use client'

import { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import BlogPostCard from '../../../components/BlogPostCard'
import Image from 'next/image'
import { api, getFullAvatarUrl } from '../../../lib/api'
import { useAuth } from '../../../lib/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, UserMinus, Settings, LogOut, LayoutDashboard } from 'lucide-react'

export default function UserProfile({ params }) {
  const [profileData, setProfileData] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activities, setActivities] = useState([])
  const { user: currentUser, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const { username } = params

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const username = params.username || currentUser?.username
        if (!username) {
          setError('No user specified')
          setLoading(false)
          return
        }

        const [userData, userPosts, userActivities] = await Promise.all([
          api.getUserProfile(username),
          api.getUserPosts(username),
          api.getUserActivity(username)
        ])

        setProfileData(userData)
        setIsFollowing(userData.is_followed)
        setPosts(userPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)))
        setActivities(userActivities)
      } catch (err) {
        console.error('Error fetching profile data:', err)
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [params.username, currentUser])

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    try {
      setFollowLoading(true)
      if (isFollowing) {
        await api.unfollowUser(profileData.username)
        setIsFollowing(false)
        setProfileData(prev => ({
          ...prev,
          followers_count: prev.followers_count - 1
        }))
      } else {
        await api.followUser(profileData.username)
        setIsFollowing(true)
        setProfileData(prev => ({
          ...prev,
          followers_count: prev.followers_count + 1
        }))
      }
    } catch (err) {
      console.error('Error toggling follow:', err)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex items-center space-x-6">
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        </main>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center text-gray-600 dark:text-gray-400">
            User not found
          </div>
        </main>
      </div>
    )
  }

  const isOwnProfile = currentUser?.username === profileData.username

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8">
            {isOwnProfile && (
              <div className="flex items-center justify-end gap-2 mb-4 sm:hidden">
                <Link
                  href="/settings"
                  className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:space-x-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-0">
                <Image
                  src={profileData.avatar ? getFullAvatarUrl(profileData.avatar) : '/default-avatar.png'}
                  alt={profileData.username}
                  fill
                  className="rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
                  sizes="(max-width: 640px) 96px, 128px"
                  priority
                />
              </div>

              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col space-y-4 sm:space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center sm:text-left mb-0">
                      {profileData.username}
                    </h1>

                    <div className="hidden sm:flex items-center justify-center sm:justify-end space-x-3">
                      {isOwnProfile ? (
                        <>
                          <Link
                            href="/settings"
                            className="flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Settings className="w-4 h-4 mr-1.5" />
                            <span>Settings</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-1.5" />
                            <span>Logout</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleFollowToggle}
                          disabled={followLoading}
                          className={`flex items-center px-4 py-1.5 text-sm rounded-lg transition-colors ${isFollowing
                            ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                            }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-1.5" />
                              <span>Unfollow</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-1.5" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <div className="flex sm:hidden items-center justify-center mb-4">
                      <button
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                        className={`flex items-center px-4 py-1.5 text-sm rounded-lg transition-colors ${isFollowing
                          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                          : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                          }`}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-1.5" />
                            <span>Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1.5" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {profileData.bio && (
                    <p className="text-gray-600 dark:text-gray-300 text-center sm:text-left">
                      {profileData.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 sm:gap-6 text-sm">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{posts.length}</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">posts</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{profileData.followers_count}</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">followers</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">{profileData.following_count}</span>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">following</span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left mt-4 sm:mt-2">
                    Joined {profileData.date_joined ? new Date(profileData.date_joined).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric'
                    }) : 'Unknown date'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {isOwnProfile ? 'Your Posts' : `${profileData.username}'s Posts`}
              </h2>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
              >
                ← Back to Feed
              </button>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              {activities.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {activities.likes?.slice(0, 5).map(like => (
                    <div key={like.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="mr-2">❤️</span>
                      <span>Liked a post</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-400">{new Date(like.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {activities.comments?.slice(0, 5).map(comment => (
                    <div key={comment.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="mr-2">💬</span>
                      <span>Commented on a post</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {activities.bookmarks?.slice(0, 5).map(bookmark => (
                    <div key={bookmark.id} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <span className="mr-2">🔖</span>
                      <span>Bookmarked a post</span>
                      <span className="mx-2">•</span>
                      <span className="text-gray-400">{new Date(bookmark.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No posts yet
              </div>
            ) : (
              <div className="space-y-6">
                {posts.map(post => (
                  <BlogPostCard
                    key={post.id}
                    post={post}
                    onPostUpdated={(updatedPost) => {
                      setPosts(prevPosts =>
                        prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p)
                      )
                    }}
                    onPostDeleted={(deletedPostId) => {
                      setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId))
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

