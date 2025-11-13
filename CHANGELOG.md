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

#### Auth-Aware Navigation with BetterAuth Integration

**Dynamic navbar with session-based authentication state:**

- **Updated NavBar Component** (`app/components/navBar.tsx`)
  - Converted from client component to async server component
  - Fetches user session using BetterAuth's `auth()` helper on the server
  - Conditional rendering based on authentication state:
    - **Unauthenticated users** see "Sign Up" and "Log In" buttons linking to `/signup` and `/login`
    - **Authenticated users** see UserDropdown with profile menu
  - Maintains all existing features (responsive logo, search bar, theme toggle)
  - Zero-config server-side session fetching (no loading states needed)
  - Improved performance with server-side rendering

- **New UserDropdown Component** (`app/components/user-dropdown.tsx`)
  - Client-side dropdown menu for authenticated users
  - Uses Shadcn UI DropdownMenu components
  - Features:
    - User avatar display with fallback to default icon
    - User name and email display in dropdown header
    - "Create Community" link (routes to `/r/create`)
    - "Profile" link (routes to `/profile`)
    - "Settings" link (routes to `/settings`)
    - Logout button with loading state
  - Integrates with BetterAuth `signOut()` method
  - Accessible with ARIA labels and keyboard navigation
  - Smooth hover transitions and focus states
  - Graceful error handling for logout failures

**User Experience Improvements:**
- Instant session detection (server-rendered, no loading spinners)
- Clear visual distinction between authenticated and unauthenticated states
- Seamless logout with loading feedback
- Avatar display from OAuth providers (Google, Facebook) or user profile
- Consistent brand styling with Tailwind utilities

**Technical Implementation:**
- Server component fetches session without exposing auth logic to client
- Client components handle only interactive elements (dropdown, logout)
- Separation of concerns: server for data fetching, client for interactivity
- Type-safe props using TypeScript
- Follows Next.js 16 App Router conventions

#### Secure Settings Page with Username Management

**Protected settings page for authenticated users:**

- **Settings Page Route** (`app/settings/page.tsx`)
  - Async server component with BetterAuth session protection
  - Automatically redirects unauthenticated users to `/login`
  - Fetches user profile data from Supabase `users` table
  - Server-side data fetching for optimal performance
  - Links BetterAuth user ID to Supabase user profile via `auth_user_id`
  - Passes profile data as props to client form component
  - Includes page metadata (title, description)

- **Settings Form Component** (`app/components/settings-form.tsx`)
  - Client-side form for username updates
  - Features:
    - Real-time form validation with regex patterns
    - Username constraints: 3-20 characters, alphanumeric with underscores/hyphens
    - Character counter (current length / max length)
    - Loading states during form submission
    - Disabled save button when no changes or invalid input
    - Error handling for duplicate usernames (unique constraint)
    - Success/error toast notifications via Sonner
    - Cancel button to navigate back to home
    - Automatic page refresh after successful update
  - Uses Supabase browser client for database updates
  - Shadcn UI components: Input, Label, Button, Separator
  - Accessible form with ARIA attributes
  - Lowercase and trim username before saving

**User Experience:**
- Protected route prevents unauthorized access
- Instant validation feedback as user types
- Clear error messages for validation failures
- Visual feedback during save operation
- Success confirmation with toast notification
- Responsive design with mobile support

**Security Features:**
- Server-side session validation
- Client-side input validation before submission
- Server-side unique constraint enforcement
- Proper error handling without exposing system details
- Supabase RLS policies apply to updates

**Database Integration:**
- Updates `users` table in Supabase declarative schema
- Respects username constraints (length, format)
- Handles unique constraint violations gracefully
- Uses user's ID from the `users` table (not auth_user_id)

#### Server Actions for Secure Data Mutations

**Refactored settings page to use Next.js Server Actions:**

- **Server Actions File** (`app/actions.ts`)
  - Created centralized server actions file for all data mutations
  - `updateUsername` server action with comprehensive validation:
    - BetterAuth session validation on the server
    - Input validation (length, format, required fields)
    - Duplicate username detection with user-friendly errors
    - Normalized username storage (lowercase, trimmed)
    - Constraint enforcement (3-20 chars, alphanumeric with _ and -)
    - Handles unique constraint violations (23505 error code)
    - Automatic cache revalidation after successful update
  - Type-safe response interface exported for components
  - Comprehensive error handling with logging
  - Revalidates `/settings` and `/profile` paths after mutation

- **SubmitButton Component** (`app/components/submit-button.tsx`)
  - Reusable submit button for server action forms
  - Uses `useFormStatus` hook for automatic pending state detection
  - Features:
    - Loading spinner during form submission
    - Disabled state while pending
    - Customizable labels (idle and pending states)
    - Configurable button variants
    - ARIA attributes for accessibility (aria-busy, aria-live)
    - Auto-detects parent form submission state
  - Clean API with sensible defaults
  - Can be used across all server action forms

- **Refactored SettingsForm** (`app/components/settings-form.tsx`)
  - Migrated from client-side Supabase mutation to Server Actions
  - Uses `useFormState` hook for reactive state management
  - Binds server action to form with automatic state handling
  - Features:
    - Progressive enhancement (works without JavaScript)
    - Automatic error handling from server responses
    - Toast notifications based on server action status
    - Visual success indicator for completed updates
    - Form validation on both client and server
    - Cancel button to return home
  - Removed manual Supabase client creation from component
  - Simplified component logic (no loading state management needed)
  - Server handles all mutation logic and security

- **Layout Updates** (`app/layout.tsx`)
  - Added Sonner Toaster component to root layout
  - Enables toast notifications throughout the application
  - Theme-aware toasts (respects dark/light mode)
  - Custom icons for success, error, info, warning states

**Benefits of Server Actions:**
- **Security**: All mutations run on the server (no client-side database access)
- **Performance**: Automatic request deduplication and caching
- **Progressive Enhancement**: Forms work without JavaScript
- **Simplified Code**: No need for API routes or manual fetch calls
- **Type Safety**: End-to-end type safety from action to component
- **Better UX**: Optimistic updates and automatic revalidation
- **Error Handling**: Centralized error handling on the server

**Technical Implementation:**
- Server actions marked with `'use server'` directive
- Uses Next.js `revalidatePath` for cache management
- Leverages `useFormState` for reactive form state
- Integrates with `useFormStatus` for pending states
- Automatic serialization of server responses
- Toast notifications via Sonner library

#### Community Creation Feature (Reddit-Style Subreddits)

**New community creation workflow at `/r/create`:**

- **Create Community Server Action** (`app/actions.ts`)
  - Added `createCommunity` server action for secure community creation
  - Features:
    - BetterAuth session validation (redirects to login if not authenticated)
    - Links to user profile via `auth_user_id` lookup in `users` table
    - Automatic slug generation from community name
      - Converts to lowercase
      - Replaces spaces with hyphens
      - Removes special characters
      - Validates slug format (alphanumeric + hyphens only)
    - Duplicate detection for both name and slug
    - Comprehensive validation:
      - Required field check
      - Length constraints (3-50 characters per schema)
      - Format validation
    - Error handling with user-friendly messages
    - Handles unique constraint violations (23505 error code)
    - Automatic cache revalidation of home page
    - Redirects to new community page on success (`/r/{slug}`)
  - References correct foreign key (`created_by` → `users.id`)
  - Applies default values from schema (theme color, privacy settings, etc.)

- **Create Community Page** (`app/r/create/page.tsx`)
  - Client-side form component at `/r/create` route
  - Features:
    - Visual r/ prefix for community names
    - Real-time validation feedback
    - Character count limits (3-50 chars)
    - Community guidelines info box
    - Toast notifications for errors only (success redirects)
    - Cancel button to return home
    - SubmitButton with loading state
  - Uses `useFormState` for reactive form management
  - Integrates with server action seamlessly
  - Accessible form with ARIA attributes
  - Mobile-responsive design

**User Experience:**
- Clear visual indication of community URL format (r/ prefix)
- Instant error feedback via toasts
- Loading spinner during creation
- Automatic redirect to new community
- Helpful guidelines displayed inline
- Persistent error messages below input

**Database Integration:**
- Creates records in `communities` table
- Generates unique slug for URL routing
- Links community to creator via `created_by` field
- Respects schema constraints:
  - Name: 3-50 characters
  - Slug: lowercase alphanumeric + hyphens
  - Unique constraints on both name and slug
- Applies default values:
  - `theme_color`: '#568AFF'
  - `member_count`: 0
  - `post_count`: 0
  - `is_private`: false
  - `is_nsfw`: false
  - `allow_anonymous_posts`: true

**Security Features:**
- Server-side session validation before creation
- Proper foreign key relationships maintained
- User must be authenticated to create communities
- All validation happens on both client and server
- SQL injection protection via Supabase parameterized queries

#### Dynamic Community Pages (`/r/[slug]`)

**Individual community pages with creator-editable descriptions:**

- **Dynamic Route Page** (`app/r/[id]/page.tsx`)
  - Async server component for optimal performance
  - Fetches community data based on slug from URL
  - Features:
    - Two-column responsive layout (65% posts / 35% sidebar)
    - Server-side data fetching with Supabase
    - Session-aware rendering (different UI for creators)
    - Automatic 404 handling for non-existent communities
    - DiceBear API integration for community avatars
    - Formatted creation date display
    - SEO-friendly metadata generation
  - Uses `unstable_noStore` for always-fresh data
  - Queries by slug for clean URLs
  - Checks creator ownership for edit permissions

- **Community Description Form** (`app/components/sub-description-form.tsx`)
  - Client-side form for creator-only description editing
  - Features:
    - Textarea with 500 character limit
    - Character counter display
    - Toast notifications on save
    - Loading states during save
    - Error handling with inline messages
    - Hidden slug field for identification
  - Uses `useFormState` for reactive state
  - Integrates with server action seamlessly
  - Only visible to community creators

- **Update Description Server Action** (`app/actions.ts`)
  - Added `updateSubDescription` server action
  - Features:
    - BetterAuth session validation
    - User profile lookup via `auth_user_id`
    - Ownership verification before update
    - Length validation (max 500 characters)
    - Allows clearing description (null value)
    - Updates `updated_at` timestamp
    - Automatic cache revalidation
    - Comprehensive error handling
  - Security checks:
    - Verifies user is authenticated
    - Confirms user owns the community
    - Validates slug exists
    - Prevents unauthorized edits

- **SaveButton Component** (`app/components/save-button.tsx`)
  - Reusable save button for form actions
  - Features:
    - Uses `useFormStatus` for pending detection
    - Shows "Saving..." with spinner
    - Disabled during submission
    - Customizable text and variant
    - ARIA attributes for accessibility
  - Similar to SubmitButton but save-focused

- **Loading Skeleton** (`app/r/[id]/loading.tsx`)
  - Matches page layout for smooth transitions
  - Features:
    - Two-column skeleton structure
    - Card skeletons for posts
    - Sidebar skeleton matching actual content
    - Responsive design
    - Animated loading states

**Page Layout:**
- Left Column (65%):
  - Community header with name
  - Posts section (placeholder for now)
  - Empty state message
- Right Column (35%):
  - About Community card
  - Community avatar (DiceBear generated)
  - Community name with link
  - Creation date with cake icon
  - Description (editable for creator, read-only for others)

**User Experience:**
- Creators see editable description form
- Non-creators see read-only description
- Toast notifications on successful save
- Loading states during operations
- 404 page for invalid community slugs
- Responsive design (sidebar hidden on mobile)
- Fresh data on every page load

**Database Integration:**
- Queries `communities` table by slug
- Fetches: id, name, slug, description, created_at, created_by
- Updates description and updated_at fields
- Maintains foreign key integrity
- Cache revalidation after updates

**Security Features:**
- Server-side ownership validation
- Only creators can edit descriptions
- Authentication required for edits
- Proper error messages (no sensitive data exposed)
- SQL injection protection via parameterized queries

#### Post Creation Feature with Rich Text Editor

**Complete post creation workflow with TipTap editor and image uploads:**

- **Create Post Server Action** (`app/actions.ts`)
  - Added `createPost` server action for secure post creation
  - Features:
    - BetterAuth session validation (redirects to login if not authenticated)
    - Links to user profile via `auth_user_id` lookup in `users` table
    - Links to community via `slug` lookup in `communities` table
    - Automatic post slug generation from title for SEO-friendly URLs
    - Supports both text and image post types
    - Content type validation (text or image)
    - Comprehensive validation:
      - Title: Required, 3-300 characters
      - Content: Required for text posts (TipTap JSON)
      - Image URL: Required for image posts
    - Error handling with user-friendly messages
    - Automatic cache revalidation of community page
    - Redirects to new post page on success (`/r/{slug}/post/{id}`)
  - Database operations:
    - Inserts into `posts` table with proper foreign keys
    - Stores TipTap content as JSON in `content` field
    - Stores image URLs in `media_url` field
    - Sets `content_type` enum (text or image)
    - Links to author via `author_id` → `users.id`
    - Links to community via `community_id` → `communities.id`
    - Generates unique post slug from title

- **Post Creation Page** (`app/r/[id]/create/page.tsx`)
  - Client-side form at `/r/{slug}/create` route
  - Features:
    - Tabbed UI for post types (Text vs Image)
    - TipTap rich text editor with toolbar
    - UploadThing integration for image uploads
    - Real-time form validation
    - Toast notifications for errors
    - Loading states during submission and uploads
    - Cancel button to return to community
  - Text Post Tab:
    - Title input (required, max 300 chars)
    - TipTap editor with formatting toolbar:
      - Bold, Italic formatting
      - Heading 2 style
      - Bullet lists and ordered lists
      - Undo/Redo functionality
    - Editor stores content as JSON for database
    - Minimum 200px height with prose styling
  - Image Post Tab:
    - Title input (required, max 300 chars)
    - Image upload dropzone with UploadThing
    - Drag-and-drop support
    - File type validation (images only)
    - File size validation (max 4MB)
    - Image preview after upload
    - Remove button to clear uploaded image
    - Upload progress indicator
  - Uses `useFormState` for reactive form management
  - Integrates with `createPost` server action
  - Accessible form with ARIA attributes
  - Mobile-responsive design

- **UploadThing Configuration** (`app/api/uploadthing/core.ts`)
  - Image uploader endpoint with BetterAuth middleware
  - Features:
    - Accepts images: png, jpg, jpeg, webp
    - Max file size: 4MB
    - Max file count: 1 per upload
    - Authentication required via BetterAuth session
    - Returns file URL on completion
    - Server-side validation and processing
  - Integrated with Next.js App Router
  - Type-safe with TypeScript

- **UploadThing Route Handler** (`app/api/uploadthing/route.ts`)
  - REST API endpoints for file uploads
  - Automatically handles POST and GET requests
  - Uses UploadThing SDK for secure file management

- **UploadThing Utilities** (`lib/uploadthing.ts`)
  - Type-safe React hooks for client-side uploads
  - `useUploadThing` hook for programmatic uploads
  - `uploadFiles` helper function
  - Generated from file router configuration
  - Full TypeScript support

**User Experience:**
- Clear visual distinction between post types
- Rich text formatting with instant preview
- Image upload with progress feedback
- Validation errors shown inline
- Loading spinners during operations
- Automatic redirect to new post
- Toast notifications for errors
- Responsive design works on all screen sizes

**Database Integration:**
- Creates records in `posts` table with proper schema
- Title: string (3-300 chars)
- Content: JSON (TipTap document) for text posts
- Media URL: string for image posts
- Content Type: enum ('text' | 'image')
- Author ID: foreign key to `users.id`
- Community ID: foreign key to `communities.id`
- Slug: auto-generated from title
- Default values applied:
  - `upvotes`: 0
  - `downvotes`: 0
  - `score`: 0
  - `comment_count`: 0
  - `is_anonymous`: false
  - `is_locked`: false
  - `is_removed`: false

**Security Features:**
- Server-side session validation before creation
- Proper foreign key relationships maintained
- User must be authenticated to create posts
- File upload authentication via BetterAuth
- File size and type validation
- All validation happens on both client and server
- SQL injection protection via Supabase parameterized queries
- XSS protection through content sanitization

**Technical Stack:**
- TipTap 3.x for rich text editing
  - StarterKit extension bundle
  - JSON document format
  - Extensible and customizable
- UploadThing for file uploads
  - Secure file storage
  - CDN-backed delivery
  - Type-safe React hooks
  - Built-in progress tracking
- Shadcn UI Tabs component
- Form submission via Server Actions
- Sonner for toast notifications

#### Homepage with Voting and Pagination

**Complete homepage feed with Reddit-style voting system:**

- **Homepage Route** (`app/page.tsx`)
  - Async server component with server-side data fetching
  - Features:
    - Two-column responsive layout (65% posts / 35% sidebar)
    - Suspense streaming with loading skeletons
    - Pagination support via URL query params
    - BetterAuth session awareness
    - Dynamic sidebar based on authentication state
  - Data fetching:
    - Fetches posts with pagination (10 per page)
    - Includes related data (communities, users, votes)
    - Vote count calculation
    - Total post count for pagination
    - Uses `unstable_noStore` for always-fresh data
  - Left Column:
    - Post feed with ShowItems component
    - Pagination controls
    - Suspense boundary with fallback skeleton
  - Right Column:
    - Welcome card with platform info
    - Create Community / Browse Communities buttons (authenticated)
    - Sign Up / Log In buttons (unauthenticated)
    - Community guidelines card
    - Platform info with links (About, Help, Terms, Privacy)
    - Sticky positioning for scroll persistence

- **Vote Handling Server Action** (`app/actions.ts`)
  - Added `handleVote` server action for upvote/downvote operations
  - Features:
    - BetterAuth session validation (redirects to login if not authenticated)
    - User profile lookup via `auth_user_id`
    - Toggle vote logic:
      - Case 1: No existing vote → Create new vote
      - Case 2: Same vote again → Remove vote (toggle off)
      - Case 3: Different vote → Update vote type
    - Vote types: 'upvote' and 'downvote'
    - Stores in `votes` table with proper foreign keys
    - Automatic cache revalidation of homepage
    - Comprehensive error handling
  - Database operations:
    - Queries `votes` table by votable_id, user_id, votable_type
    - Inserts, updates, or deletes vote records
    - Uses `votable_type` enum to distinguish post vs comment votes
    - Links to posts via `votable_id` and users via `user_id`

- **PostCard Component** (`app/components/post-card.tsx`)
  - Server component displaying individual posts
  - Features:
    - Upvote/downvote buttons with visual feedback
    - Vote count display with color coding
    - User vote status indication (highlighted buttons)
    - Post title and content preview
    - Author and community metadata
    - Timestamp with relative formatting (e.g., "2h ago")
    - Image preview for image posts
    - Comment count with icon
    - Links to post detail view
    - Disabled voting for unauthenticated users
  - Vote UI:
    - ArrowUp/ArrowDown icons from Lucide
    - Orange highlight for upvotes
    - Blue highlight for downvotes
    - Form-based voting with server actions
    - Hidden input fields for postId
  - Content handling:
    - Extracts text from TipTap JSON for preview
    - 150-character truncation with ellipsis
    - Displays "[Image Post]" for image content
    - Shows image thumbnail for image posts
  - Time formatting:
    - "just now" for <1 minute
    - "Xm ago" for minutes
    - "Xh ago" for hours
    - "Xd ago" for days

- **ShowItems Component** (`app/components/show-items.tsx`)
  - Server component rendering list of posts
  - Features:
    - Maps over posts array
    - Renders PostCard for each post
    - Empty state handling
    - Vertical stack layout with gap spacing
  - Empty state:
    - Centered message
    - "No posts yet" heading
    - "Be the first to create a post!" subtext

- **SuspenseCard Component** (`app/components/suspense-card.tsx`)
  - Loading skeleton for Suspense fallback
  - Features:
    - 5 card skeletons matching PostCard layout
    - Vote section skeleton (up/down/count)
    - Content section skeleton (metadata, title, preview, actions)
    - Shadcn UI Skeleton components
    - Animated loading states
    - Responsive design

- **Pagination Component** (`app/components/pagination.tsx`)
  - Client component for page navigation
  - Features:
    - Previous/Next buttons with chevron icons
    - Current page and total pages display
    - Disabled states for boundary pages
    - URL query parameter-based navigation
    - Responsive button labels (hidden on small screens)
    - useRouter for client-side navigation
    - useSearchParams for reading current page
  - Conditional rendering:
    - Only renders if totalPages > 1
    - Hides on single-page results

**User Experience:**
- Fast page loads with streaming Suspense
- Smooth voting interactions with optimistic UI
- Clear visual feedback for vote status
- Pagination for browsing large post lists
- Responsive design works on all screen sizes
- Loading skeletons prevent layout shift
- Empty states guide new users
- Authentication-aware UI

**Database Integration:**
- Queries `posts` table with related data
- Joins with `communities` for community info
- Joins with `users` for author info
- Joins with `votes` for vote counts and user votes
- Vote count calculation on server
- Pagination using Supabase range queries
- Total count query for pagination
- Ordered by created_at descending (newest first)

**Security Features:**
- Server-side session validation for voting
- Voting requires authentication
- Proper foreign key relationships
- User vote status checks
- All validation happens on server
- SQL injection protection via parameterized queries
- No sensitive data exposed to client

**Technical Implementation:**
- Next.js 16 Async Server Components
- Suspense for streaming data
- Server Actions for mutations
- Client-side pagination routing
- Responsive Tailwind CSS
- Lucide React icons
- Time-based relative timestamps
- JSON content parsing for TipTap

#### 1-on-1 Direct Messaging System

**Complete real-time chat functionality for direct messaging:**

- **Chat Database Schema** (`supabase/schemas/direct_chat.sql`)
  - Declarative SQL schema for 1-on-1 chat system
  - Tables:
    - `chat_room` - Individual chat rooms
      - Supports direct (1-on-1) and group chat types
      - Tracks creation and last update timestamps
      - Optional room names
    - `chat_room_member` - Room membership tracking
      - Many-to-many relationship between users and rooms
      - Tracks `last_read_at` for unread message counting
      - Joined timestamp for membership history
    - `message` - Chat messages
      - Message content with timestamps
      - Soft delete support (`is_deleted` flag)
      - Edit tracking (`is_edited` flag)
      - Links to author and room
  - Helper Functions:
    - `get_or_create_chat_room(user1_id, user2_id)` - Creates or retrieves existing room
    - `get_unread_count(p_user_id, p_room_id)` - Calculates unread messages
  - Trigger-based duplicate prevention:
    - `prevent_duplicate_chat_room()` trigger function
    - Ensures same user pair can only have one direct chat room
    - Raises exception if duplicate room is attempted
  - RLS Policies:
    - Room members can view their rooms
    - Room members can view messages
    - Room members can send messages
    - Users can read their own membership data
    - Secure message deletion and editing

- **Chat Layout** (`app/(chat)/layout.tsx`)
  - Protected layout for all chat routes
  - BetterAuth session validation
  - Redirects unauthenticated users to login
  - Responsive container with proper spacing

- **Server Actions** (`app/actions.ts`)
  - `createOrGetChatRoom(targetUserId)`:
    - Finds existing room between two users
    - Creates new room via RPC function if none exists
    - Automatic cache revalidation
    - Returns room ID for navigation
  - `sendMessage(formData)`:
    - Validates room membership before sending
    - Message text validation (required, max 5000 chars)
    - Inserts message with proper foreign keys
    - Automatic cache revalidation
    - Error handling with user feedback

- **Chat List Page** (`app/(chat)/page.tsx`)
  - Server component showing all conversations
  - Features:
    - List of all user's chat rooms
    - Last message preview with truncation
    - Unread message count badges
    - Relative timestamps (e.g., "2h ago", "Yesterday")
    - User avatars with fallback initials
    - Empty state with call-to-action
  - Data fetching:
    - Fetches all rooms user is member of
    - Loads other member details for each room
    - Retrieves last message for preview
    - Calculates unread counts via RPC function
    - Ordered by last updated (most recent first)
  - User experience:
    - Click any conversation to open chat room
    - Visual unread indicators (orange badges)
    - Responsive card-based layout
    - UserSearchDialog integration for new chats

- **User Search Dialog** (`app/components/user-search-dialog.tsx`)
  - Client component for finding users to message
  - Features:
    - Modal dialog with search input
    - Debounced search (300ms delay)
    - Real-time user search by username
    - Click user to start or open existing chat
    - Loading states during search and room creation
    - Empty states with helpful messages
  - Search implementation:
    - Uses Supabase ILIKE for case-insensitive search
    - Limits to 10 results
    - Displays avatars and usernames
    - Handles errors gracefully with toast notifications
  - Navigation:
    - Creates/retrieves room via `createOrGetChatRoom`
    - Automatically navigates to chat room
    - Resets dialog state after navigation

- **Chat Room Page** (`app/(chat)/[roomId]/page.tsx`)
  - Server component for individual conversations
  - Features:
    - Full-height chat interface
    - Header with other user's info
    - Real-time message display
    - Message input form
    - Back button for mobile
    - Avatar display with fallback
    - Online status placeholder
  - Data fetching:
    - Verifies user is room member (404 if not)
    - Fetches room details
    - Loads other participant info
    - Retrieves all messages ordered by time
    - Joins with user data for message authors
    - Updates `last_read_at` timestamp
  - Security:
    - Only room members can view messages
    - Authentication required
    - Membership validation

- **ChatMessages Component** (`app/components/chat-messages.tsx`)
  - Client component with real-time updates
  - Features:
    - Supabase Realtime subscription for live messages
    - Auto-scroll to bottom on new messages
    - Chat bubble UI grouped by sender
    - User avatars with fallback initials
    - Timestamp formatting (relative and absolute)
    - Message grouping by author
    - Empty state for new conversations
  - Real-time implementation:
    - Subscribes to postgres_changes INSERT events
    - Filters by chat_room_id
    - Fetches full message data with user info
    - Appends new messages to state
    - Unsubscribes on cleanup
  - UI design:
    - Current user messages: right-aligned, orange background
    - Other user messages: left-aligned, muted background
    - Usernames shown on first message in group
    - Timestamps below each message
    - Responsive max-width for readability

- **ChatInput Component** (`app/components/chat-input.tsx`)
  - Client component for message composition
  - Features:
    - Auto-resizing textarea (max 150px height)
    - Enter to send (Shift+Enter for new line)
    - Character limit (5000 chars)
    - Form reset after successful send
    - Loading states during submission
    - Toast notifications on error
    - Auto-focus for immediate typing
  - Form handling:
    - Uses `useFormState` for reactive state
    - Integrates with `sendMessage` server action
    - Hidden roomId field
    - Keyboard shortcuts for UX
    - Submit button with icon

**User Experience:**
- Real-time message delivery with instant updates
- Smooth scrolling and message grouping
- Clear visual distinction between sent/received messages
- Unread message tracking and indicators
- Fast search for starting new conversations
- Mobile-responsive design
- Loading skeletons and feedback
- Toast notifications for errors

**Database Integration:**
- Three core tables with proper foreign keys
- Cascading deletes for data integrity
- Timestamp tracking for all operations
- Soft delete support for messages
- RLS policies for security
- Efficient queries with proper indexes
- RPC functions for complex operations

**Security Features:**
- Row Level Security on all chat tables
- Server-side membership verification
- Authentication required for all operations
- Duplicate room prevention via triggers
- Only room members can access messages
- Server-side validation for all inputs
- SQL injection protection via parameterized queries

**Technical Stack:**
- Supabase Realtime for live messaging
- Postgres channels with postgres_changes events
- Next.js 16 Server Components for data fetching
- Client Components for interactivity
- Server Actions for mutations
- BetterAuth for session management
- Responsive Tailwind CSS
- Form-based architecture with progressive enhancement

#### Individual Post Page with Comments

**Complete post detail view with commenting system:**

- **Post Detail Page** (`app/r/[id]/post/[postId]/page.tsx`)
  - Async server component with dynamic routing
  - Features:
    - Two-column responsive layout (70% post / 30% sidebar)
    - Full post content display (text or image)
    - Voting functionality with user vote status
    - Comment creation and display
    - Share link with copy-to-clipboard
    - Community information sidebar
    - Author and timestamp metadata
    - Create Post button for authenticated users
  - Data fetching:
    - Single post with all related data
    - Joins with communities, users, votes, comments tables
    - Nested joins for comment authors
    - Vote count calculation
    - User vote status check
    - Uses `unstable_noStore` for fresh data
  - Content rendering:
    - TipTap JSON parsing for text posts
    - Extracts and formats paragraphs, headings, lists
    - Image display for image posts
    - Prose styling with proper whitespace
  - Left Column:
    - Post card with full content
    - Voting controls (up/down/count)
    - Action buttons (comments count, share)
    - Comment form (authenticated users only)
    - Comments list with avatars
    - Login prompt for unauthenticated users
  - Right Column:
    - About Community card
    - Community avatar (DiceBear)
    - Community description
    - Created date
    - Create Post button
    - Sticky positioning

- **Comment Creation Server Action** (`app/actions.ts`)
  - Added `createComment` server action for posting comments
  - Features:
    - BetterAuth session validation (redirects to login if not authenticated)
    - User profile lookup via `auth_user_id`
    - Post existence verification
    - Comment text validation (required, max 10,000 chars)
    - Inserts into `comments` table with proper foreign keys
    - Links to posts via `post_id` and users via `author_id`
    - Gets community slug for revalidation
    - Automatic cache revalidation of post page
    - Comprehensive error handling
  - Database operations:
    - Verifies post exists before allowing comment
    - Inserts comment with content, post_id, author_id
    - Returns success/error response for UI feedback

- **CommentForm Component** (`app/components/comment-form.tsx`)
  - Client component for comment submission
  - Features:
    - Textarea input with placeholder
    - Character limit display (max 10,000)
    - Form reset after successful submission
    - Toast notifications for success/error
    - Loading states during submission
    - Error display inline
    - Uses useFormState for reactive state
    - Hidden postId field
  - UX enhancements:
    - Automatic form reset on success
    - Success toast notification
    - Error toast with retry option
    - Submit button with loading state
    - Card border and background

- **CopyLink Component** (`app/components/copy-link.tsx`)
  - Client component for sharing posts
  - Features:
    - One-click copy to clipboard
    - Visual feedback with icon change
    - Toast notification on success
    - Copied state with auto-reset (2 seconds)
    - Error handling for clipboard API failures
    - Link icon → Check icon transition
    - Ghost button styling
  - Uses Clipboard API:
    - `navigator.clipboard.writeText()`
    - Graceful fallback on error
    - Success/error toast notifications

- **Loading Skeleton** (`app/r/[id]/post/[postId]/loading.tsx`)
  - Matches post page layout exactly
  - Features:
    - Two-column skeleton structure
    - Post card skeleton (metadata, title, content, actions)
    - Comment form skeleton
    - Comments list skeleton (3 cards)
    - Community sidebar skeleton
    - Shadcn UI Skeleton components
    - Animated loading states
    - Responsive design

**User Experience:**
- Full post content visibility with proper formatting
- Voting directly from post page
- Real-time comment posting with instant UI updates
- Share functionality for easy link copying
- Authentication-aware commenting (login prompt when needed)
- Loading skeletons prevent layout shift
- Community context always visible in sidebar
- Responsive design works on all screen sizes

**Database Integration:**
- Queries `posts` table with nested joins:
  - `communities` for community info
  - `users` for post author
  - `votes` for vote counts and user votes
  - `comments` with nested `users` for comment authors
- Inserts into `comments` table with proper foreign keys
- Comment schema:
  - `content`: Text content (max 10,000 chars)
  - `post_id`: Foreign key to posts
  - `author_id`: Foreign key to users
  - `created_at`: Timestamp
- Ordered by created_at ascending (oldest first)

**Security Features:**
- Server-side session validation for commenting
- Commenting requires authentication
- Post existence verification before comment creation
- Proper foreign key relationships
- User vote status checks
- All validation happens on server
- SQL injection protection via parameterized queries
- No sensitive data exposed to client

**Technical Implementation:**
- Next.js 16 Dynamic Routes with params
- Async server components for data fetching
- Server Actions for comment mutations
- Client components for interactivity (form, copy)
- Clipboard API for link sharing
- TipTap JSON parsing and rendering
- Responsive Tailwind CSS
- Lucide React icons
- DiceBear avatars for communities
- Full URL generation for sharing
- Cache revalidation with revalidatePath

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

