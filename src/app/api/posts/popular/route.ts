import { NextRequest, NextResponse } from 'next/server';
import { PostService } from '@/lib/postService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    
    if (limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 20' },
        { status: 400 }
      );
    }

    const posts = await PostService.getPopularPosts(limit);
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Get popular posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular posts' },
      { status: 500 }
    );
  }
} 