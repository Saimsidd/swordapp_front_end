// app/dashboard/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getBlogs, deleteBlog } from '@/utils/api'

export default function DashboardPage() {
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    loadBlogs()
  }, [])

  async function loadBlogs() {
    try {
      setIsLoading(true)
      const response = await getBlogs()
      if (response.success) {
        setBlogs(response.blogs)
        setError(null)
      } else {
        throw new Error(response.error || 'Failed to load blogs')
      }
    } catch (err) {
      console.error('Failed to load blogs:', err)
      setError('Failed to load blogs')
      if (err.message.includes('401')) {
        router.push('/login')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this blog?')) return

    try {
      const response = await deleteBlog(id)
      if (response.success) {
        setBlogs(blogs.filter(blog => blog.id !== id))
      } else {
        throw new Error(response.error || 'Failed to delete blog')
      }
    } catch (err) {
      console.error('Failed to delete blog:', err)
      setError('Failed to delete blog')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Blogs</h1>
        <Link 
          href="/dashboard/new-blog" 
          className="btn btn-primary"
        >
          Create New Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-10">
          <div className="max-w-md mx-auto">
            <p className="text-gray-600 mb-4">No blogs yet. Start writing your first blog!</p>
            <Link 
              href="/dashboard/new-blog" 
              className="btn btn-primary"
            >
              Create Your First Blog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-200">
              <div className="card-body">
                <h2 className="card-title text-xl font-bold">{blog.title}</h2>
                <p className="text-gray-600 line-clamp-3 mt-2">{blog.content}</p>
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <small className="text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </small>
                  <div className="card-actions justify-end">
                    <Link 
                      href={`/dashboard/edit-blog/${blog.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(blog.id)}
                      className="btn btn-sm btn-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}