import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/models/blog';
import mongoose from 'mongoose';

export async function GET(request) {
    try {
        const userId = request.url.split('/').pop();
        console.log('Fetching blogs for user:', userId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        await connectDB();

        const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 }).lean();

        const serializedBlogs = blogs.map(blog => ({
            id: blog._id.toString(),
            title: blog.title,
            content: blog.content,
            author: blog.author.toString(),
            createdAt: blog.createdAt.toISOString(),
            updatedAt: blog.updatedAt.toISOString()
        }));

        return NextResponse.json({
            success: true,
            blogs: serializedBlogs
        });

    } catch (error) {
        console.error('Error fetching user blogs:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch blogs',
                message: error.message 
            },
            { status: 500 }
        );
    }
}