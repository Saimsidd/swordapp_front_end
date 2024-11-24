// app/dashboard/new-blog/page.jsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBlog } from '@/utils/api'

export default function NewBlogPage() {
 const [isLoading, setIsLoading] = useState(false)
 const [error, setError] = useState(null)
 const router = useRouter()

 async function handleSubmit(formData) {
   try {
     setIsLoading(true)
     setError(null)

     const title = formData.get('title')?.trim()
     const content = formData.get('content')?.trim()

     if (!title || !content) {
       setError('Title and content are required')
       return
     }
     
     const blogData = { title, content }
     console.log('Sending blog data:', blogData) // Debug log

     const response = await createBlog(blogData)
     console.log('Create blog response:', response) // Debug log

     if (response.success) {
       router.push('/dashboard')
       router.refresh()
     } else {
       throw new Error(response.error || 'Failed to create blog')
     }
   } catch (err) {
     console.error('Failed to create blog:', err)
     setError(err.message || 'Failed to create blog')
   } finally {
     setIsLoading(false)
   }
 }

 return (
   <div className="max-w-2xl mx-auto p-4">
     <div className="flex justify-between items-center mb-6">
       <h1 className="text-2xl font-bold">Create New Blog</h1>
       <button 
         onClick={() => router.push('/dashboard')}
         className="btn btn-ghost"
       >
         Cancel
       </button>
     </div>

     {error && (
       <div className="alert alert-error mb-4">
         <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <span>{error}</span>
       </div>
     )}

     <form action={handleSubmit} className="space-y-6">
       <div className="form-control">
         <label className="label">
           <span className="label-text">Title</span>
           <span className="label-text-alt text-error">*</span>
         </label>
         <input 
           type="text" 
           name="title"
           placeholder="Enter your blog title"
           className="input input-bordered w-full" 
           required
           disabled={isLoading}
           minLength={3}
           maxLength={200}
         />
       </div>

       <div className="form-control">
         <label className="label">
           <span className="label-text">Content</span>
           <span className="label-text-alt text-error">*</span>
         </label>
         <textarea 
           name="content"
           placeholder="Write your blog content here..."
           className="textarea textarea-bordered min-h-[200px]" 
           required
           disabled={isLoading}
           minLength={10}
         />
       </div>

       <div className="flex gap-4 justify-end">
         <button 
           type="button" 
           onClick={() => router.push('/dashboard')}
           className="btn btn-ghost"
           disabled={isLoading}
         >
           Cancel
         </button>
         <button 
           type="submit" 
           className={`btn btn-primary min-w-[150px] ${isLoading ? 'loading' : ''}`}
           disabled={isLoading}
         >
           {isLoading ? (
             <>
               <span className="loading loading-spinner loading-sm"></span>
               Saving...
             </>
           ) : (
             'Create Blog'
           )}
         </button>
       </div>
     </form>

     {/* Optional: Add a preview section */}
     {/* <div className="mt-8">
       <h2 className="text-lg font-semibold mb-2">Preview</h2>
       <div className="prose max-w-none">
         <h1>{title}</h1>
         <p>{content}</p>
       </div>
     </div> */}
   </div>
 )
}