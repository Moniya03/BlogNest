import { NextResponse } from 'next/server';
import { PostService } from '@/lib/postService';

export async function GET() {
  try {
    const categories = await PostService.getCategories();
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 