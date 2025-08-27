import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { PostService } from '@/lib/postService';
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

export async function POST(
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

    // Check authentication (optional - anonymous users can also increment views)
    const session = await getServerSession(authOptions) as SessionWithUser | null;
    const userId = session?.user?.id;

    // Increment view count
    await PostService.incrementViewCount(id, userId);

    return NextResponse.json({ message: 'View count incremented' });
  } catch (error) {
    console.error('Increment view count error:', error);
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    );
  }
}
