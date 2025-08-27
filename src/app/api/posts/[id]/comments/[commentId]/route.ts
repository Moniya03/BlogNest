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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: postId, commentId } = await params;
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content } = body;
    
    if (!content || !postId || !commentId) {
      return NextResponse.json(
        { error: 'Content, post ID, and comment ID are required' },
        { status: 400 }
      );
    }

    // Get the comment to check ownership
    const comment = await CommentService.getCommentById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user owns the comment or is admin
    if (comment.authorId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      );
    }

    const updatedComment = await CommentService.updateComment(commentId, { content });
    
    return NextResponse.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const { id: postId, commentId } = await params;
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!postId || !commentId) {
      return NextResponse.json(
        { error: 'Post ID and comment ID are required' },
        { status: 400 }
      );
    }

    // Get the comment to check ownership
    const comment = await CommentService.getCommentById(commentId);
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user owns the comment or is admin
    if (comment.authorId !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    await CommentService.deleteComment(commentId);
    
    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
