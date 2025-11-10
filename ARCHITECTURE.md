# 10xR Community Platform - Architecture Documentation

This document provides a comprehensive overview of the 10xR Community Platform architecture, design decisions, and implementation details.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Data Flow](#data-flow)
6. [Authentication & Authorization](#authentication--authorization)
7. [Database Design](#database-design)
8. [API Design](#api-design)
9. [Security Architecture](#security-architecture)
10. [Scalability & Performance](#scalability--performance)

---

## Overview

### Project Vision

10xR Community Platform is a **web-first social healthcare platform** that combines community-driven discussions with healthcare innovation. We're building a full-featured web application first, and will later expose selected APIs for mobile app integration.

### Core Philosophy

- 🌐 **Web-First** - Build a complete, production-ready web platform
- 📱 **Mobile-Ready** - Design APIs for future Flutter app integration
- 🔒 **Security-First** - Healthcare data requires enterprise-grade security
- ⚡ **Performance-First** - Sub-second response times for all operations
- 🎯 **User-First** - Intuitive UX inspired by Reddit and Facebook

---

## Architecture Principles

### 1. Web-First Development

**Why Web-First?**

- Faster iteration and deployment (no app store delays)
- Broader reach (accessible from any device)
- SEO benefits for content discovery
- Easier testing and debugging
- Single codebase for full feature set

**Mobile Integration Plan:**

```
Phase 1 (Current): Build Web Platform
    │
    ├── Full-featured web application
    ├── Responsive design
    └── PWA capabilities
    │
Phase 2: API Stabilization
    │
    ├── Document API surface
    ├── Version API endpoints
    └── Performance optimization
    │
Phase 3: Mobile App
    │
    ├── Flutter mobile app
    ├── Consume web APIs
    └── Feature parity
```

### 2. Serverless Architecture

We use Next.js with Supabase, which provides:

- **Automatic scaling** - Handle traffic spikes automatically
- **Global distribution** - Edge deployment for low latency
- **Pay-per-use** - Cost-effective for varying loads
- **Zero DevOps** - Focus on features, not infrastructure

### 3. Type Safety End-to-End

- **TypeScript** - Type-safe JavaScript
- **Zod** - Runtime validation
- **Supabase Types** - Generated database types
- **tRPC** - Type-safe API layer

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────────────┐         ┌─────────────────────────┐ │
│  │   Web Browser      │         │   Future: Flutter App   │ │
│  │   - React 18       │         │   - Native Mobile UI    │ │
│  │   - Next.js 16     │         │   - API Consumer        │ │
│  └────────┬───────────┘         └──────────┬──────────────┘ │
└───────────┼────────────────────────────────┼────────────────┘
            │                                │
            ▼                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │             Next.js Application (Vercel)              │   │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │   │
│  │  │  App Router    │  │    API Routes            │   │   │
│  │  │  - SSR/SSG     │  │    - /api/auth/*         │   │   │
│  │  │  - React RSC   │  │    - /api/posts/*        │   │   │
│  │  │  - Streaming   │  │    - /api/users/*        │   │   │
│  │  └────────────────┘  └──────────────────────────┘   │   │
│  │  ┌────────────────┐  ┌──────────────────────────┐   │   │
│  │  │  BetterAuth    │  │    tRPC Layer            │   │   │
│  │  │  - Auth logic  │  │    - Type-safe API       │   │   │
│  │  │  - Sessions    │  │    - React Query         │   │   │
│  │  └────────────────┘  └──────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────┼──────────────────────┼───────────────────────┘
              │                      │
              ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────┐
│    Supabase Backend      │  │    Redis (BullMQ)   │
│  ┌────────────────────┐  │  │  - Job queues       │
│  │  PostgreSQL DB     │  │  │  - Background jobs  │
│  │  - User data       │  │  │  - Notifications    │
│  │  - Content         │  │  └──────────────────────┘
│  │  - Real-time       │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Authentication    │  │
│  │  - Email/Password  │  │
│  │  - OAuth           │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Storage           │  │
│  │  - Images          │  │
│  │  - Documents       │  │
│  └────────────────────┘  │
│  ┌────────────────────┐  │
│  │  Realtime          │  │
│  │  - WebSockets      │  │
│  │  - Subscriptions   │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### Component Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Pages     │  │  Components │  │   Layouts   │    │
│  │  - Routes   │  │  - UI       │  │  - Shell    │    │
│  │  - Views    │  │  - Forms    │  │  - Nav      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Services   │  │   Hooks     │  │   Utils     │    │
│  │  - Auth     │  │  - State    │  │  - Helpers  │    │
│  │  - Posts    │  │  - Data     │  │  - Format   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└───────────────────────┼─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                      DATA ACCESS                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Supabase   │  │    tRPC     │  │   Cache     │    │
│  │  - Client   │  │  - Router   │  │  - React Q  │    │
│  │  - Server   │  │  - Types    │  │  - SWR      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.1 | React framework with App Router |
| **React** | 18.0 | UI library with Server Components |
| **TypeScript** | 5.8.3 | Type-safe JavaScript |
| **Tailwind CSS** | 4.1.5 | Utility-first styling |
| **shadcn/ui** | Latest | Accessible component library |
| **Radix UI** | Various | Headless UI primitives |
| **React Hook Form** | 7.65.0 | Form state management |
| **Zod** | 3.24.4 | Schema validation |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Supabase** | Latest | Backend-as-a-Service |
| **PostgreSQL** | 15 | Relational database |
| **BetterAuth** | 1.3.34 | Authentication framework |
| **tRPC** | 11.7.1 | Type-safe API layer |
| **BullMQ** | 5.63.0 | Job queue system |
| **Redis** | Latest | Caching and job queues |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Vercel** | Hosting and deployment |
| **Supabase Cloud** | Database and backend services |
| **Upstash/Redis Cloud** | Redis hosting |
| **GitHub Actions** | CI/CD pipelines |

---

## Data Flow

### Read Operation (Example: Fetch User Feed)

```
1. User Request
   │
   ├─→ Browser makes request to /feed
   │
2. Next.js Server
   │
   ├─→ Server Component renders
   │   ├─→ Creates Supabase server client
   │   ├─→ Checks authentication session
   │   └─→ Queries database via RLS
   │
3. Supabase
   │
   ├─→ Validates JWT token
   ├─→ Applies Row Level Security
   ├─→ Executes query
   └─→ Returns data
   │
4. Response
   │
   ├─→ Server Component hydrates with data
   ├─→ Sends HTML to browser
   └─→ Client hydrates React components
```

### Write Operation (Example: Create Post)

```
1. User Action
   │
   ├─→ User submits post form
   │
2. Client Validation
   │
   ├─→ React Hook Form validates
   ├─→ Zod schema checks input
   │
3. API Request
   │
   ├─→ POST /api/posts
   ├─→ Includes session cookie
   │
4. Server Processing
   │
   ├─→ BetterAuth verifies session
   ├─→ Validates input again (server-side)
   ├─→ Creates Supabase server client
   ├─→ Inserts record
   │
5. Supabase
   │
   ├─→ Validates JWT
   ├─→ Checks RLS policies
   ├─→ Inserts data
   ├─→ Triggers realtime event
   │
6. Response
   │
   ├─→ Returns success/error
   ├─→ Client updates UI
   └─→ Realtime subscribers notified
```

---

## Authentication & Authorization

### Authentication Flow

```
┌─────────────────┐
│   User Action   │
│  (Login/SignUp) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│     BetterAuth Client       │
│  - Validates input          │
│  - Sends credentials        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   BetterAuth Server API     │
│  - /api/auth/[...all]       │
│  - Validates credentials    │
│  - Creates session          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│      Supabase Database      │
│  - Stores user record       │
│  - Stores session record    │
│  - Issues JWT token         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│        Set Cookie           │
│  - HttpOnly                 │
│  - Secure (production)      │
│  - SameSite=Lax             │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│    User Authenticated       │
│  - Session valid            │
│  - JWT in cookie            │
└─────────────────────────────┘
```

### Authorization Model

**Row Level Security (RLS) Policies:**

```sql
-- Users can only read their own data
CREATE POLICY "Users can view own profile"
    ON public.user
    FOR SELECT
    USING (auth.uid()::TEXT = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
    ON public.user
    FOR UPDATE
    USING (auth.uid()::TEXT = id);

-- Public profiles are readable by all
CREATE POLICY "Profiles are publicly readable"
    ON public.profiles
    FOR SELECT
    USING (true);
```

**Service Role Access:**

```sql
-- Service role bypasses RLS for admin operations
CREATE POLICY "Service role full access"
    ON public.user
    FOR ALL
    USING (auth.role() = 'service_role');
```

---

## Database Design

### Schema Overview

```
┌─────────────────────────────────────────────────────┐
│              AUTHENTICATION SCHEMA                   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  user                        account                │
│  ├── id (PK)                 ├── id (PK)           │
│  ├── email (unique)          ├── user_id (FK)      │
│  ├── name                    ├── provider_id       │
│  ├── email_verified          ├── account_id        │
│  ├── image                   └── tokens...         │
│  ├── role                                          │
│  └── timestamps              session               │
│                              ├── id (PK)           │
│                              ├── user_id (FK)      │
│                              ├── token (unique)    │
│                              └── expires_at        │
│                                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              COMMUNITY SCHEMA                        │
├─────────────────────────────────────────────────────┤
│                                                      │
│  profiles                    posts (future)         │
│  ├── id (PK)                 ├── id (PK)           │
│  ├── user_id (FK unique)     ├── author_id (FK)    │
│  ├── username (unique)       ├── title             │
│  ├── bio                     ├── content           │
│  ├── avatar_url              └── timestamps        │
│  ├── social_links                                  │
│  └── timestamps              comments (future)     │
│                              ├── id (PK)           │
│                              ├── post_id (FK)      │
│                              ├── author_id (FK)    │
│                              └── content           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **Separate Auth and Community Data**
    - Auth tables handle authentication
    - Community tables handle features
    - Clear separation of concerns

2. **Automatic Profile Creation**
    - Trigger creates profile on user signup
    - Ensures every user has a profile
    - Reduces manual setup

3. **UUID Primary Keys**
    - Using text UUIDs for compatibility
    - BetterAuth uses text IDs
    - Easy to work with across systems

4. **Timestamps Everywhere**
    - `created_at` and `updated_at` on all tables
    - Automatic updates via triggers
    - Essential for auditing

---

## API Design

### RESTful API Structure

```
/api/
├── auth/              # Authentication (BetterAuth)
│   ├── [...all]       # Catch-all auth handler
│   └── session        # Session management
│
├── users/             # User operations (future)
│   ├── [id]          # Get/update user
│   └── me            # Current user
│
├── posts/             # Post operations (future)
│   ├── [id]          # CRUD operations
│   └── feed          # Get user feed
│
└── health             # Health check
```

### tRPC API Structure (Future)

```typescript
// lib/trpc/router.ts
export const appRouter = router({
  user: userRouter,      // User operations
  post: postRouter,      // Post operations
  comment: commentRouter,// Comment operations
  // ... more routers
});
```

### API Versioning Strategy

```
Current:  /api/...           # v1 (implicit)
Future:   /api/v2/...        # v2 (explicit)
Mobile:   /api/mobile/v1/... # Mobile-specific
```

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────┐
│     1. Network Security                  │
│     - HTTPS/TLS 1.3                     │
│     - DDoS protection (Vercel)          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     2. Application Security              │
│     - Input validation (Zod)            │
│     - CSRF protection                   │
│     - XSS prevention (React)            │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     3. Authentication                    │
│     - JWT tokens                        │
│     - Secure cookies                    │
│     - Session management                │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     4. Authorization                     │
│     - Row Level Security                │
│     - Role-based access                 │
│     - Resource ownership                │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│     5. Data Security                     │
│     - Encryption at rest                │
│     - Encrypted connections             │
│     - Secure backups                    │
└─────────────────────────────────────────┘
```

### Security Best Practices

✅ **Implemented:**
- Row Level Security on all tables
- Secure HTTP-only cookies
- CSRF protection via Next.js
- Input validation with Zod
- SQL injection protection (parameterized queries)
- XSS protection (React escaping)
- Rate limiting (configurable)

🔄 **In Progress:**
- Audit logging
- Intrusion detection
- Security headers
- Content Security Policy

📋 **Planned:**
- HIPAA compliance certification
- Regular security audits
- Penetration testing
- Bug bounty program

---

## Scalability & Performance

### Horizontal Scaling

```
┌────────────────────────────────────────────┐
│         Load Balancer (Vercel)             │
└────────┬───────────┬───────────┬───────────┘
         │           │           │
         ▼           ▼           ▼
   ┌─────────┐ ┌─────────┐ ┌─────────┐
   │ Edge 1  │ │ Edge 2  │ │ Edge N  │
   │ US-East │ │ EU-West │ │ Asia    │
   └────┬────┘ └────┬────┘ └────┬────┘
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Supabase (Global)   │
         │   - Multi-region      │
         │   - Read replicas     │
         └──────────────────────┘
```

### Performance Optimizations

1. **Edge Rendering**
    - Next.js deployed to Vercel Edge
    - Server Components reduce JS bundle
    - Streaming for faster TTFB

2. **Database Optimization**
    - Indexes on frequently queried columns
    - Connection pooling
    - Query optimization

3. **Caching Strategy**
    - React Query for client-side cache
    - Supabase connection caching
    - Static page generation (ISR)

4. **Asset Optimization**
    - Image optimization (next/image)
    - Code splitting
    - Tree shaking
    - Font optimization

---

## Monitoring & Observability

### Monitoring Stack

```
┌──────────────────────────────────────────┐
│        Application Metrics                │
│  - Response times                         │
│  - Error rates                            │
│  - User sessions                          │
└────────┬─────────────────────────────────┘
         │
         ├─→ OpenTelemetry ─→ Vercel Analytics
         │
         ├─→ PostHog ────────→ Product Analytics
         │
         └─→ Supabase ───────→ Database Metrics
```

### Key Metrics

**Application Health:**
- API response times (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Cache hit rates

**User Experience:**
- Core Web Vitals (LCP, FID, CLS)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Bounce rates

**Business Metrics:**
- Daily/Monthly Active Users
- User engagement
- Feature adoption
- Conversion rates

---

## Future Enhancements

### Short-term (3-6 months)

- [ ] Complete core community features
- [ ] Implement real-time notifications
- [ ] Add content moderation tools
- [ ] Healthcare-specific features
- [ ] Mobile responsive optimization

### Medium-term (6-12 months)

- [ ] Document and stabilize API
- [ ] Performance optimization
- [ ] Advanced search functionality
- [ ] Analytics dashboard
- [ ] Admin panel

### Long-term (12+ months)

- [ ] Flutter mobile app
- [ ] AI-powered features
- [ ] Healthcare provider tools
- [ ] Telehealth integration
- [ ] Global expansion

---

## Conclusion

This architecture provides a solid foundation for building a scalable, secure, and performant healthcare community platform. The web-first approach allows rapid iteration while maintaining the flexibility to add mobile support when the platform matures.

**Key Strengths:**
- ✅ Modern, scalable architecture
- ✅ Type-safe end-to-end
- ✅ Security-first design
- ✅ Performance optimized
- ✅ Developer-friendly

**Contact:** For architecture questions, reach out to the engineering team.

---

**Last Updated:** November 11, 2024  
**Document Version:** 1.0  
**Architecture Version:** 1.0