import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/blog';
import mongoose from 'mongoose';

// Helper function to get segment from URL
function getBlogIdFromPath(request) {
    const segments = request.url.split('/');
    return segments[segments.length - 1];
}

// GET: Fetch a single blog
export async function GET(request) {
    try {
        const blogId = getBlogIdFromPath(request);
        console.log('API GET: Starting blog fetch for ID:', blogId);
        
        await connectDB();
        console.log('Database connected successfully');

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            console.log('Invalid blog ID format:', blogId);
            return NextResponse.json(
                { success: false, error: 'Invalid blog ID format' },
                { status: 400 }
            );
        }

        const blog = await Blog.findById(blogId).lean();
        console.log('Database query complete');

        if (!blog) {
            console.log('No blog found with ID:', blogId);
            return NextResponse.json(
                { success: false, error: 'Blog not found' },
                { status: 404 }
            );
        }

        const serializedBlog = {
            id: blog._id.toString(),
            title: blog.title,
            content: blog.content,
            author: blog.author.toString(),
            createdAt: new Date(blog.createdAt).toISOString(),
            updatedAt: new Date(blog.updatedAt).toISOString()
        };

        return NextResponse.json({ 
            success: true, 
            blog: serializedBlog 
        });

    } catch (error) {
        console.error('Error in GET /api/blogs/[blogId]:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch blog',
                message: error.message 
            },
            { status: 500 }
        );
    }
}

// PUT: Update an existing blog
export async function PUT(request) {
    try {
        const blogId = getBlogIdFromPath(request);
        console.log('API PUT: Starting blog update for ID:', blogId);
        
        await connectDB();
        console.log('Database connected successfully');

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid blog ID format' },
                { status: 400 }
            );
        }

        const body = await request.json();
        console.log('Update request body received:', body);

        const { title, content, authorId } = body;

        if (!title || !content || !authorId) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return NextResponse.json(
                { success: false, error: 'Blog not found' },
                { status: 404 }
            );
        }

        if (blog.author.toString() !== authorId) {
            return NextResponse.json(
                { success: false, error: 'Not authorized to update this blog' },
                { status: 403 }
            );
        }

        blog.title = title;
        blog.content = content;
        await blog.save();

        const serializedBlog = {
            id: blog._id.toString(),
            title: blog.title,
            content: blog.content,
            author: blog.author.toString(),
            createdAt: blog.createdAt.toISOString(),
            updatedAt: blog.updatedAt.toISOString()
        };

        console.log('Blog updated successfully');
        return NextResponse.json({
            success: true,
            message: 'Blog updated successfully',
            blog: serializedBlog
        });

    } catch (error) {
        console.error('Error in PUT /api/blogs/[blogId]:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to update blog',
                message: error.message 
            },
            { status: 500 }
        );
    }
}

// DELETE: Remove a blog
export async function DELETE(request) {
    try {
        const blogId = getBlogIdFromPath(request);
        console.log('API DELETE: Starting blog deletion for ID:', blogId);
        
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid blog ID format' },
                { status: 400 }
            );
        }

        const authorId = request.headers.get('authorId');
        if (!authorId) {
            return NextResponse.json(
                { success: false, error: 'Author ID is required' },
                { status: 400 }
            );
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return NextResponse.json(
                { success: false, error: 'Blog not found' },
                { status: 404 }
            );
        }

        if (blog.author.toString() !== authorId) {
            return NextResponse.json(
                { success: false, error: 'Not authorized to delete this blog' },
                { status: 403 }
            );
        }

        await Blog.findByIdAndDelete(blogId);
        
        return NextResponse.json({
            success: true,
            message: 'Blog deleted successfully',
            blogId: blogId
        });

    } catch (error) {
        console.error('Error in DELETE /api/blogs/[blogId]:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to delete blog',
                message: error.message 
            },
            { status: 500 }
        );
    }
}