import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { CommentService } from '@/lib/commentService';
import { authOptions } from '@/lib/auth';

// Define session type
interface SessionWithUser {
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
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const comments = await CommentService.getCommentsByPostId(postId, userId);
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, parentId } = body;
    
    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    const commentData = {
      postId,
      authorId: session.user.id,
      author: session.user.name || 'Anonymous',
      authorImage: session.user.profileImage,
      content,
      parentId
    };

    const comment = await CommentService.createComment(commentData);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 