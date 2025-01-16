'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '../../components/Header'
import ProfilePictureCropModal from '../../components/ProfilePictureCropModal'
import { useAuth } from '../../lib/AuthContext'
import { useTheme } from '../../lib/ThemeContext'
import { api, getFullAvatarUrl } from '../../lib/api'
import { Sun, Moon, Camera } from 'lucide-react'

export default function Settings() {
  const { user, isAuthenticated, loading, updateUser } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    website: '',
    avatar: null
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')

    // Only redirect if we're sure there's no authentication
    if (!loading && !token && !storedUser && !isAuthenticated) {
      router.push('/login')
      return
    }

    // Update form data when user data is available
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        website: user.website || '',
        avatar: null
      })
      setPreviewImage(user.avatar ? getFullAvatarUrl(user.avatar) : null)
    }
  }, [user, isAuthenticated, loading, router])

  // Show loading state while checking authentication
  if (loading || (!user && isAuthenticated)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!isAuthenticated || !user) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)
    setUploadError('')

    try {
      const formDataToSend = new FormData()

      // Only append non-empty values
      if (formData.username) formDataToSend.append('username', formData.username)
      if (formData.email) formDataToSend.append('email', formData.email)
      if (formData.bio) formDataToSend.append('bio', formData.bio)
      if (formData.website) formDataToSend.append('website', formData.website)

      // Handle avatar upload with specific validation
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar)
      }

      const data = await api.updateUserProfile(user.username, formDataToSend)

      // Update local storage and auth context with new user data
      const currentUser = JSON.parse(localStorage.getItem('user'))
      const updatedUser = {
        ...currentUser,
        ...data,
        avatar: data.avatar ? getFullAvatarUrl(data.avatar) : null
      }

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // Update auth context
      updateUser(updatedUser)

      // Reset form state
      setFormData(prev => ({
        ...prev,
        avatar: null
      }))
      setPreviewImage(updatedUser.avatar)
      setSuccess(true)

      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)

    } catch (err) {
      console.error('Settings update error:', err)
      if (err.message.includes('avatar')) {
        setUploadError(err.message || 'Failed to upload profile picture')
      } else {
        setError(err.message || 'Failed to update profile')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCroppedImage = async (croppedImageUrl) => {
    try {
      // Convert the blob URL to a File object
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' })

      // Update form data and preview
      setFormData(prev => ({ ...prev, avatar: file }))
      setPreviewImage(croppedImageUrl)
    } catch (err) {
      setUploadError('Failed to process cropped image')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white rounded-lg transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>

          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100 rounded-lg">
              Profile updated successfully!
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="mb-8">
              <label htmlFor="profilePicture" className="block text-gray-700 dark:text-gray-200 font-bold mb-3">
                Profile Picture
              </label>
              <div className="flex flex-col space-y-2">
                <div className="relative w-fit">
                  <div className="w-28 h-28 rounded-full overflow-hidden relative bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-200 dark:ring-gray-600">
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="112px"
                        priority
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl font-medium text-gray-500 dark:text-gray-400">
                          {formData.username ? formData.username[0].toUpperCase() : user.username[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className="absolute bottom-0 right-0 transform translate-x-1/4 translate-y-1/4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2.5 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Change profile picture"
                  >
                    <Camera size={18} className="stroke-[1.5]" />
                  </button>
                </div>
                {uploadError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
                required
                disabled={isLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="bio" className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                Bio
              </label>
              <div className="relative">
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => {
                    const text = e.target.value
                    if (text.length <= 120) {
                      setFormData(prev => ({ ...prev, bio: text }))
                    }
                  }}
                  className="w-full h-24 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors resize-none"
                  maxLength={120}
                  placeholder="Tell us about yourself..."
                  disabled={isLoading}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                  {formData.bio?.length || 0}/120
                </div>
              </div>
            </div>
            <div className="mb-6">
              <label htmlFor="website" className="block text-gray-700 dark:text-gray-200 font-bold mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-600 transition-colors"
                disabled={isLoading}
              />
            </div>
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>

      <ProfilePictureCropModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        onSave={handleCroppedImage}
      />
    </div>
  )
}

