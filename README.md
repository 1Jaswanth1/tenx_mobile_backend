# 10xR Community Platform

> **Next-generation community platform blending Reddit and Facebook, powered by Supabase and AI-driven healthcare innovation**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3-green)](https://www.better-auth.com/)

---

## 🎯 About 10xR

**10xR** is revolutionizing community-driven healthcare technology by creating an intelligent platform that combines the best of Reddit's community engagement with Facebook's social connectivity. Our mission is to make healthcare technology more accessible, secure, and community-focused through:

- **Community-First Architecture**: Built as a full-featured web platform with future mobile API support
- **Supabase-Powered Backend**: Real-time database, authentication, and storage in one unified platform
- **AI-Driven Insights**: Intelligent content moderation, recommendations, and healthcare guidance
- **Privacy-Focused Design**: HIPAA-ready infrastructure with comprehensive security controls
- **Scalable Infrastructure**: Serverless architecture that grows with your community

### Core Mission

We believe healthcare technology should:
- 🔒 **Prioritize Privacy** - End-to-end encryption and HIPAA compliance
- ⚡ **Be Fast** - Sub-second response times with edge computing
- 🌐 **Be Community-Driven** - Reddit-style discussions with Facebook-like connections
- 🛡️ **Be Secure** - Enterprise-grade security with row-level security policies
- 📊 **Be Insightful** - AI-powered content discovery and personalized feeds

---

## 🏗 Architecture Overview

### Platform Design Philosophy

**10xR is a web-first platform, not a backend service.**

We're building a complete web application using Next.js 16, Supabase, and BetterAuth. This approach offers:

1. **Single Codebase**: One application handles both web UI and API endpoints
2. **Unified Authentication**: BetterAuth seamlessly integrates with Supabase for consistent sessions
3. **Real-Time Everything**: Supabase subscriptions provide instant updates across the platform
4. **Future-Proof**: Selected API routes will be exposed for mobile apps when needed

```
┌──────────────────────────────────────────────────────────────┐
│               10xR Community Platform                         │
│                    (Next.js 16)                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────┐         ┌─────────────────────┐     │
│  │   Web Frontend     │         │   API Routes        │     │
│  │  - Feed & Posts    │         │   - /api/posts      │     │
│  │  - Communities     │         │   - /api/comments   │     │
│  │  - User Profiles   │         │   - /api/users      │     │
│  │  - Real-time Chat  │         │   - /api/auth       │     │
│  └────────────────────┘         └─────────────────────┘     │
│                                                               │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │      Supabase         │
            │  ┌─────────────────┐  │
            │  │   PostgreSQL    │  │
            │  │   (Database)    │  │
            │  └─────────────────┘  │
            │  ┌─────────────────┐  │
            │  │   Auth System   │  │
            │  │  (BetterAuth)   │  │
            │  └─────────────────┘  │
            │  ┌─────────────────┐  │
            │  │    Storage      │  │
            │  │ (Files/Images)  │  │
            │  └─────────────────┘  │
            │  ┌─────────────────┐  │
            │  │   Realtime      │  │
            │  │ (Subscriptions) │  │
            │  └─────────────────┘  │
            └───────────────────────┘
                        │
                        ▼
                  ┌───────────┐
                  │  Mobile   │
                  │  API      │
                  │ (Future)  │
                  └───────────┘
```

### Key Features

1. **Community Features**
    - Reddit-style posts, upvotes, and threaded comments
    - Facebook-like profiles, connections, and activity feeds
    - Communities (subreddits) with custom rules and moderators
    - Real-time notifications and messaging

2. **Healthcare Integration**
    - AI-powered content recommendations
    - Healthcare-specific communities
    - Privacy-first data handling
    - HIPAA compliance ready

3. **Authentication & Authorization**
    - Email/password + social OAuth (Google, GitHub, etc.)
    - Role-based access control (RBAC)
    - Row-level security (RLS) policies
    - Session management with BetterAuth

4. **Real-Time Features**
    - Live post updates
    - Instant notifications
    - Real-time chat/messaging
    - Activity feeds

---

## 🛠 Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.0.1 | React framework with App Router |
| [React](https://react.dev/) | 18.0 | UI library with Server Components |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.3 | Type-safe development |
| [Node.js](https://nodejs.org/) | ≥20.0.0 | JavaScript runtime |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| [Supabase](https://supabase.com/) | Latest | Backend-as-a-Service (BaaS) |
| [PostgreSQL](https://www.postgresql.org/) | 15+ | Database (via Supabase) |
| [Better Auth](https://www.better-auth.com/) | 1.3.34 | Authentication layer |
| [Zod](https://zod.dev/) | 3.24.4 | Runtime validation |

### UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.5 | Utility-first styling |
| [Radix UI](https://www.radix-ui.com/) | Various | Headless components |
| [shadcn/ui](https://ui.shadcn.com/) | Integrated | Component library |
| [Lucide React](https://lucide.dev/) | 0.552.0 | Icon library |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Theme management |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| [ESLint](https://eslint.org/) | 9.26.0 | Code linting |
| [Prettier](https://prettier.io/) | 3.0.3 | Code formatting |
| [Vitest](https://vitest.dev/) | 3.2.4 | Unit testing |
| [Playwright](https://playwright.dev/) | 1.52.0 | E2E testing |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 20.0.0 ([Download](https://nodejs.org/))
- **pnpm** 10.0.0 (Package manager)
  ```bash
  npm install -g pnpm@10.0.0
  ```
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** ([Sign up](https://supabase.com/))

### Initial Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd 10xr-community-platform
```

#### 2. Install Dependencies

```bash
pnpm install
```

#### 3. Set Up Supabase

1. Create a new project at [Supabase Dashboard](https://supabase.com/dashboard)
2. Copy your project's API keys from Settings → API
3. Note your project URL and anon/public key

#### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Optional: OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Generate a secure secret for BETTER_AUTH_SECRET:**
```bash
openssl rand -base64 32
```

#### 5. Initialize Database Schema

Run the database migrations in Supabase:

```bash
# This will create all necessary tables and policies
pnpm db:setup
```

Alternatively, you can apply the SQL schema manually:
1. Go to your Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `supabase/schema.sql`
3. Run the query

#### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at: **http://localhost:3000**

### Verify Installation

- **Homepage**: http://localhost:3000
- **Auth**: Try signing up/logging in
- **API Health**: http://localhost:3000/api/health

---

## 📁 Project Structure

```
10xr-community-platform/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Main app routes
│   │   ├── feed/                # Home feed
│   │   ├── communities/         # Community pages
│   │   ├── profile/             # User profiles
│   │   └── layout.tsx
│   ├── api/                      # API routes
│   │   ├── auth/[...all]/       # BetterAuth handler
│   │   ├── posts/               # Posts API
│   │   ├── comments/            # Comments API
│   │   ├── communities/         # Communities API
│   │   └── health/              # Health check
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── feed/                    # Feed components
│   ├── posts/                   # Post components
│   ├── communities/             # Community components
│   └── layout/                  # Layout components
│
├── lib/                         # Core libraries
│   ├── auth/                    # Authentication
│   │   ├── better-auth.ts      # BetterAuth config
│   │   └── auth-client.ts      # Client-side auth
│   ├── supabase/                # Supabase setup
│   │   ├── client.ts           # Client instance
│   │   ├── server.ts           # Server instance
│   │   └── types.ts            # Database types
│   ├── actions/                 # Server actions
│   ├── hooks/                   # React hooks
│   └── utils/                   # Utility functions
│
├── supabase/                    # Supabase configuration
│   ├── schema.sql              # Database schema
│   ├── migrations/             # Database migrations
│   └── seed.sql                # Seed data (optional)
│
├── public/                      # Static assets
│   ├── logos/                  # Brand logos
│   └── icons/                  # Brand icons
│
├── styles/                      # Global styles
│   └── tailwind.css            # Tailwind configuration
│
├── .env.local                   # Environment variables (local)
├── .env.example                 # Environment template
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── README.md                   # This file
```

---

## 🔧 Available Scripts

### Development

```bash
# Start development server with Turbopack (fast refresh)
pnpm dev

# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Check code formatting
pnpm prettier

# Fix code formatting
pnpm prettier:fix

# Format all files
pnpm format
```

### Database Operations

```bash
# Set up database schema (first time)
pnpm db:setup

# Generate TypeScript types from Supabase
pnpm db:types

# Reset database (WARNING: destructive)
pnpm db:reset
```

### Testing

```bash
# Run unit tests (Vitest)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage

# Run E2E tests (Playwright)
pnpm e2e:headless

# Run E2E tests with UI
pnpm e2e:ui
```

### Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Analyze bundle size
pnpm analyze
```

---

## 🗄 Database Schema

### Core Tables

#### Users
- `id` (uuid, primary key)
- `email` (text, unique)
- `username` (text, unique)
- `display_name` (text)
- `avatar_url` (text)
- `bio` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Communities
- `id` (uuid, primary key)
- `name` (text, unique)
- `slug` (text, unique)
- `description` (text)
- `icon_url` (text)
- `banner_url` (text)
- `rules` (jsonb)
- `member_count` (integer)
- `created_by` (uuid, foreign key → users)
- `created_at` (timestamp)

#### Posts
- `id` (uuid, primary key)
- `title` (text)
- `content` (text)
- `content_type` (enum: text, image, link, poll)
- `author_id` (uuid, foreign key → users)
- `community_id` (uuid, foreign key → communities)
- `upvotes` (integer)
- `downvotes` (integer)
- `comment_count` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Comments
- `id` (uuid, primary key)
- `content` (text)
- `author_id` (uuid, foreign key → users)
- `post_id` (uuid, foreign key → posts)
- `parent_id` (uuid, foreign key → comments, nullable)
- `upvotes` (integer)
- `downvotes` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### Votes
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users)
- `votable_id` (uuid)
- `votable_type` (enum: post, comment)
- `vote_type` (enum: upvote, downvote)
- `created_at` (timestamp)

#### Memberships
- `user_id` (uuid, foreign key → users)
- `community_id` (uuid, foreign key → communities)
- `role` (enum: member, moderator, admin)
- `joined_at` (timestamp)
- Primary key: (user_id, community_id)

### Row Level Security (RLS) Policies

All tables have RLS enabled with policies for:
- **Public read access** for posts, comments, and communities
- **Authenticated write access** for creating content
- **Owner-only updates** for editing/deleting own content
- **Moderator access** for community management

---

## 🔐 Authentication Flow

### BetterAuth + Supabase Integration

BetterAuth handles authentication logic while Supabase manages sessions and user data:

1. **Sign Up**
   ```typescript
   import { authClient } from "@/lib/auth/auth-client";
   
   await authClient.signUp.email({
     email: "user@example.com",
     password: "secure-password",
     name: "John Doe",
   });
   ```

2. **Sign In**
   ```typescript
   await authClient.signIn.email({
     email: "user@example.com",
     password: "secure-password",
   });
   ```

3. **Social OAuth**
   ```typescript
   await authClient.signIn.social({
     provider: "google",
     callbackURL: "/dashboard",
   });
   ```

4. **Get Session**
   ```typescript
   // Client-side (React hook)
   const { data: session } = authClient.useSession();
   
   // Server-side
   import { auth } from "@/lib/auth/better-auth";
   const session = await auth.api.getSession({ headers: request.headers });
   ```

5. **Sign Out**
   ```typescript
   await authClient.signOut();
   ```

---

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy this application is with Vercel:

1. **Push to GitHub/GitLab**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**
    - Go to [Vercel Dashboard](https://vercel.com/dashboard)
    - Click "Add New Project"
    - Import your Git repository

3. **Configure Environment Variables**
    - Add all variables from `.env.local` to Vercel
    - Ensure `BETTER_AUTH_URL` matches your production domain

4. **Deploy**
    - Vercel will automatically build and deploy
    - Each push to main triggers a new deployment

### Environment Variables for Production

```env
# Supabase (from your production project)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Better Auth (use your production domain)
BETTER_AUTH_SECRET=your-production-secret-key
BETTER_AUTH_URL=https://your-domain.com

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production

# OAuth (production credentials)
GOOGLE_CLIENT_ID=production-google-client-id
GOOGLE_CLIENT_SECRET=production-google-client-secret
```

---

## 🔮 Roadmap

### Phase 1: Core Platform (Current)
- [x] Supabase setup and schema
- [x] BetterAuth integration
- [x] Basic post creation and viewing
- [x] Community creation
- [ ] Upvoting/downvoting system
- [ ] Threaded comments
- [ ] User profiles

### Phase 2: Enhanced Features
- [ ] Real-time notifications
- [ ] Direct messaging
- [ ] Image uploads
- [ ] Rich text editor
- [ ] Search functionality
- [ ] User reputation system

### Phase 3: Healthcare Features
- [ ] Healthcare-specific communities
- [ ] AI content moderation
- [ ] Privacy-enhanced profiles
- [ ] HIPAA compliance features

### Phase 4: Mobile API
- [ ] Expose selected API routes
- [ ] API documentation
- [ ] Rate limiting
- [ ] Mobile-specific optimizations

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit: `git commit -m 'feat: add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test updates
- `chore:` - Build/tooling changes

### Code Quality

- Keep files under 300–500 lines
- Add JSDoc comments to exported functions
- Write tests for new features
- Ensure TypeScript types are correct
- Follow ESLint and Prettier rules

---

## 📄 License

Proprietary - © 2024 10xR. All rights reserved.

---

## 📞 Support

For questions and support:

- **Technical Issues**: Create a GitHub issue
- **Security Concerns**: Email security@10xr.com
- **General Inquiries**: Email contact@10xr.com

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) by Vercel
- [Supabase](https://supabase.com/) by Supabase Inc.
- [Better Auth](https://www.better-auth.com/) by Better Auth Team
- [shadcn/ui](https://ui.shadcn.com/) by shadcn
- Based on [next-enterprise](https://github.com/Blazity/next-enterprise) by Blazity

---

**10xR** - Building the Future of Healthcare Communities 🏥🤝