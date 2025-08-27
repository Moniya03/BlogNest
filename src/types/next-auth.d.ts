import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
      username?: string;
      profileImage?: string;
      bio?: string;
      location?: string;
      isVerified?: boolean;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    username?: string;
    profileImage?: string;
          bio?: string;
      location?: string;
      isVerified?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    username?: string;
    profileImage?: string;
    bio?: string;
    location?: string;
    isVerified?: boolean;
  }
}
