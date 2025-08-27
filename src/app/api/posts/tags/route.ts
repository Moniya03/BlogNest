import { NextResponse } from 'next/server';
import { PostService } from '@/lib/postService';

export async function GET() {
  try {
    const tags = await PostService.getTags();
    
    return NextResponse.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
} 