'use client'

import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import Header from '../../components/Header'
import BlogPostCard from '../../components/BlogPostCard'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedType, setFeedType] = useState('all') // 'all' or 'personalized'

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let data;
        if (feedType === 'personalized') {
          data = await api.getPersonalizedPosts()
        } else {
          data = await api.getPosts()
        }
        setPosts(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(err.message || 'Failed to load posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [feedType])

  if (error) {
    return (
      <div>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-red-500">Error: {error}</div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              {feedType === 'personalized' ? 'Your Personalized Feed' : 'Recent Posts'}
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setFeedType('all')}
                className={`px-4 py-2 rounded ${feedType === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                All Posts
              </button>
              <button
                onClick={() => setFeedType('personalized')}
                className={`px-4 py-2 rounded ${feedType === 'personalized'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                Personalized Feed
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : posts.length > 0 ? (
            <div className="grid gap-6">
              {posts.map(post => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              {feedType === 'personalized'
                ? 'No posts found in your personalized feed. Try following more users!'
                : 'No posts found'}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

