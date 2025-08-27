'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Header } from './Header';
import { HomePage } from './HomePage';
import { AuthPage } from './AuthPage';
import { CreatePostPage } from './CreatePostPage';
import { DashboardPage } from './DashboardPage';
import { ProfilePage } from './ProfilePage';
import { Post } from '@/types';
import { useDarkMode } from './Providers';

export type Page = 'home' | 'login' | 'register' | 'create' | 'dashboard' | 'profile';

export function App() {
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load posts from API on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts', {
          credentials: 'include', // Include cookies for authentication
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
          setFilteredPosts(data.posts || []);
        } else {
          console.error('Failed to fetch posts');
          // Fallback to default posts if API fails
          setPosts([]);
          setFilteredPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
        setFilteredPosts([]);
      }
    };

    fetchPosts();
  }, []);

  // Load user's own posts for dashboard
  const fetchUserPosts = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/posts?authorId=${session.user.id}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setFilteredPosts(data.posts || []);
      } else {
        console.error('Failed to fetch user posts');
        setPosts([]);
        setFilteredPosts([]);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setPosts([]);
      setFilteredPosts([]);
    }
  }, [session?.user?.id]);

  // Load user's posts when dashboard is accessed
  useEffect(() => {
    if (currentPage === 'dashboard' && session?.user?.id) {
      fetchUserPosts();
    }
  }, [currentPage, session?.user?.id, fetchUserPosts]);

  // Filter posts based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(posts);
    }
  }, [searchQuery, posts]);



  // Handle authentication state changes
  useEffect(() => {
    if (status === 'loading') return;
    
    if (session) {
      // User is authenticated, redirect to home if on auth pages
      if (currentPage === 'login' || currentPage === 'register') {
        setCurrentPage('home');
      }
    } else {
      // User is not authenticated, redirect to login if on protected pages
      if (currentPage === 'create' || currentPage === 'dashboard' || currentPage === 'profile') {
        setCurrentPage('login');
      }
    }
  }, [session, status, currentPage]);



  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    // Clear editing state when changing pages
    if (page !== 'create') {
      setEditingPost(null);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    setCurrentPage('home');
  };

  const handleSearch = (query: string) => {
    // Navigate to home page and trigger search
    setCurrentPage('home');
    setIsSearching(true);
    setSearchQuery(query);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  };

  const handleCreatePost = async (newPost: Omit<Post, 'id' | 'createdAt' | 'views' | 'stars' | 'status'>) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const createdPost = await response.json();
        setPosts([createdPost, ...posts]);
        setCurrentPage('dashboard');
      } else {
        console.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async (updatedPost: Post) => {
    try {
      console.log('🔍 Updating post with data:', updatedPost);
      
      const response = await fetch(`/api/posts/${updatedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedPost),
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        const updatedPostData = await response.json();
        console.log('✅ Post updated successfully:', updatedPostData);
        
        setPosts(posts.map(post => post.id === updatedPost.id ? updatedPostData : post));
        setCurrentPage('dashboard');
        setEditingPost(null);
      } else {
        console.error('Failed to update post');
      }
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setCurrentPage('create');
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage posts={filteredPosts} searchQuery={searchQuery} isSearching={isSearching} />;
      case 'login':
      case 'register':
        return <AuthPage currentPage={currentPage} onPageChange={handlePageChange} />;
      case 'create':
        if (!session) {
          setCurrentPage('login');
          return null;
        }
        return <CreatePostPage 
          onPageChange={handlePageChange} 
          onCreatePost={handleCreatePost}
          onUpdatePost={handleUpdatePost}
          editPost={editingPost}
          currentUser={{
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
            bio: session.user.bio,
            username: session.user.username,
            location: session.user.location,
            profileImage: session.user.profileImage,
            role: (session.user.role as 'user' | 'moderator' | 'admin') || 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }}
        />;
      case 'dashboard':
        if (!session) {
          setCurrentPage('login');
          return null;
        }
        return <DashboardPage 
          onPageChange={handlePageChange} 
          posts={posts}
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
        />;
      case 'profile':
        if (!session) {
          setCurrentPage('login');
          return null;
        }
        return <ProfilePage onPageChange={handlePageChange} user={{
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          bio: session.user.bio,
          username: session.user.username,
          location: session.user.location,
          profileImage: session.user.profileImage,
          role: (session.user.role as 'user' | 'moderator' | 'admin') || 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }} />;
      default:
        return <HomePage posts={posts} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
      <Header
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleDarkMode}
        user={session?.user ? {
          id: session.user.id,
          name: session.user.name || '',
          email: session.user.email || '',
          bio: session.user.bio,
          username: session.user.username,
          location: session.user.location,
          profileImage: session.user.profileImage,
          role: (session.user.role as 'user' | 'moderator' | 'admin') || 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : null}
        onLogout={handleLogout}
        onSearch={handleSearch}
      />
      <main className="pt-16">
        {renderPage()}
      </main>
    </div>
  );
} 