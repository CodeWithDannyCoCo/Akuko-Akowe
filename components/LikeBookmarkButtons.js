'use client'

import { useState, useEffect } from 'react'
import { Heart, Bookmark } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'

export default function LikeBookmarkButtons({
  postId,
  initialLikes = 0,
  initialBookmarks = 0,
  isLiked: initialIsLiked = false,
  isBookmarked: initialIsBookmarked = false,
  onUpdate
}) {
  const [likes, setLikes] = useState(initialLikes)
  const [bookmarks, setBookmarks] = useState(initialBookmarks)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { isAuthenticated } = useAuth()

  // Update local state when props change
  useEffect(() => {
    setLikes(initialLikes)
    setBookmarks(initialBookmarks)
    setIsLiked(initialIsLiked)
    setIsBookmarked(initialIsBookmarked)
  }, [initialLikes, initialBookmarks, initialIsLiked, initialIsBookmarked])

  const handleLike = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    if (isLoading) return

    const wasLiked = isLiked
    const prevLikes = likes

    try {
      setIsLoading(true)
      setError('')

      // Optimistic update
      setIsLiked(!wasLiked)
      setLikes(wasLiked ? prevLikes - 1 : prevLikes + 1)

      if (wasLiked) {
        await api.unlikePost(postId)
      } else {
        await api.likePost(postId)
      }

      // Notify parent component of the update
      if (onUpdate) {
        onUpdate({
          likes: wasLiked ? prevLikes - 1 : prevLikes + 1,
          bookmarks,
          isLiked: !wasLiked,
          isBookmarked
        })
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
      setError('Failed to update like status')
      // Revert the optimistic update if the API call failed
      setIsLiked(wasLiked)
      setLikes(prevLikes)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    if (isLoading) return

    const wasBookmarked = isBookmarked
    const prevBookmarks = bookmarks

    try {
      setIsLoading(true)
      setError('')

      // Optimistic update
      setIsBookmarked(!wasBookmarked)
      setBookmarks(wasBookmarked ? prevBookmarks - 1 : prevBookmarks + 1)

      if (wasBookmarked) {
        await api.unbookmarkPost(postId)
      } else {
        await api.bookmarkPost(postId)
      }

      // Notify parent component of the update
      if (onUpdate) {
        onUpdate({
          likes,
          bookmarks: wasBookmarked ? prevBookmarks - 1 : prevBookmarks + 1,
          isLiked,
          isBookmarked: !wasBookmarked
        })
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      setError('Failed to update bookmark status')
      // Revert the optimistic update if the API call failed
      setIsBookmarked(wasBookmarked)
      setBookmarks(prevBookmarks)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {error && (
        <div className="text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
          } hover:text-red-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        aria-label={isLiked ? 'Unlike post' : 'Like post'}
        title={isLiked ? 'Unlike post' : 'Like post'}
      >
        <Heart
          className={isLiked ? 'fill-current' : ''}
          size={20}
        />
        <span className="text-sm font-medium">{likes}</span>
      </button>
      <button
        onClick={handleBookmark}
        disabled={isLoading}
        className={`flex items-center space-x-1 ${isBookmarked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
          } hover:text-blue-600 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
      >
        <Bookmark
          className={isBookmarked ? 'fill-current' : ''}
          size={20}
        />
        <span className="text-sm font-medium">{bookmarks}</span>
      </button>
    </div>
  )
}

