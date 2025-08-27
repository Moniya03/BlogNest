'use client';

import { ArrowLeft, Edit, Trash2, Eye, Star, Calendar, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Page } from './App';
import { Post } from '@/types';

interface DashboardPageProps {
  onPageChange: (page: Page) => void;
  posts: Post[];
  onDeletePost: (postId: string) => void;
  onEditPost: (post: Post) => void;
}

export function DashboardPage({ onPageChange, posts, onDeletePost, onEditPost }: DashboardPageProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => onPageChange('home')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span>Dashboard</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your blog posts and track their performance
            </p>
          </div>
          <Button
            onClick={() => onPageChange('create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create New Post
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{posts.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(posts.reduce((sum, post) => sum + post.views, 0))}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(posts.reduce((sum, post) => sum + post.stars, 0))}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Stars</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {posts.filter(post => post.status === 'published').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Posts List */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Posts
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Manage and monitor your published content
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  No posts yet. Start creating your first post!
                </p>
                <Button
                  onClick={() => onPageChange('create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Your First Post
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          }`}>
                            {post.status}
                          </span>
                          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                            {post.category}
                          </span>
                        </div>
                        
                        <div className="flex items-start space-x-4">
                          {post.featuredImage && (
                            <div className="flex-shrink-0">
                              <img
                                src={post.featuredImage}
                                alt={post.title}
                                className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                              />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                              {post.title}
                            </h3>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {post.description}
                            </p>
                            
                            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Created: {formatDate(post.createdAt)}</span>
                              </div>
                              {post.updatedAt && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>Updated: {formatDate(post.updatedAt)}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-1">
                                <Eye className="h-4 w-4" />
                                <span>{formatNumber(post.views)} views</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4" />
                                <span>{formatNumber(post.stars)} stars</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditPost(post)}
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeletePost(post.id)}
                          className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 