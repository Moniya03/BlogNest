import clientPromise from './mongodb';

export interface CommentDocument {
  _id?: string | import('mongodb').ObjectId; // MongoDB ObjectId
  postId: string;
  authorId: string;
  author: string;
  authorImage?: string;
  content: string;
  parentId?: string; // For nested replies
  replies: string[]; // Array of reply comment IDs
  likes: string[]; // Array of user IDs who liked the comment
  createdAt: Date;
  updatedAt: Date;
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

export class CommentService {
  private static async getCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('blognest');
      return db.collection<CommentDocument>('comments');
    } catch (error) {
      console.error('❌ MongoDB connection error in commentService:', error);
      throw new Error('Database connection failed');
    }
  }

  static async createComment(commentData: Omit<CommentDocument, '_id' | 'createdAt' | 'updatedAt' | 'replies' | 'likes'>): Promise<Comment> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const commentDoc: CommentDocument = {
      ...commentData,
      replies: [],
      likes: [],
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(commentDoc);
    
    return this.mapToComment({ ...commentDoc, _id: result.insertedId });
  }

  static async updateComment(id: string, updates: Partial<Pick<CommentDocument, 'content'>>): Promise<Comment> {
    const collection = await this.getCollection();
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = id;
    
    try {
      if (ObjectId.isValid(id)) {
        queryId = new ObjectId(id);
      }
    } catch {
      console.log('Using string ID for query');
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: queryId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      throw new Error('Comment not found');
    }

    return this.mapToComment(result.value);
  }

  static async deleteComment(id: string): Promise<void> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = id;
    
    try {
      if (ObjectId.isValid(id)) {
        queryId = new ObjectId(id);
      }
    } catch {
      console.log('Using string ID for query');
    }
    
    // Check if comment has replies
    const comment = await collection.findOne({ _id: queryId });
    if (comment && comment.replies.length > 0) {
      // Soft delete by marking as deleted
      await collection.updateOne(
        { _id: queryId },
        { 
          $set: { 
            content: '[Comment deleted]',
            updatedAt: new Date()
          } 
        }
      );
    } else {
      // Hard delete if no replies
      await collection.deleteOne({ _id: queryId });
    }
  }

  static async getCommentsByPostId(postId: string, userId?: string): Promise<Comment[]> {
    const collection = await this.getCollection();
    
    // Get all comments for the post
    const comments = await collection
      .find({ postId, parentId: { $type: "null" } }) // Only top-level comments
      .sort({ createdAt: -1 })
      .toArray();

    console.log('🔍 Raw comments from DB:', comments.map(c => ({ _id: c._id, postId: c.postId, author: c.author })));

    // Map comments and get replies
    const mappedComments = await Promise.all(
      comments.map(async (comment) => {
        try {
          if (!comment._id) {
            console.error('❌ Comment missing _id:', comment);
            return null;
          }
          
          const replies = await this.getReplies(comment._id.toString(), userId);
          const mappedComment = this.mapToComment(comment, userId);
          
          return {
            ...mappedComment,
            replies
          };
        } catch (error) {
          console.error('❌ Error mapping comment:', error, comment);
          return null;
        }
      })
    );

    const validComments = mappedComments.filter(Boolean) as Comment[];
    console.log('✅ Mapped comments:', validComments.map(c => ({ id: c.id, author: c.author })));
    
    return validComments;
  }

  static async getReplies(parentId: string, userId?: string): Promise<Comment[]> {
    const collection = await this.getCollection();
    
    const replies = await collection
      .find({ parentId })
      .sort({ createdAt: 1 })
      .toArray();

    const mappedReplies = replies.map(comment => {
      try {
        return this.mapToComment(comment, userId);
      } catch (error) {
        console.error('❌ Error mapping reply:', error, comment);
        return null;
      }
    }).filter(Boolean) as Comment[];

    return mappedReplies;
  }

  static async likeComment(commentId: string, userId: string): Promise<void> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = commentId;
    
    try {
      if (ObjectId.isValid(commentId)) {
        queryId = new ObjectId(commentId);
      }
    } catch {
      console.log('Using string ID for query');
    }
    
    const comment = await collection.findOne({ _id: queryId });
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.likes.includes(userId)) {
      // Unlike
      await collection.updateOne(
        { _id: queryId },
        { $pull: { likes: userId } }
      );
    } else {
      // Like
      await collection.updateOne(
        { _id: queryId },
        { $push: { likes: userId } }
      );
    }
  }

  static async addReply(parentId: string, replyData: Omit<CommentDocument, '_id' | 'createdAt' | 'updatedAt' | 'replies' | 'likes' | 'parentId'>): Promise<Comment> {
    const collection = await this.getCollection();
    
    const now = new Date();
    const replyDoc: CommentDocument = {
      ...replyData,
      parentId,
      replies: [],
      likes: [],
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(replyDoc);
    
    // Add reply ID to parent comment
    await collection.updateOne(
      { _id: parentId },
      { $push: { replies: result.insertedId.toString() } }
    );

    return this.mapToComment({ ...replyDoc, _id: result.insertedId });
  }

  static async getCommentById(commentId: string): Promise<CommentDocument | null> {
    const collection = await this.getCollection();
    
    // Handle both string and ObjectId IDs
    const { ObjectId } = await import('mongodb');
    let queryId: string | InstanceType<typeof ObjectId> = commentId;
    
    try {
      if (ObjectId.isValid(commentId)) {
        queryId = new ObjectId(commentId);
      }
    } catch {
      console.log('Using string ID for query');
    }
    
    return await collection.findOne({ _id: queryId });
  }

  static async getCommentCount(postId: string): Promise<number> {
    const collection = await this.getCollection();
    
    return await collection.countDocuments({ postId });
  }

  private static mapToComment(doc: CommentDocument, userId?: string): Comment {
    // Ensure _id is always defined and convert to string
    if (!doc._id) {
      console.error('❌ Comment document missing _id:', doc);
      throw new Error('Comment document missing _id field');
    }
    
    const id = doc._id.toString();
    
    return {
      id,
      postId: doc.postId,
      authorId: doc.authorId,
      author: doc.author,
      authorImage: doc.authorImage,
      content: doc.content,
      parentId: doc.parentId,
      replies: [],
      likes: doc.likes,
      likeCount: doc.likes.length,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      isLiked: userId ? doc.likes.includes(userId) : false
    };
  }
} 