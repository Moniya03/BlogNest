import bcrypt from 'bcryptjs';

interface UserDocument {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _id?: any;
  name: string;
  email: string;
  password: string;
  bio?: string;
  username?: string;
  location?: string;
  profileImage?: string;
  role: 'user' | 'moderator' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export class UserService {
  private static async getCollection() {
    try {
      const client = await clientPromise;
      const db = client.db('blognest');
      return db.collection<UserDocument>('users');
    } catch (error) {
      console.error('❌ MongoDB connection error in userService:', error);
      throw new Error('Database connection failed');
    }
  }

  static async createUser(userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt' | 'isVerified' | 'role'>): Promise<User> {
    const collection = await this.getCollection();
    
    // Check if user already exists
    const existingUser = await collection.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const now = new Date();
    const userDoc: Omit<UserDocument, '_id'> = {
      ...userData,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      createdAt: now,
      updatedAt: now
    };

    const result = await collection.insertOne(userDoc);
    
    // Return user without password
    const { password: _unusedPassword, ...userWithoutPassword } = userDoc;
    return {
      id: result.insertedId.toString(),
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      bio: userWithoutPassword.bio,
      username: userWithoutPassword.username,
      location: userWithoutPassword.location,
      profileImage: userWithoutPassword.profileImage,
      role: 'user',
      isVerified: false,
      createdAt: userWithoutPassword.createdAt.toISOString(),
      updatedAt: userWithoutPassword.updatedAt.toISOString()
    } as User;
  }

  static async authenticateUser(email: string, password: string): Promise<User> {
    const collection = await this.getCollection();
    
    const user = await collection.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Return user without password
    const { password: _unusedPassword, ...userWithoutPassword } = user;
    return {
      id: user._id?.toString() || '',
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      bio: userWithoutPassword.bio,
      username: userWithoutPassword.username,
      location: userWithoutPassword.location,
      profileImage: userWithoutPassword.profileImage,
      role: 'user',
      isVerified: false,
      createdAt: userWithoutPassword.createdAt.toISOString(),
      updatedAt: userWithoutPassword.updatedAt.toISOString()
    } as User;
  }

  static async getUserById(id: string): Promise<User | null> {
    const collection = await this.getCollection();
    
    // Convert string ID to ObjectId
    const { ObjectId } = await import('mongodb');
    const objectId = new ObjectId(id);
    
    const user = await collection.findOne({ _id: objectId });
    if (!user) {
      return null;
    }

    // Return user without password
    const { password: _unusedPassword, ...userWithoutPassword } = user;
    return {
      id: user._id?.toString() || '',
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      bio: userWithoutPassword.bio,
      username: userWithoutPassword.username,
      location: userWithoutPassword.location,
      profileImage: userWithoutPassword.profileImage,
      role: 'user',
      isVerified: false,
      createdAt: userWithoutPassword.createdAt.toISOString(),
      updatedAt: userWithoutPassword.updatedAt.toISOString()
    } as User;
  }

  static async updateUser(id: string, updates: Partial<Omit<UserDocument, '_id' | 'password' | 'createdAt'>>): Promise<User> {
    const collection = await this.getCollection();
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Convert string ID to ObjectId
    const { ObjectId } = await import('mongodb');
    const objectId = new ObjectId(id);
    
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password: _unusedPassword, ...userWithoutPassword } = result.value;
    return {
      id: result.value._id?.toString() || '',
      name: userWithoutPassword.name,
      email: userWithoutPassword.email,
      bio: userWithoutPassword.bio,
      username: userWithoutPassword.username,
      location: userWithoutPassword.location,
      profileImage: userWithoutPassword.profileImage,
      role: 'user',
      isVerified: false,
      createdAt: userWithoutPassword.createdAt.toISOString(),
      updatedAt: userWithoutPassword.updatedAt.toISOString()
    } as User;
  }

  static async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const collection = await this.getCollection();
    
    // Convert string ID to ObjectId
    const { ObjectId } = await import('mongodb');
    const objectId = new ObjectId(id);
    
    const user = await collection.findOne({ _id: objectId });
    if (!user) {
      throw new Error('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          password: hashedNewPassword,
          updatedAt: new Date()
        } 
      }
    );
  }
}

// Import clientPromise at the end to avoid circular dependency
import clientPromise from './mongodb'; 