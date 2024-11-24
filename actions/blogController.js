'use server'

import connectDB from '@/lib/db'
import Blog from '@/models/blog'

export async function createBlog(formData) {
  try {
    await connectDB();

    const title = formData.get('title')?.trim()
    const content = formData.get('content')?.trim()
    const authorId = formData.get('authorId')

    if (!title || !content) {
      return {
        error: 'Title and content are required'
      }
    }

    const blog = await Blog.create({
      title,
      content,
      author: authorId
    })

    // Serialize the blog object
    const serializedBlog = {
      id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      author: blog.author.toString(),
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    }

    return {
      success: true,
      message: 'Blog created successfully',
      blog: serializedBlog
    }
  } catch (error) {
    console.error('Blog creation error:', error)
    return {
      error: 'Failed to create blog'
    }
  }
}

// Also update getBlogs function
export async function getBlogs(userId) {
  try {
    await connectDB();
    const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 })
    
    // Serialize the blogs array
    const serializedBlogs = blogs.map(blog => ({
      id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      author: blog.author.toString(),
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    }))

    return {
      success: true,
      blogs: serializedBlogs
    }
  } catch (error) {
    console.error('Get blogs error:', error)
    return {
      error: 'Failed to fetch blogs'
    }
  }
}

// Update updateBlog function
export async function updateBlog(formData) {
  try {
    await connectDB();

    const blogId = formData.get('blogId')
    const title = formData.get('title')?.trim()
    const content = formData.get('content')?.trim()
    const authorId = formData.get('authorId')

    const blog = await Blog.findById(blogId)
    
    if (!blog) {
      return {
        error: 'Blog not found'
      }
    }

    if (blog.author.toString() !== authorId) {
      return {
        error: 'Not authorized'
      }
    }

    blog.title = title
    blog.content = content
    await blog.save()

    // Serialize the updated blog
    const serializedBlog = {
      id: blog._id.toString(),
      title: blog.title,
      content: blog.content,
      author: blog.author.toString(),
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString()
    }

    return {
      success: true,
      message: 'Blog updated successfully',
      blog: serializedBlog
    }
  } catch (error) {
    console.error('Blog update error:', error)
    return {
      error: 'Failed to update blog'
    }
  }
}

export async function deleteBlog(formData) {
  try {
    await connectDB();

    const blogId = formData.get('blogId')
    const authorId = formData.get('authorId')

    const blog = await Blog.findById(blogId)
    
    if (!blog) {
      return {
        error: 'Blog not found'
      }
    }

    if (blog.author.toString() !== authorId) {
      return {
        error: 'Not authorized'
      }
    }

    await blog.deleteOne()

    return {
      success: true,
      message: 'Blog deleted successfully',
      blogId: blogId.toString()
    }
  } catch (error) {
    console.error('Blog deletion error:', error)
    return {
      error: 'Failed to delete blog'
    }
  }
}