import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PostService } from '@/lib/postService';
import { authOptions } from '@/lib/auth';

// Type for NextAuth.js v4 session
type SessionWithUser = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    username?: string;
    profileImage?: string;
    bio?: string;
    location?: string;
    isVerified?: boolean;
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    const status = searchParams.get('status') as 'published' | 'draft' | 'archived' | undefined;
    const authorId = searchParams.get('authorId') || undefined;
    const search = searchParams.get('search') || undefined;
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'views' | 'stars' | 'readTime' | undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const filters = {
      category,
      tags,
      status,
      authorId,
      search,
      sortBy,
      sortOrder
    };

    const pagination = { page, limit };

    console.log('🔍 Fetching posts with filters:', filters, 'pagination:', pagination);

    const result = await PostService.getPosts(filters, pagination);

    console.log('✅ Posts fetched successfully:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Get posts error:', error);
    
    // Return more detailed error information
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch posts', 
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, content, category, tags, featuredImage, status, seoTitle, seoDescription } = body;

    // Validate required fields
    if (!title || !description || !content || !category) {
      return NextResponse.json(
        { error: 'Title, description, content, and category are required' },
        { status: 400 }
      );
    }

    const postData = {
      title,
      description,
      content,
      category,
      tags: tags || [],
      featuredImage,
      status: status || 'draft',
      authorId: session.user.id,
      author: session.user.name || 'Unknown Author',
      seoTitle,
      seoDescription
    };

    const post = await PostService.createPost(postData);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 