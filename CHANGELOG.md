# Changelog

All notable changes to the 10xR Community Platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

#### Navigation Bar Component

**Responsive, brand-aligned navigation bar (Reddit-style layout):**

- **NavBar Component** (`app/components/navBar.tsx`)
  - Logo area with mobile and desktop variants
    - Mobile logo (`logo_7.svg`) displays on small screens
    - Desktop logo (`logo_1.svg`) displays on large screens (lg breakpoint)
    - Clickable logo linking to homepage
  - Search bar placeholder (center)
    - Hidden on mobile, visible on md (768px) and above
    - Full-width input with search icon
    - Styled with brand colors (hover states with `brand-cornflower`)
    - Placeholder: "Search communities, posts, or users..."
  - User authentication dropdown (right)
    - Sign In button (hidden on small screens)
    - User menu icon with dropdown
    - Dropdown menu with Profile, Settings, and Sign Out options
    - Accessible with ARIA labels
    - Click-outside to close functionality
  - Mobile menu button for smaller screens
  - Integrated into root layout (`app/layout.tsx`) for global display
  - Mobile-first responsive design with breakpoints at md (768px) and lg (1024px)
  - Follows 10xR brand guidelines and Tailwind CSS design tokens
  - Smooth transitions and hover states throughout

**Design Features:**
- Semantic HTML for accessibility
- Brand color tokens (no hard-coded hex values)
- Consistent with 10xR visual identity
- 10vh height for predictable layout
- Border bottom for visual separation
- Clean, minimal aesthetic

#### Dark Mode Theme System

**Complete dark/light/system theme switching with Orange brand palette:**

- **Theme Provider** (`app/components/theme-provider.tsx`)
  - Wraps application with next-themes provider
  - Client-side only rendering to prevent hydration issues
  - Configured with `attribute="class"` for Tailwind integration
  - Default theme set to "system" (automatic detection)
  - System preference detection enabled
  - Transitions disabled during theme change for instant updates
  - Integrated into root layout wrapping entire application

- **Theme Toggle Component** (`app/components/theme-toggle.tsx`)
  - Dropdown button for theme selection
  - Three theme options: Light, Dark, and System
  - Animated sun/moon icons with smooth transitions
  - Sun icon visible in light mode, moon in dark mode
  - Lucide React icons (Sun, Moon, Laptop)
  - Shadcn UI dropdown menu components
  - Accessibility features (ARIA labels, screen reader support)
  - Integrated into NavBar between Sign In button and User menu
  - Theme preference persisted to localStorage automatically

- **Orange Brand Theme Implementation** (`styles/tailwind.css`)
  - Applied Shadcn's Orange theme palette to both light and dark modes
  - Light mode colors:
    - Primary: Orange (`24.6 95% 53.1%`)
    - Focus ring: Orange (`24.6 95% 53.1%`)
    - Background: Pure white (`0 0% 100%`)
    - Foreground: Dark brown (`20 14.3% 4.1%`)
  - Dark mode colors:
    - Primary: Darker orange (`20.5 90.2% 48.2%`)
    - Focus ring: Orange (`20.5 90.2% 48.2%`)
    - Background: Dark brownish (`20 14.3% 4.1%`)
    - Foreground: Light beige (`60 9.1% 97.8%`)
  - Updated sidebar colors for both modes with HSL format
  - Updated chart colors for data visualization in both modes
  - All CSS variables converted from OKLCH to HSL format for consistency
  - 10xR brand colors (cornflower blue, green-blue) preserved for brand elements

- **Root Layout Updates** (`app/layout.tsx`)
  - Added ThemeProvider wrapper around entire application
  - Added `suppressHydrationWarning` to `<html>` element to prevent theme mismatch errors
  - Ensures theme is applied before first paint (no flash of wrong theme)

**Technical Features:**
- Uses next-themes v0.4+ for theme management
- Automatic localStorage persistence
- No flash of unstyled content (FOUC)
- Hydration-safe implementation
- Client-side state management for interactive components
- Server components remain server-rendered
- CSS variable-based theming for runtime theme switching
- Proper contrast ratios maintained in both themes

#### Authentication System (BetterAuth + Supabase Integration)

**Complete authentication system with multiple providers:**

- **Email/Password Authentication**
  - User signup with email, password, username, and name
  - User login with email and password
  - Password strength validation (minimum 8 characters, uppercase, lowercase, number)
  - Username validation (3-30 characters, alphanumeric with underscores/hyphens)
  - Email format validation
  - "Remember me" functionality for extended sessions
  - Password visibility toggle on login page

- **Social OAuth Authentication**
  - Google OAuth integration
  - Facebook OAuth integration
  - Automatic account linking for verified providers
  - Profile data mapping from OAuth providers
  - Callback URL handling for post-authentication redirects

- **Session Management**
  - Cookie-based authentication with secure session handling
  - Session expiration (7 days default)
  - Automatic session refresh
  - Cookie cache for reduced database queries
  - Fresh session requirements for sensitive operations

- **UI Components**
  - Signup page (`app/app/signup/page.tsx`) with:
    - Email/password form with comprehensive validation
    - Google and Facebook OAuth buttons
    - Password strength indicator (visual progress bar)
    - Real-time field validation and error messages
    - Loading states for all actions
    - Responsive design
  - Login page (`app/app/login/page.tsx`) with:
    - Email/password form
    - Social OAuth buttons
    - "Remember me" checkbox
    - "Forgot password" link
    - Password visibility toggle
    - Callback URL support for post-login redirects
  - Dashboard page (`app/app/dashboard/page.tsx`) with:
    - User profile information display
    - Session details
    - Logout functionality
    - Quick navigation links
    - Development mode session debugging

- **Authentication Client** (`lib/auth/auth-client.ts`)
  - Type-safe React hooks for authentication state:
    - `useSession()` - Get current session
    - `useCurrentUser()` - Get current user
    - `useIsAuthenticated()` - Check authentication status
    - `useRequireAuth()` - Enforce authentication with redirect
    - `useAuthStatus()` - Get detailed auth status (loading, authenticated, unauthenticated, error)
  - Client-side methods:
    - `signUp.email()` - Email/password signup
    - `signIn.email()` - Email/password login
    - `signIn.social()` - OAuth login
    - `signOut()` - Logout
    - `updateUser()` - Update user profile
    - `changeEmail()` - Change email address
    - `changePassword()` - Change password
    - `deleteUser()` - Delete account
  - Helper utilities:
    - `handleAuthError()` - Standardized error handling
    - `validation` - Client-side form validation (email, password, username)
    - `socialProviders` - OAuth provider configuration

- **Authentication Server** (`lib/auth/auth-server.ts`)
  - BetterAuth server configuration with:
    - PostgreSQL connection via Supabase
    - Email/password authentication
    - Google OAuth with profile mapping
    - Facebook OAuth with profile mapping
    - Custom user fields (username, displayName, bio, avatarUrl, karma, etc.)
    - Account linking support
    - Session configuration
    - Security settings (secure cookies, cookie prefix)
  - Additional user fields:
    - `username` - Unique username (required, transformed to lowercase)
    - `displayName` - Display name (optional)
    - `bio` - User biography (optional, max 500 chars)
    - `avatarUrl` - Profile picture URL
    - `location` - User location
    - `website` - User website
    - `karma` - Community reputation points
    - `postCount` / `commentCount` - Content statistics
    - `isActive` / `isBanned` - Account status
    - `banReason` / `bannedUntil` - Moderation fields
    - `lastSeenAt` - Activity tracking

- **API Route Handler** (`app/api/auth/[...all]/route.ts`)
  - Catch-all route for all BetterAuth API endpoints
  - Handles authentication, OAuth callbacks, session management, user operations
  - Endpoints:
    - `POST /api/auth/sign-up/email` - Email signup
    - `POST /api/auth/sign-in/email` - Email login
    - `POST /api/auth/sign-out` - Logout
    - `GET /api/auth/session` - Get session
    - `POST /api/auth/session/refresh` - Refresh session
    - `GET /api/auth/sign-in/social/{provider}` - Initiate OAuth
    - `GET /api/auth/callback/{provider}` - OAuth callback
    - `POST /api/auth/user/*` - User operations

- **Route Protection Middleware** (`middleware.ts`)
  - Automatic route protection based on authentication status
  - Redirects unauthenticated users to login for protected routes
  - Redirects authenticated users away from auth pages
  - Preserves callback URLs for post-login navigation
  - Adds user info to request headers for server components
  - Protected routes: `/dashboard`, `/profile`, `/settings`, `/communities`, `/messages`, `/notifications`
  - Public routes: `/`, `/login`, `/signup`, `/terms`, `/privacy`, etc.
  - Error handling with fallback to login

- **UI Icons Component** (`components/ui/icons.tsx`)
  - SVG icon components for:
    - Social providers (Google, Facebook, GitHub)
    - UI elements (spinner, check, close, alert, eye, eyeOff)
    - App logo
  - Consistent sizing and styling
  - Accessible and lightweight

### Fixed

#### CSS Variable Naming Consistency

- **Sidebar Color Variables** (`styles/tailwind.css`)
  - Fixed CSS variable resolution error for sidebar colors
  - Changed `--color-sidebar: var(--sidebar)` to `--color-sidebar-background: var(--sidebar-background)`
  - The base variable `--sidebar` did not exist; the correct variable is `--sidebar-background`
  - Resolved diagnostic warning: "Cannot resolve '--sidebar' custom property"
  - All sidebar color mappings now consistently reference the correct base variables
  - Ensures proper theming for sidebar components in both light and dark modes

### Technical Details

**Authentication Architecture:**
- **Dual Auth System**: BetterAuth handles authentication logic while Supabase manages database and RLS
- **Database Tables**:
  - `auth_users` - Authentication data (managed by BetterAuth)
  - `users` - Public community identity (1:1 with auth_users, managed by triggers)
- **Session Storage**: Secure HTTP-only cookies with configurable expiration
- **Security Features**:
  - Row Level Security (RLS) enforced on all database operations
  - CSRF protection via Better Auth
  - Password hashing with bcrypt
  - Secure cookie configuration (httpOnly, sameSite, secure in production)
  - Rate limiting support (configurable)

**Environment Variables Required:**
- `BETTER_AUTH_SECRET` - Secret for cookie signing and token encryption
- `BETTER_AUTH_URL` - Base URL of the application
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URL` - Direct PostgreSQL connection string
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth credentials (optional)
- `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` - Facebook OAuth credentials (optional)

**Testing Recommendations:**
1. Test email/password signup and login flows
2. Test Google OAuth flow (if configured)
3. Test Facebook OAuth flow (if configured)
4. Verify session persistence across page reloads
5. Test logout and session cleanup
6. Verify protected route redirects
7. Test "Remember me" functionality
8. Verify password validation rules
9. Test error handling for invalid credentials
10. Verify account linking with multiple providers

### Notes

- This implementation uses **BetterAuth 1.3.34** with **Supabase** as the backend
- OAuth providers require configuration in respective developer consoles (Google Cloud Console, Facebook Developers)
- For production deployment, ensure all OAuth redirect URIs are whitelisted
- Session duration and cookie settings can be adjusted in `lib/auth/auth-server.ts`
- All authentication errors are handled gracefully with user-friendly messages
- The middleware automatically protects routes without additional configuration

---

## [0.1.0] - 2024-11-13

### Added

- Initial project setup with Next.js 16, TypeScript, and Supabase
- Supabase declarative schema in `supabase/schemas/`
- Database tables: users, communities, posts, comments, votes, memberships
- Row Level Security (RLS) policies for all tables
- Repository pattern for type-safe database access
- shadcn/ui component library integration
- Tailwind CSS configuration
- ESLint and Prettier configuration
- Vitest for unit testing
- Playwright for E2E testing
- Project documentation (README.md, CLAUDE.md)

