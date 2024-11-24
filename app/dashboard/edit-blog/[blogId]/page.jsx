// app/dashboard/edit-blog/[blogId]/page.jsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getBlog, updateBlog } from '@/utils/api'

export default function EditBlogPage({ params }) {
  const [blog, setBlog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const blogId = params.blogId

  useEffect(() => {
    if (!blogId) return;
    console.log('Blog ID:', blogId); // Debug log
    loadBlog();
  }, [blogId]);

  async function loadBlog() {
    try {
      setIsLoading(true)
      setError(null)
      const response = await getBlog(blogId)
      console.log('Blog response:', response); // Debug log
      if (response.success && response.blog) {
        setBlog(response.blog)
      } else {
        throw new Error(response.error || 'Failed to load blog')
      }
    } catch (err) {
      console.error('Failed to load blog:', err)
      setError(err.message || 'Failed to load blog')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(formData) {
    try {
      setIsSaving(true)
      setError(null)

      const blogData = {
        title: formData.get('title')?.trim(),
        content: formData.get('content')?.trim()
      }

      console.log('Updating blog with data:', blogData); // Debug log
      const response = await updateBlog(blogId, blogData)
      
      if (response.success) {
        router.refresh()
        router.push('/dashboard')
      } else {
        throw new Error(response.error || 'Failed to update blog')
      }
    } catch (err) {
      console.error('Failed to update blog:', err)
      setError(err.message || 'Failed to update blog')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="alert alert-error">
          <span>Blog not found</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Blog</h1>

      <form action={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Title</span>
          </label>
          <input 
            type="text" 
            name="title"
            defaultValue={blog.title}
            className="input input-bordered" 
            required
            disabled={isSaving}
            minLength={3}
            maxLength={200}
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Content</span>
          </label>
          <textarea 
            name="content"
            defaultValue={blog.content}
            className="textarea textarea-bordered h-32" 
            required
            disabled={isSaving}
            minLength={10}
          />
        </div>

        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={() => router.push('/dashboard')}
            className="btn btn-ghost"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`btn btn-primary flex-1 ${isSaving ? 'loading' : ''}`}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}