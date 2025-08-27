# BlogNest CMS

A modern blog content management system built with Next.js 15, TypeScript, and Tailwind CSS.

## ✨ Features

- 🔐 **NextAuth.js Authentication** - Secure user registration, login, and session management
- ✍️ **Post Management** - Create, edit, delete, and categorize blog posts
- 🔍 **Smart Search** - Real-time search across posts, categories, and tags
- 🎨 **Category Colors** - Visual category system with custom color coding
- 👁️ **View Tracking** - Unique view counting per user with analytics
- 💬 **Comment System** - Full comment functionality with nested replies
- 🖼️ **Cloudinary Integration** - Professional image hosting and optimization
- 🌙 **Dark Mode** - Beautiful responsive design with theme toggle
- 📱 **Mobile First** - Optimized for all device sizes

## 🚀 Tech Stack

- **Frontend**: Next.js 15.5.0, React 18.3.1, TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **Database**: MongoDB 5.9.2 with native driver
- **Authentication**: NextAuth.js 4.24.11 with MongoDB adapter
- **Image Storage**: Cloudinary with automatic optimization
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Custom component library with Radix UI primitives

## 🛠️ Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation
```bash
git clone <repository-url>
cd blognest-cms
npm install
```

### Environment Variables
Create `.env.local`:
```bash
MONGODB_URI=mongodb://root:example@localhost:27017/blognest?authSource=admin
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── auth/          # NextAuth.js routes
│   │   ├── posts/         # Post CRUD operations
│   │   └── upload/        # Image upload to Cloudinary
│   ├── posts/[id]/        # Individual post pages
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── App.tsx            # Main application logic
│   ├── Header.tsx         # Navigation with search
│   ├── HomePage.tsx       # Posts display with search
│   ├── DashboardPage.tsx  # User's posts management
│   ├── CreatePostPage.tsx # Post creation/editing
│   └── ProfilePage.tsx    # User profile management
├── lib/                   # Core services
│   ├── auth.ts            # NextAuth.js configuration
│   ├── mongodb.ts         # Database connection
│   ├── postService.ts     # Post operations
│   ├── userService.ts     # User management
│   └── cloudinary.ts      # Image upload service
└── types/                 # TypeScript definitions
```


## 🎯 Key Features

### **Smart Search System**
- Real-time search across post titles, content, categories, and tags
- Beautiful search bar with focus animations
- Search results with loading states

### **Category Management**
- Custom category colors stored in database
- Visual category indicators on post cards
- Category-based filtering

### **View Analytics**
- Unique view tracking per user
- Prevents duplicate view inflation
- Real-time view count updates

### **User Dashboard**
- Personal post management
- Post statistics and analytics
- Quick edit and delete actions

### **Responsive Design**
- Mobile-first approach
- Dark/light theme toggle
- Optimized for all screen sizes

