'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../lib/AuthContext'
import { api } from '../lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const [charCount, setCharCount] = useState(0)
  const [post, setPost] = useState(null)
  const MAX_CHARS = 120
  const router = useRouter()

  const loadComments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      const [postData, fetchedComments] = await Promise.all([
        api.getPost(postId),
        api.getComments(postId)
      ])
      setPost(postData)
      const sortedComments = fetchedComments.sort((a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
      )
      setComments(sortedComments)
    } catch (error) {
      console.error('Failed to load comments:', error)
      setError('Failed to load comments. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleInputChange = (e) => {
    const input = e.target.value
    if (input.length <= MAX_CHARS) {
      setNewComment(input)
      setCharCount(input.length)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    const trimmedComment = newComment.trim()
    if (!trimmedComment) return

    if (trimmedComment.length > MAX_CHARS) {
      setError(`Comment must be ${MAX_CHARS} characters or less`)
      return
    }

    try {
      setIsSubmitting(true)
      setError('')
      const comment = await api.createComment(postId, trimmedComment)

      // Optimistic update
      const newCommentObj = {
        id: comment.id,
        content: comment.content,
        author: comment.author || {
          username: user.username,
          id: user.id
        },
        created_at: comment.created_at || new Date().toISOString(),
        post: postId
      }

      setComments(prevComments => [newCommentObj, ...prevComments])
      setNewComment('')
      setCharCount(0)
    } catch (error) {
      console.error('Failed to post comment:', error)
      setError('Failed to post comment. Please try again.')
      // Revert optimistic update if needed
      loadComments()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div role="status" className="animate-pulse text-gray-500 dark:text-gray-400 text-center py-4">
        <span className="sr-only">Loading comments...</span>
        Loading comments...
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
            Comments ({comments.length})
          </h2>
          {post && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              On post by{' '}
              <Link
                href={`/profile/${post.author.username}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {post.author.username}
              </Link>
            </p>
          )}
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          ← Back to Feed
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="p-3 text-sm bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4" aria-label="Comments list">
        {comments.map(comment => (
          <div
            key={comment.id}
            className="p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
          >
            <p className="text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">
              {comment.content}
            </p>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
              By{' '}
              <Link
                href={`/profile/${comment.author.username}`}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                {comment.author.username}
              </Link>
              {' '}•{' '}
              {new Date(comment.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
        {comments.length === 0 && !error && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <label htmlFor="comment" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="comment"
            value={newComment}
            onChange={handleInputChange}
            className="w-full p-3 text-sm sm:text-base border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none"
            rows="1"
            placeholder={isAuthenticated ? "Add a comment..." : "Please login to comment"}
            disabled={!isAuthenticated || isSubmitting}
            aria-label="Comment text"
            aria-invalid={error ? "true" : "false"}
            maxLength={MAX_CHARS}
          ></textarea>
          <div className="absolute bottom-2 right-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {charCount}/{MAX_CHARS}
          </div>
        </div>
        <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            {isAuthenticated ?
              "Press Enter to submit, Shift + Enter for new line" :
              "Please login to comment"
            }
          </span>
          <button
            type="submit"
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${isAuthenticated
              ? isSubmitting
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
              } text-white`}
            disabled={!isAuthenticated || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : isAuthenticated ? 'Post Comment' : 'Login to Comment'}
          </button>
        </div>
      </form>
    </div>
  )
}

