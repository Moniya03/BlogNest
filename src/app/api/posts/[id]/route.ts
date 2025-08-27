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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const post = await PostService.getPostById(id);
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    
    console.log('🔍 Update post request body:', body);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the post or is admin
    const existingPost = await PostService.getPostById(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Debug logging
    console.log('🔍 Update authorization check:', {
      postAuthorId: existingPost.authorId,
      sessionUserId: session.user.id,
      sessionUserRole: session.user.role,
      authorIdType: typeof existingPost.authorId,
      sessionIdType: typeof session.user.id,
      isMatch: existingPost.authorId === session.user.id,
      postAuthorIdTrimmed: existingPost.authorId?.trim(),
      sessionUserIdTrimmed: session.user.id?.trim()
    });

    // Check if user owns the post or is admin
    const isOwner = existingPost.authorId === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only edit your own posts' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      content,
      category,
      categoryColor,
      tags,
      featuredImage,
      status,
      seoTitle,
      seoDescription
    } = body;

    if (!title || !description || !content || !category) {
      return NextResponse.json(
        { error: 'Title, description, content, and category are required' },
        { status: 400 }
      );
    }

    const updates = {
      title,
      description,
      content,
      category,
      categoryColor,
      tags: tags || [],
      featuredImage,
      status,
      seoTitle,
      seoDescription
    };

    console.log('🔍 Updates being applied:', updates);

    const post = await PostService.updatePost(id, updates);

    return NextResponse.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    
    if (error instanceof Error && error.message === 'Post not found') {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the post or is admin
    const existingPost = await PostService.getPostById(id);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Debug logging
    console.log('🔍 Delete authorization check:', {
      postAuthorId: existingPost.authorId,
      sessionUserId: session.user.id,
      sessionUserRole: session.user.role,
      authorIdType: typeof existingPost.authorId,
      sessionIdType: typeof session.user.id,
      isMatch: existingPost.authorId === session.user.id,
      postAuthorIdTrimmed: existingPost.authorId?.trim(),
      sessionUserIdTrimmed: session.user.id?.trim()
    });

    // Check if user owns the post or is admin
    const isOwner = existingPost.authorId === session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own posts' },
        { status: 403 }
      );
    }

    await PostService.deletePost(id);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error instanceof Error && error.message === 'Post not found') {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
      );
    }
  } 