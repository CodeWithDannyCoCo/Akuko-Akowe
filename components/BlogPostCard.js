'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import LikeBookmarkButtons from './LikeBookmarkButtons'
import { MessageCircle, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import { api, getFullAvatarUrl } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

export default function BlogPostCard({ post, onPostUpdated, onPostDeleted }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(post.title)
  const [editedContent, setEditedContent] = useState(post.content)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isProfilePage = pathname.startsWith('/profile')
  const isPostAuthor = user && user.username === post.author.username

  const editorRef = useRef(null);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleEdit = () => {
    setIsEditing(true)
    setEditedTitle(post.title)
    setEditedContent(post.content)
  }

  const handleSave = async () => {
    try {
      const updatedPost = await api.updatePost(post.id, {
        title: editedTitle,
        content: editedContent,
      })
      setIsEditing(false)
      if (onPostUpdated) {
        onPostUpdated(updatedPost)
      }
    } catch (err) {
      setError(err.message || 'Failed to update post')
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.deletePost(post.id)
        if (onPostDeleted) {
          onPostDeleted(post.id)
        }
      } catch (err) {
        setError(err.message || 'Failed to delete post')
      }
    }
  }

  const renderAuthorAvatar = () => {
    const avatarUrl = post.author?.avatar ? getFullAvatarUrl(post.author.avatar) : null;

    if (avatarUrl) {
      return (
        <Link href={`/profile/${post.author.username}`} className="block">
          <div className="relative w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all">
            <Image
              src={avatarUrl}
              alt={`${post.author.username}'s avatar`}
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
        </Link>
      );
    }

    return (
      <Link href={`/profile/${post.author.username}`} className="block">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400 transition-all">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {post.author.username.charAt(0).toUpperCase()}
          </span>
        </div>
      </Link>
    );
  };

  // Function to truncate content
  const truncateContent = (content) => {
    // Create a temporary div to handle HTML content
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    const text = tempDiv.textContent || tempDiv.innerText
    const words = text.split(' ')
    if (words.length > 50) {
      return words.slice(0, 50).join(' ') + '...'
    }
    return content
  }

  // Function to render content with formatting
  const renderFormattedContent = (content) => {
    if (content.length > 300) {
      return (
        <div
          className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: truncateContent(content)
          }}
        />
      )
    }
    return (
      <div
        className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    )
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto w-full">
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          {renderAuthorAvatar()}
          <div className="ml-3 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${post.author.username}`}
                className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate"
              >
                {post.author.username}
              </Link>
              <time dateTime={post.created_at} className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {new Date(post.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </time>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-0 focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
            />
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Bold"
              >
                <Bold size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('italic')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Italic"
              >
                <Italic size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('underline')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Underline"
              >
                <Underline size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('justifyLeft')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Left"
              >
                <AlignLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('justifyCenter')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Center"
              >
                <AlignCenter size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('justifyRight')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Align Right"
              >
                <AlignRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('justifyFull')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Justify"
              >
                <AlignJustify size={18} />
              </button>
            </div>
            <div
              ref={editorRef}
              contentEditable
              className="w-full min-h-[100px] px-3 py-2 rounded-lg dark:bg-gray-700 dark:text-white text-sm focus:outline-none focus:ring-0 focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors overflow-y-auto prose dark:prose-invert max-w-none"
              onInput={(e) => setEditedContent(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: editedContent }}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              {post.title}
            </h2>
            {renderFormattedContent(post.content)}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Link
                    href={`/post/${post.id}`}
                    className="text-sm sm:text-base text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Read More
                  </Link>
                  <Link
                    href={`/post/${post.id}`}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="View comments"
                  >
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">{post.comments_count || 0}</span>
                  </Link>
                </div>
                {isProfilePage ? (
                  // Profile page: Edit and Delete buttons
                  isPostAuthor && (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )
                ) : (
                  // General/Personalized feed: Like and Bookmark buttons
                  <div className="flex items-center">
                    <LikeBookmarkButtons
                      postId={post.id}
                      initialLikes={post.likes_count}
                      initialBookmarks={post.bookmarks_count}
                      isLiked={post.is_liked}
                      isBookmarked={post.is_bookmarked}
                      onUpdate={onPostUpdated}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  )
}

