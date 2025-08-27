'use client';

import { useState } from 'react';
import { BookOpen, Moon, Sun, Menu, X, User as UserIcon, Plus, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Page } from './App';
import { User } from '@/types';
import { UserDropdown } from './UserDropdown';

interface HeaderProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  user: User | null;
  onLogout: () => void;
  onSearch?: (query: string) => void;
}

export function Header({
  currentPage,
  onPageChange,
  isDarkMode,
  onToggleTheme,
  user,
  onLogout,
  onSearch
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handlePageChange = (page: Page) => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">BlogNest</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handlePageChange('home')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'home'
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Home
            </button>
            
            {user && (
              <button
                onClick={() => handlePageChange('create')}
                className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Create Post</span>
              </button>
            )}
          </nav>

          {/* Right side - Search, Theme toggle and Auth */}
          <div className="flex items-center space-x-4">
            {/* Cute Search Bar */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div className={`relative transition-all duration-300 ${
                  isSearchFocused 
                    ? 'scale-105 shadow-lg' 
                    : 'scale-100 shadow-md'
                }`}>
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
                    isSearchFocused 
                      ? 'text-blue-500' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`} />
                  <Input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={`pl-10 pr-4 py-2 w-64 border-2 transition-all duration-300 rounded-full ${
                      isSearchFocused
                        ? 'border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-500`}
                  />
                  {searchQuery && (
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                    >
                      <Sparkles className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTheme}
              className="p-2"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              )}
            </Button>

            {/* Auth Buttons */}
            {user ? (
              <UserDropdown
                user={user}
                onPageChange={onPageChange}
                onLogout={onLogout}
              />
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange('login')}
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => handlePageChange('register')}
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            {/* Mobile Search Bar */}
            <div className="px-4 mb-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-4 py-2 w-full border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
                {searchQuery && (
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200"
                  >
                    <Sparkles className="h-3 w-3" />
                  </button>
                )}
              </form>
            </div>
            
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => handlePageChange('home')}
                className={`text-left px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 'home'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Home
              </button>
              
              {user && (
                <>
                  <button
                    onClick={() => handlePageChange('dashboard')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={() => handlePageChange('create')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Post</span>
                  </button>
                  <button
                    onClick={() => handlePageChange('profile')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Profile Settings</span>
                  </button>
                </>
              )}

              {!user && (
                <>
                  <button
                    onClick={() => handlePageChange('login')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handlePageChange('register')}
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 