'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '../../../components/Header'
import CommentSection from '../../../components/CommentSection'
import LikeBookmarkButtons from '../../../components/LikeBookmarkButtons'
import { api } from '../../../lib/api'
import Image from 'next/image'

export default function PostDetail({ params }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.getPost(params.id)
        setPost(data)
        // Update the page title
        document.title = `${data.title} - Blog Post`
      } catch (err) {
        console.error('Error fetching post:', err)
        setError(err.message || 'Failed to load post')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()

    // Cleanup function to reset title
    return () => {
      document.title = 'Blog'
    }
  }, [params.id])

  const handlePostUpdate = (updates) => {
    setPost(prevPost => ({
      ...prevPost,
      likes_count: updates.likes_count,
      bookmarks_count: updates.bookmarks_count,
      is_liked: updates.is_liked,
      is_bookmarked: updates.is_bookmarked
    }));
  };

  const renderAuthorAvatar = () => {
    const avatarUrl = post.author?.avatar ? api.getFullAvatarUrl(post.author.avatar) : null;

    if (avatarUrl) {
      return (
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={avatarUrl}
            alt={`${post.author.username}'s avatar`}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      );
    }

    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
          {post.author.username.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div role="status" className="animate-pulse space-y-4 sm:space-y-6">
            <div className="h-8 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div role="alert" className="p-4 sm:p-6 bg-red-100 text-red-700 rounded-lg">
            <p className="text-sm sm:text-base font-medium">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              ← Back to Feed
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-4 sm:p-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {post.title}
            </h1>

            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                {post.author.avatar ? (
                  <Image
                    src={api.getFullAvatarUrl(post.author.avatar)}
                    alt={`${post.author.username}'s avatar`}
                    fill
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {post.author.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                  {post.author.username}
                </p>
                <time
                  dateTime={post.created_at}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                >
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none text-sm sm:text-base text-gray-900 dark:text-gray-100"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-700">
              <LikeBookmarkButtons
                postId={post.id}
                initialLikes={post.likes_count}
                initialBookmarks={post.bookmarks_count}
                isLiked={post.is_liked}
                isBookmarked={post.is_bookmarked}
                onUpdate={handlePostUpdate}
              />
            </div>
          </div>
        </article>

        <div className="mt-6 sm:mt-8">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  )
}

