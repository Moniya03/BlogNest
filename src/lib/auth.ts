import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './mongodb';
import { UserService } from './userService';

// Validate required environment variables
const requiredEnvVars = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  MONGODB_URI: process.env.MONGODB_URI,
};

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(' Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        try {
          const user = await UserService.authenticateUser(credentials.email, credentials.password);
          
          // Debug logging
          console.log('🔍 Auth user data:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          });
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            profileImage: user.profileImage,
            bio: user.bio,
            location: user.location,
            isVerified: user.isVerified
          };
        } catch (error) {
          console.error('Auth error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
          throw new Error(errorMessage);
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.profileImage = user.profileImage;
        token.bio = user.bio;
        token.location = user.location;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.profileImage = token.profileImage as string;
        session.user.bio = token.bio as string;
        session.user.location = token.location as string;
        session.user.isVerified = token.isVerified as boolean;
        
        // Debug logging
        console.log('🔍 Session callback:', {
          sessionUserId: session.user.id,
          tokenSub: token.sub,
          tokenRole: token.role
        });
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);
