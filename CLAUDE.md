# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**10xR Community Platform** - A Next.js 16 web application combining Reddit-style community features with Facebook-like social connectivity, focused on healthcare technology. This is a **web-first platform** (not a backend service) using Supabase as the backend and BetterAuth for authentication.

### Key Technologies

- **Frontend/Backend**: Next.js 16 (App Router), React 18, TypeScript 5.8
- **Database**: Supabase (PostgreSQL 15+) with Row Level Security (RLS)
- **Authentication**: BetterAuth 1.3.34 (integrates with Supabase)
- **Styling**: Tailwind CSS 4.1.5, shadcn/ui components, Radix UI primitives
- **Testing**: Vitest (unit), Playwright (E2E)
- **Package Manager**: pnpm 10.21.0
- **Node Version**: >=20.0.0

## Development Commands

### Essential Commands

```bash
# Development server (with Turbopack for fast refresh)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Linting and formatting
pnpm lint              # Check for linting errors
pnpm lint:fix          # Auto-fix linting issues
pnpm prettier          # Check formatting
pnpm prettier:fix      # Auto-fix formatting
pnpm format            # Format all files (prettier + tailwind)

# Testing
pnpm test              # Run unit tests (Vitest)
pnpm test:watch        # Run tests in watch mode
pnpm test:ui           # Run tests with Vitest UI
pnpm test:coverage     # Generate coverage report
pnpm e2e:headless      # Run E2E tests (Playwright)
pnpm e2e:ui            # Run E2E tests with UI

# Supabase Type Generation
pnpm supabase:types        # Generate types from local Supabase schema
pnpm supabase:types:watch  # Watch schema changes and regenerate types
pnpm supabase:types:remote # Generate types from remote Supabase project

# BetterAuth
pnpm auth:generate     # Generate BetterAuth types
```

### Supabase Local Development

```bash
# Start Supabase local stack (PostgreSQL, Studio, etc.)
supabase start

# Stop Supabase local stack
supabase stop

# View local Supabase Studio
# Navigate to: http://127.0.0.1:54323

# Apply migrations
supabase db reset

# Create a new migration
supabase migration new <migration_name>
```

## Architecture

### Database Schema Organization

The database schema is split into **declarative SQL files** in `supabase/schemas/`, loaded in order via `supabase/config.toml`:

1. **types.sql** - All ENUM types (content_type, vote_type, member_role, notification_type, etc.)
2. **auth.sql** - Authentication tables (auth_users, auth_sessions, etc.)
3. **community_core.sql** - Core community tables (users, communities, memberships)
4. **content.sql** - Content tables (posts, comments, votes)
5. **engagement.sql** - Engagement tables (follows, notifications, saved_posts)
6. **messaging.sql** - Direct messaging tables
7. **b2b_sales.sql** - B2B sales engine (agencies, professionals, leads, evangelists)
8. **analytics.sql** - Analytics and tracking tables
9. **functions.sql** - PostgreSQL functions and triggers
10. **rls_policies.sql** - Row Level Security policies

**Important**: Always use the declarative schema files in `supabase/schemas/` instead of creating migrations. Run `supabase db reset` to apply changes.

### Authentication Architecture

**Dual Auth System**: BetterAuth + Supabase
- **BetterAuth** handles authentication logic (login, signup, OAuth)
- **Supabase** manages database operations and RLS policies
- **auth_users** table stores authentication data
- **users** table stores public community identity (username, karma, avatar) linked 1:1 to auth_users

**Auth Flow**:
1. User signs up/logs in via BetterAuth (`lib/auth/auth-server.ts`)
2. BetterAuth creates record in `auth_users` table
3. Trigger automatically creates corresponding `users` record for community identity
4. Session managed via secure cookies (prefix: `10xr-auth`)

**Key Files**:
- `lib/auth/auth-server.ts` - BetterAuth server configuration
- `lib/auth/auth-client.ts` - BetterAuth client instance
- `app/api/auth/[...all]/route.ts` - BetterAuth API handler
- `supabase/schemas/auth.sql` - Auth schema and triggers

### Repository Pattern

Use the **Repository pattern** in `lib/supabase/server.ts` for type-safe database access:

```typescript
// Server-side only
import { getUserRepository, getPostRepository } from '@/lib/supabase/server';

const userRepo = await getUserRepository();
const user = await userRepo.getOne(userId);

const postRepo = await getPostRepository();
const posts = await postRepo.getByCommunity(communityId, page, limit);
```

**Available Repositories**:
- `UserRepository` - User CRUD and search
- `CommunityRepository` - Community CRUD and search
- `PostRepository` - Post CRUD, filtering by community/author
- `CommentRepository` - Comment CRUD, threaded comments
- `CommunityMemberRepository` - Membership management
- `AdminRepository` - Admin operations (ban users, remove posts, handle reports)

**Important**: Repositories use RLS-enforced Supabase client. For admin operations that bypass RLS, use `AdminRepository` which uses the service role client.

### Client vs. Server Supabase Instances

- **Server-side** (`lib/supabase/server.ts`):
  - Use in Server Components, Server Actions, API routes
  - Call `createClient()` for RLS-enforced operations
  - Call `createServiceRoleClient()` for admin operations (bypasses RLS)

- **Client-side** (`lib/supabase/client.ts`):
  - Use in Client Components and browser-only code
  - Always enforces RLS policies

### Key Domain Concepts

1. **Anonymous Community Identity** - Users have a public persona (username, karma) separate from auth identity
2. **Communities (Subreddits)** - User-created spaces with rules, tags, and moderation
3. **Memberships** - Users join communities with roles (member, moderator, admin)
4. **Content** - Posts and threaded comments with voting
5. **Engagement** - Follows, notifications, saved content
6. **B2B Sales Engine** - Agency tracking, professional verification, evangelist rewards
7. **Anonymous Posting** - Users can post/comment anonymously in communities that allow it

### File Organization

```
app/
├── (auth)/              # Auth route group (login, signup)
├── (dashboard)/         # Main app route group (feed, communities, profiles)
├── api/                 # API routes
│   ├── auth/[...all]/   # BetterAuth handler
│   ├── health/          # Health check endpoint
│   └── ...              # Future API endpoints
├── layout.tsx           # Root layout
└── page.tsx             # Landing page

lib/
├── auth/                # BetterAuth configuration
│   ├── auth-server.ts   # Server-side auth config
│   └── auth-client.ts   # Client-side auth instance
├── supabase/            # Supabase setup
│   ├── server.ts        # Server-side client + repositories
│   ├── client.ts        # Client-side client
│   ├── database.types.ts # Generated types
│   └── types.ts         # Custom type exports
└── utils.ts             # Utility functions (cn, etc.)

components/
├── ui/                  # shadcn/ui components
└── ...                  # Domain components (feed, posts, communities)

supabase/
├── schemas/             # Declarative schema files (types, auth, content, etc.)
├── migrations/          # Migration history (auto-generated)
├── seed.sql             # Seed data
└── config.toml          # Supabase configuration
```

## Important Implementation Notes

### Type Safety

- **Always regenerate types** after modifying `supabase/schemas/*.sql`:
  ```bash
  pnpm supabase:types
  ```
- Use generated types from `lib/supabase/database.types.ts`
- Use Repository pattern for type-safe queries

### Row Level Security (RLS)

All tables have RLS enabled. Key policies:
- **Public read** for posts, comments, communities (where not removed)
- **Authenticated write** for creating content
- **Owner-only updates** for editing/deleting own content
- **Role-based access** for moderation (moderator/admin roles)
- **Service role bypasses RLS** (use carefully via `AdminRepository`)

### Testing Strategy

1. **Unit Tests** (Vitest) - Test utility functions, hooks, components
2. **E2E Tests** (Playwright) - Test critical user flows (auth, posting, voting)
3. Run tests before committing: `pnpm test && pnpm e2e:headless`

### Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- `BETTER_AUTH_SECRET` - BetterAuth encryption secret
- `BETTER_AUTH_URL` - Application base URL
- `DATABASE_URL` - Direct PostgreSQL connection string (for BetterAuth)

Optional OAuth variables:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`

### API Routes

API routes follow REST conventions:
- Health check: `/api/health` (also `/healthz`, `/ping`)
- Auth: `/api/auth/*` (handled by BetterAuth)

Future API endpoints will be in `/api/posts`, `/api/comments`, `/api/communities`, etc.

### Styling Guidelines

- Use Tailwind CSS utility classes
- Use `cn()` helper from `lib/utils.ts` for conditional classes
- Use shadcn/ui components from `components/ui/`
- Dark mode supported via `next-themes`

### Code Quality Standards

- **TypeScript strict mode** enabled
- **No unchecked indexed access** (`noUncheckedIndexedAccess: true`)
- ESLint and Prettier configured
- Files should be under 300-500 lines
- Add JSDoc comments to exported functions

## Common Development Workflows

### Adding a New Feature

1. Design database schema in appropriate `supabase/schemas/*.sql` file
2. Run `supabase db reset` to apply schema changes
3. Generate types: `pnpm supabase:types`
4. Create Repository methods in `lib/supabase/server.ts` if needed
5. Add RLS policies in `supabase/schemas/rls_policies.sql`
6. Implement UI components
7. Write tests
8. Run linting and tests: `pnpm lint && pnpm test`

### Working with Authentication

```typescript
// Server Component - Get current user
import { getCurrentUser } from '@/lib/supabase/server';

const user = await getCurrentUser();
if (!user) redirect('/login');

// Client Component - Check session
import { authClient } from '@/lib/auth/auth-client';

function MyComponent() {
  const { data: session } = authClient.useSession();

  if (!session) return <LoginPrompt />;
  return <AuthenticatedContent />;
}

// Sign out
await authClient.signOut();
```

### Querying Data

```typescript
// Using repositories (recommended)
import { getPostRepository } from '@/lib/supabase/server';

const postRepo = await getPostRepository();
const posts = await postRepo.getByCommunity(communityId);

// Direct Supabase client (when needed)
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data, error } = await supabase
  .from('posts')
  .select('*, author:users(*), community:communities(*)')
  .eq('community_id', communityId);
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main

### Supabase Production

1. Create production project at supabase.com
2. Apply schema: Copy contents of `supabase/schemas/*.sql` files to SQL Editor
3. Update environment variables with production credentials
4. Enable RLS on all tables
5. Set up OAuth providers in Supabase dashboard

## Project Philosophy

- **Web-first platform** - Not a backend API service
- **Privacy-focused** - HIPAA-ready infrastructure
- **Community-driven** - Reddit-style discussions + Facebook-like connections
- **Healthcare innovation** - AI-powered content with healthcare focus
- **Scalable architecture** - Serverless, edge-ready

## Security Considerations

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- Always validate user input with Zod schemas
- Use RLS policies for data access control
- Sanitize user-generated content (XSS prevention)
- Rate limit API endpoints in production
- Use secure cookies (`sameSite: 'lax'`, `httpOnly`, `secure` in production)
