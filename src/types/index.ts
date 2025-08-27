export interface User {
  id: string;
  name: string;
  email: string;
  bio?: string;
  username?: string;
  location?: string;
  profileImage?: string;
  role?: 'user' | 'moderator' | 'admin';
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  category: string;
  title: string;
  description: string;
  author: string;
  date: string;
  categoryColor: string;
  content?: string;
  featuredImage?: string;
}

export interface Post extends BlogPost {
  id: string;
  content: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt?: string;
  views: number;
  stars: number;
  status: 'published' | 'draft' | 'archived';
  tags: string[];
  readTime: number;
  seoTitle?: string;
  seoDescription?: string;
  authorId: string;
  likes: string[];
  bookmarks: string[];
  commentCount?: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: string;
  authorImage?: string;
  content: string;
  parentId?: string;
  replies: Comment[];
  likes: string[];
  likeCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
}

export interface Category {
  name: string;
  count: number;
  color: string;
}

export interface Tag {
  name: string;
  count: number;
}

export interface PostFilters {
  category?: string;
  tags?: string[];
  status?: 'published' | 'draft' | 'archived';
  authorId?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'views' | 'stars' | 'readTime';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} 