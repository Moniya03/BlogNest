'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post } from '@/types';
import { CommentSection } from '@/components/ui/CommentSection';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.id}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data);
        
        // Increment view count when post is actually viewed
        try {
          await fetch(`/api/posts/${params.id}/view`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (viewError) {
          console.error('Failed to increment view count:', viewError);
          // Don't fail the page load if view counting fails
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h1>
          <button 
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.push('/')}
          className="mb-6 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ← Back to Posts
        </button>

        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className={`${post.categoryColor} text-white p-6 text-center`}>
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <p className="mt-2 opacity-90">{post.category}</p>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <span>By {post.author}</span>
              <span>{post.date}</span>
              <span>{post.views} views</span>
              <span>{post.readTime} min read</span>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              {post.description}
            </p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
