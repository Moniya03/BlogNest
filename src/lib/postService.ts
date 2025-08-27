import clientPromise from './mongodb';
import { Post } from '@/types';

export interface PostDocument {
  _id?: string | import('mongodb').ObjectId;
  title: string;
  description: string;
  content: string;
  author: string;
  authorId: string;
  category: string;
  categoryColor?: string;
  tags: string[];
  featuredImage?: string;
  status: 'published' | 'draft' | 'archived';
  views: number;
  stars: number;
  likes: string[];
  bookmarks: string[];
  readTime: number;
  seoTitle?: string;
  seoDescription?: string;
  viewedBy?: Record<string, Date>;
  createdAt: Date;
  updatedAt: Date;
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

export class PostService {
  private static async getCollection() {
    try {
      const client = await clientPromise;
      
      if (!client || typeof client.db !== 'function') {
        throw new Error('Invalid MongoDB client instance');
      }
      
      const db = client.db('blognest');
      const collection = db.collection<PostDocument>('posts');
      
      return collection;
    } catch (error) {
      console.error('❌ MongoDB connection error in postService:', error);
      throw new Error('Database connection failed');
    }
  }

  private static calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  private static getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'Technology': 'bg-blue-600',
      'Artificial Intelligence': 'bg-purple-600',
      'AI': 'bg-purple-600',
      'Machine Learning': 'bg-indigo-600',
      'Data Science': 'bg-teal-600',
      'Programming': 'bg-blue-600',
      'Web Development': 'bg-green-600',
      'Mobile Development': 'bg-orange-600',
      'Travel': 'bg-green-600',
      'Lifestyle': 'bg-purple-600',
      'Food': 'bg-orange-600',
      'Health': 'bg-red-600',
      'Business': 'bg-indigo-600',
      'Education': 'bg-teal-600',
      'Entertainment': 'bg-pink-600',
      'Science': 'bg-cyan-600',
      'Research': 'bg-violet-600'
    };
    return colors[category] || 'bg-gray-600';
  }

  private static mapToPost(doc: PostDocument): Post {
    return {
      id: doc._id?.toString() || '',
      title: doc.title,
      description: doc.description,
      content: doc.content,
      author: doc.author,
      authorId: doc.authorId,
      category: doc.category,
      categoryColor: doc.categoryColor || PostService.getCategoryColor(doc.category),
      date: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'Unknown',
      featuredImage: doc.featuredImage,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString().split('T')[0] : '',
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString().split('T')[0] : '',
      views: doc.views || 0,
      stars: doc.stars || 0,
      status: doc.status || 'draft',
      tags: doc.tags || [],
      readTime: doc.readTime || 1,
      seoTitle: doc.seoTitle,
      seoDescription: doc.seoDescription,
      likes: doc.likes || [],
      bookmarks: doc.bookmarks || []
    };
  }

  static async createPost(postData: Omit<PostDocument, '_id' | 'createdAt' | 'updatedAt' | 'views' | 'stars' | 'likes' | 'bookmarks' | 'readTime'>): Promise<Post> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const postDoc: PostDocument = {
      ...postData,
      views: 0,
      stars: 0,
      likes: [],
      bookmarks: [],
      readTime: this.calculateReadTime(postData.content),
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(postDoc);
    
    return this.mapToPost({ ...postDoc, _id: result.insertedId });
  }

  static async updatePost(id: string, updates: Partial<Omit<PostDocument, '_id' | 'createdAt' | 'authorId'>>): Promise<Post> {
    const collection = await this.getCollection();
    
    const updateData = {
      ...updates,
      updatedAt: new Date(),
      readTime: updates.content ? this.calculateReadTime(updates.content) : undefined
    };

    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = id;
    
        try {
      // Try to convert to ObjectId if it's a valid ObjectId string
      if (ObjectId.isValid(id)) {
        queryId = new ObjectId(id);
      }
    } catch {
      // If conversion fails, use the string as is
      console.log('Using string ID for query');
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: queryId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      throw new Error('Post not found');
    }

    return this.mapToPost(result.value);
  }

  static async deletePost(id: string): Promise<void> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = id;
    
    try {
      // Try to convert to ObjectId if it's a valid ObjectId string
      if (ObjectId.isValid(id)) {
        queryId = new ObjectId(id);
      }
    } catch {
      // If conversion fails, use the string as is
      console.log('Using string ID for query');
    }
    
    const result = await collection.deleteOne({ _id: queryId });
    if (result.deletedCount === 0) {
      throw new Error('Post not found');
    }
  }

  static async getPostById(id: string): Promise<Post | null> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = id;
    
    try {
      // Try to convert to ObjectId if it's a valid ObjectId string
      if (ObjectId.isValid(id)) {
        queryId = new ObjectId(id);
      }
    } catch {
      // If conversion fails, use the string as is
      console.log('Using string ID for query');
    }
    
    const post = await collection.findOne({ _id: queryId });
    if (!post) {
      return null;
    }

    return this.mapToPost(post);
  }

  static async incrementViewCount(id: string, userId?: string): Promise<void> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = id;
    
    try {
      // Try to convert to ObjectId if it's a valid ObjectId string
      if (ObjectId.isValid(id)) {
        queryId = new ObjectId(id);
      }
    } catch {
      // If conversion fails, use the string as is
      console.log('Using string ID for query');
    }

    // If user is logged in, check if they've already viewed this post
    if (userId) {
      const viewKey = `viewedBy.${userId}`;
      const hasViewed = await collection.findOne({
        _id: queryId,
        [viewKey]: { $exists: true }
      });

      if (hasViewed) {
        // User has already viewed this post, don't increment
        return;
      }

      // Mark that this user has viewed the post and increment view count
      await collection.updateOne(
        { _id: queryId },
        { 
          $inc: { views: 1 },
          $set: { [viewKey]: new Date() }
        }
      );
    } else {
      // For anonymous users, just increment (less accurate but still functional)
      await collection.updateOne(
        { _id: queryId },
        { $inc: { views: 1 } }
      );
    }
  }

  static async getPosts(filters: Record<string, unknown> = {}, pagination: { page: number; limit: number } = { page: 1, limit: 10 }): Promise<{ posts: Post[]; total: number; page: number; totalPages: number; hasNext: boolean; hasPrev: boolean }> {
    const collection = await this.getCollection();
    
    // Build filter query
    const query: Record<string, unknown> = {};
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.authorId) {
      query.authorId = filters.authorId;
    }
    
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Build sort query
    const sort: Record<string, 1 | -1> = {};
    const sortBy = (filters.sortBy as string) || 'createdAt';
    const sortOrder = (filters.sortOrder as string) || 'desc';
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count
    const total = await collection.countDocuments(query);
    
    // Calculate pagination
    const skip = (pagination.page - 1) * pagination.limit;
    const totalPages = Math.ceil(total / pagination.limit);
    
    // Get posts
    const posts = await collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(pagination.limit)
      .toArray();

    return {
      posts: posts.map(this.mapToPost),
      total,
      page: pagination.page,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1
    };
  }

  static async getCategories(): Promise<{ category: string; count: number }[]> {
    const collection = await this.getCollection();
    
    const result = await collection.aggregate<{ category: string; count: number }>([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    return result;
  }

  static async getTags(): Promise<{ tag: string; count: number }[]> {
    const collection = await this.getCollection();
    
    const result = await collection.aggregate<{ tag: string; count: number }>([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    return result;
  }

  static async getPopularPosts(limit: number = 5): Promise<Post[]> {
    const collection = await this.getCollection();
    
    const posts = await collection
      .find({ status: 'published' })
      .sort({ views: -1, stars: -1 })
      .limit(limit)
      .toArray();

    return posts.map(this.mapToPost);
  }

  static async toggleLike(postId: string, userId: string): Promise<void> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = postId;
    
    try {
      if (ObjectId.isValid(postId)) {
        queryId = new ObjectId(postId);
      }
    } catch {
      console.log('Using string ID for query');
    }
    
    const post = await collection.findOne({ _id: queryId });
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.likes.includes(userId)) {
      // Unlike
      await collection.updateOne(
        { _id: queryId },
        { 
          $pull: { likes: userId },
          $inc: { stars: -1 }
        }
      );
    } else {
      // Like
      await collection.updateOne(
        { _id: queryId },
        { 
          $push: { likes: userId },
          $inc: { stars: 1 }
        }
      );
    }
  }

  static async toggleBookmark(postId: string, userId: string): Promise<void> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = postId;
    
    try {
      if (ObjectId.isValid(postId)) {
        queryId = new ObjectId(postId);
      }
    } catch {
      console.log('Using string ID for query');
    }
    
    const post = await collection.findOne({ _id: queryId });
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.bookmarks.includes(userId)) {
      // Remove bookmark
      await collection.updateOne(
        { _id: queryId },
        { $pull: { bookmarks: userId } }
      );
    } else {
      // Add bookmark
      await collection.updateOne(
        { _id: queryId },
        { $push: { bookmarks: userId } }
      );
    }
  }

  static async getRelatedPosts(postId: string, limit: number = 3): Promise<Post[]> {
    const collection = await this.getCollection();
    
    const currentPost = await collection.findOne({ _id: postId });
    if (!currentPost) {
      return [];
    }

    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = postId;
    
    try {
      if (ObjectId.isValid(postId)) {
        queryId = new ObjectId(postId);
      }
    } catch {
      console.log('Using string ID for query');
    }
    
    const posts = await collection
      .find({
        _id: { $ne: queryId },
        status: 'published',
        $or: [
          { category: currentPost.category },
          { tags: { $in: currentPost.tags } }
        ]
      })
      .sort({ views: -1, createdAt: -1 })
      .limit(limit)
      .toArray();

    return posts.map(this.mapToPost);
  }
} 