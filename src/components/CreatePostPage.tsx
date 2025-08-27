'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { Page } from './App';
import { Post } from '@/types';
import { User } from '@/types';

interface CreatePostPageProps {
  onPageChange: (page: Page) => void;
  onCreatePost: (post: Omit<Post, 'id' | 'createdAt' | 'views' | 'stars' | 'status'>) => void;
  onUpdatePost?: (post: Post) => void;
  editPost?: Post | null;
  currentUser?: User | null;
}

export function CreatePostPage({ onPageChange, onCreatePost, onUpdatePost, editPost, currentUser }: CreatePostPageProps) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    content: '',
    featuredImage: '',
    tags: [] as string[],
    status: 'published' as 'draft' | 'published' | 'archived'
  });

  const [categoryColor, setCategoryColor] = useState('bg-blue-600');

  // Predefined category colors
  const categoryColors = [
    'bg-blue-600', 'bg-pink-600', 'bg-green-600', 'bg-orange-600',
    'bg-purple-600', 'bg-red-600', 'bg-yellow-600', 'bg-indigo-600'
  ];

  // Load edit data if editing
  useEffect(() => {
    if (editPost) {
      setFormData({
        title: editPost.title,
        category: editPost.category,
        description: editPost.description,
        content: editPost.content,
        featuredImage: editPost.featuredImage || '',
        tags: editPost.tags || [],
        status: editPost.status || 'published'
      });
      setCategoryColor(editPost.categoryColor);
    }
  }, [editPost]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData({
      ...formData,
      featuredImage: imageUrl
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editPost && onUpdatePost) {
      // Update existing post
      const updatedPost: Post = {
        ...editPost,
        ...formData,
        categoryColor,
        status: formData.status,
        updatedAt: new Date().toISOString().split('T')[0]
      };
      onUpdatePost(updatedPost);
    } else {
      // Create new post
      const newPost = {
        ...formData,
        categoryColor,
        author: currentUser?.name || 'Current User',
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        authorId: currentUser?.id || 'temp-user-id',
        tags: formData.tags || [],
        status: formData.status,
        readTime: Math.ceil(formData.content.split(' ').length / 200), // Estimate read time
        likes: [],
        bookmarks: []
      };
      onCreatePost(newPost);
    }
  };

  const isEditing = !!editPost;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>

        {/* Form */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Update Your Story' : 'Write Your Story'}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {isEditing 
                ? 'Make changes to your existing post to keep it fresh and engaging.'
                : 'Share your thoughts, experiences, and ideas with the BlogNest community.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Post Title *
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your post title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category *
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    type="text"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="e.g., Travel, Technology, Lifestyle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </Label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as 'draft' | 'published' | 'archived'})}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category Color
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categoryColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setCategoryColor(color)}
                      className={`w-8 h-8 rounded-full ${color} ${
                        categoryColor === color ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white' : ''
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Short Description *
                </Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="A brief summary of your post"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Post Content *
                </Label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={12}
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your post content here..."
                />
              </div>

              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImage={formData.featuredImage}
                label="Featured Image"
              />

              <div className="flex justify-end space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onPageChange('home')}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Post' : 'Publish Post'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 