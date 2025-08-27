import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/lib/postService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { userId } = body;
    
    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and user ID are required' },
        { status: 400 }
      );
    }

    await PostService.toggleBookmark(postId, userId);

    return NextResponse.json({ message: 'Post bookmarked/unbookmarked successfully' });
  } catch (error) {
    console.error('Bookmark post error:', error);
    
    if (error instanceof Error && error.message === 'Post not found') {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to bookmark/unbookmark post' },
      { status: 500 }
    );
  }
} 