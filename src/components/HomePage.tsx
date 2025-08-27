'use client';

import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Post } from '@/types';

interface HomePageProps {
  posts: Post[];
  searchQuery?: string;
  isSearching?: boolean;
}

export function HomePage({ posts, searchQuery, isSearching }: HomePageProps) {
  const router = useRouter();

  const handlePostClick = (postId: string) => {
    router.push(`/posts/${postId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to{' '}
            <span className="text-blue-600 dark:text-blue-400">BlogNest</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A place for developers, designers, and creators to share their stories and ideas.
          </p>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-7xl mx-auto">
                        {searchQuery ? (
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Search Results
                  </h2>
                  {isSearching ? (
                    <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      Found {posts.length} post{posts.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Latest Posts
            </h2>
          )}
          
          {posts.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                    No posts found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    Try searching with different keywords
                  </p>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  No posts yet. Be the first to share your story!
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {posts.map((post) => (
                <Card 
                  key={post.id} 
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardHeader className="p-0">
                    {post.featuredImage ? (
                      <div className="relative">
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className={`absolute top-0 left-0 right-0 ${post.categoryColor} text-white p-3 rounded-t-lg`}>
                          <h3 className="text-lg font-bold text-center">{post.category}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className={`${post.categoryColor} text-white p-6 rounded-t-lg`}>
                        <h3 className="text-2xl font-bold text-center">{post.category}</h3>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {post.description}
                    </p>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span>{post.author} • {post.date}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            © 2025 BlogNest. All Rights Reserved.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Built with Next.js, Tailwind CSS, and lots of ☕.
          </p>
        </div>
      </footer>
    </div>
  );
} 