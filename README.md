# 10xR Healthcare Platform Backend

> **Enterprise-grade Next.js backend powering AI-driven healthcare delivery for both web and mobile applications**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.3-green)](https://www.better-auth.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)](https://www.docker.com/)

---

## 🏥 About 10xR

**10xR** is revolutionizing healthcare technology by creating an intelligent backend platform that powers both web-based administration and Flutter mobile applications. Our mission is to make healthcare technology more accessible, secure, and efficient through:

- **Unified Backend Architecture**: Single Next.js platform serving web admin panels and mobile APIs
- **Edge ML Integration**: Supporting Flutter apps with on-device ML capabilities for privacy-first healthcare
- **Real-Time Processing**: Instant data synchronization between mobile apps and web dashboards
- **Healthcare Compliance**: HIPAA-ready infrastructure with comprehensive security controls
- **Scalable Infrastructure**: Built to handle hospital-scale deployments with Docker-based orchestration

### Core Mission

We believe healthcare technology should:
- 🔒 **Prioritize Privacy** - Patient data processed on-device when possible
- ⚡ **Be Fast** - Sub-second response times for clinical workflows
- 🌐 **Be Accessible** - Work seamlessly across web and mobile platforms
- 🛡️ **Be Secure** - Enterprise-grade security with audit logging
- 📊 **Be Insightful** - Real-time analytics for healthcare providers

---

## 🎯 Platform Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────┐
│                  10xR Backend Platform                    │
│                    (Next.js 16)                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────┐         ┌─────────────────┐        │
│  │  Web Admin UI   │         │   REST APIs     │        │
│  │  - Dashboard    │         │   - /api/auth   │        │
│  │  - Analytics    │         │   - /api/data   │        │
│  │  - Management   │         │   - /api/sync   │        │
│  └─────────────────┘         └─────────────────┘        │
│                                                           │
└──────────────────────────────────────────────────────────┘
           │                              │
           │                              │
           ▼                              ▼
    ┌─────────────┐              ┌──────────────┐
    │ PostgreSQL  │              │ Flutter App  │
    │  Database   │              │   (Mobile)   │
    │             │◄─────────────│ Edge ML/AI   │
    └─────────────┘              └──────────────┘
           │
           │
           ▼
    ┌─────────────┐
    │   Redis     │
    │ Job Queues  │
    └─────────────┘
```

### Key Capabilities

1. **Authentication & Authorization**
    - User authentication (email/password + social OAuth)
    - Super admin access controls
    - Role-based permissions
    - Session management

2. **Data Management**
    - Type-safe database operations
    - Real-time data sync
    - Transaction support
    - Data validation

3. **Background Processing**
    - Job queues for async tasks
    - Scheduled jobs
    - Notification delivery
    - Callback handling

4. **Mobile API Layer**
    - RESTful endpoints for Flutter
    - Synchronous authentication
    - Optimized data payloads
    - Offline support ready

---

## 🛠 Technology Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16.0.1 | React framework with App Router |
| [React](https://react.dev/) | 18.0 | UI library with Server Components |
| [TypeScript](https://www.typescriptlang.org/) | 5.8.3 | Type-safe development |
| [Node.js](https://nodejs.org/) | ≥20.0.0 | JavaScript runtime |

### Authentication & Security
| Technology | Version | Purpose |
|------------|---------|---------|
| [Better Auth](https://www.better-auth.com/) | 1.3.34 | Modern authentication |
| [Drizzle ORM](https://orm.drizzle.team/) | 0.44.7 | Type-safe database ORM |
| [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) | 0.31.6 | Database migrations |
| [PostgreSQL](https://www.postgresql.org/) | Latest | Primary database |
| [Zod](https://zod.dev/) | 3.24.4 | Runtime validation |

### Background Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| [BullMQ](https://docs.bullmq.io/) | 5.63.0 | Job queue management |
| [IORedis](https://github.com/luin/ioredis) | 5.8.2 | Redis client |
| [Redis](https://redis.io/) | Latest | Caching & queues |

### API & Type Safety
| Technology | Version | Purpose |
|------------|---------|---------|
| [tRPC](https://trpc.io/) | 11.7.1 | Type-safe APIs |
| [React Hook Form](https://react-hook-form.com/) | 7.65.0 | Form handling |
| [@hookform/resolvers](https://github.com/react-hook-form/resolvers) | 5.2.2 | Form validation |

### UI Components
| Technology | Version | Purpose |
|------------|---------|---------|
| [Tailwind CSS](https://tailwindcss.com/) | 4.1.5 | Utility-first styling |
| [Radix UI](https://www.radix-ui.com/) | Various | Headless components |
| [shadcn/ui](https://ui.shadcn.com/) | Integrated | Component library |
| [Lucide React](https://lucide.dev/) | 0.552.0 | Icon library |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.6 | Theme management |

### Data Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| [Recharts](https://recharts.org/) | 2.15.4 | Charts & graphs |
| [React Day Picker](https://react-day-picker.js.org/) | 9.11.1 | Date picker |
| [Embla Carousel](https://www.embla-carousel.com/) | 8.6.0 | Carousel component |
| [React Resizable Panels](https://github.com/bvaughn/react-resizable-panels) | 3.0.6 | Resizable layouts |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| [ESLint](https://eslint.org/) | 9.26.0 | Code linting |
| [Prettier](https://prettier.io/) | 3.0.3 | Code formatting |
| [Vitest](https://vitest.dev/) | 3.2.4 | Unit testing |
| [Playwright](https://playwright.dev/) | 1.52.0 | E2E testing |
| [Storybook](https://storybook.js.org/) | 8.6.12 | Component dev |

### Observability & Analytics
| Technology | Version | Purpose |
|------------|---------|---------|
| [OpenTelemetry](https://opentelemetry.io/) | Various | Distributed tracing |
| [Vercel OTel](https://vercel.com/docs/observability) | 1.12.0 | Performance monitoring |
| [PostHog Node](https://posthog.com/) | 5.11.0 | Analytics & feature flags |

### Additional Libraries
| Technology | Version | Purpose |
|------------|---------|---------|
| [date-fns](https://date-fns.org/) | 4.1.0 | Date utilities |
| [lodash](https://lodash.com/) | 4.17.21 | Utility functions |
| [clsx](https://github.com/lukeed/clsx) | 2.1.1 | Class name utility |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | 2.6.0 | Tailwind class merging |
| [class-variance-authority](http://cva.style/) | 0.7.1 | Component variants |
| [cmdk](https://cmdk.paco.me/) | 1.1.1 | Command menu |
| [sonner](https://sonner.emilkowal.ski/) | 2.0.7 | Toast notifications |
| [vaul](https://vaul.emilkowal.ski/) | 1.1.2 | Drawer component |
| [input-otp](https://input-otp.rodz.dev/) | 1.4.2 | OTP input |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 20.0.0 ([Download](https://nodejs.org/))
- **pnpm** 10.0.0 (Package manager)
  ```bash
  npm install -g pnpm@10.0.0
  ```
- **Docker** (for local database) ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd ten-xr-mobile-backend
```

#### 2. Install Dependencies

```bash
pnpm install
```

This will install all required packages as defined in `package.json`.

#### 3. Start Infrastructure Services

For local development, start PostgreSQL and Redis using Docker:

```bash
# Create docker-compose.yml or use existing infrastructure
docker-compose up -d postgres redis
```

**Note**: In production, environment variables are injected by infrastructure (Kubernetes, AWS, etc.), so no `.env` files are needed.

#### 4. Configure Environment (Local Development Only)

For local development, create a `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/tenxr_db

# Redis
REDIS_URL=redis://localhost:6379

# Better Auth
BETTER_AUTH_SECRET=your-local-secret-here
BETTER_AUTH_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

#### 5. Database Setup

```bash
# Generate database schema
pnpm db:generate

# Run migrations
pnpm db:migrate

# Generate Better Auth tables
pnpm auth:generate
pnpm db:migrate
```

#### 6. Start Development Server

```bash
pnpm dev
```

The application will be available at: **http://localhost:3000**

### Verify Installation

- **Homepage**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Database Studio**: `pnpm db:studio` → http://localhost:4983

---

## 📁 Project Structure

```
ten-xr-mobile-backend/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── health/              # Health check
│   │   └── [features]/          # Feature-specific APIs
│   ├── (dashboard)/             # Admin dashboard routes
│   └── layout.tsx               # Root layout
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   ├── forms/                   # Form components
│   └── [feature-components]/   # Feature-specific components
│
├── lib/                         # Core libraries
│   ├── auth/                    # Authentication
│   │   ├── auth.ts             # Better Auth server config
│   │   └── auth-client.ts      # Client-side auth
│   ├── db/                      # Database
│   │   ├── schema.ts           # Drizzle schema
│   │   └── index.ts            # DB connection
│   ├── queues/                  # Background jobs
│   ├── services/                # Business logic
│   └── utils/                   # Utility functions
│
├── public/                      # Static assets
├── scripts/                     # Build & deployment scripts
│   └── entrypoint.sh           # Docker entrypoint
│
├── drizzle/                     # Database migrations (generated)
├── .storybook/                  # Storybook configuration
├── e2e/                         # Playwright E2E tests
│
├── Dockerfile                   # Production Docker image
├── docker-compose.yml           # Local development services
├── drizzle.config.ts           # Drizzle ORM configuration
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
# Generate migration files from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema directly (dev only - skips migrations)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Generate Better Auth database schema
pnpm auth:generate
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

# Run E2E tests (Playwright) - headless
pnpm e2e:headless

# Run E2E tests with UI
pnpm e2e:ui
```

### Storybook (Component Development)

```bash
# Start Storybook development server
pnpm storybook

# Build Storybook for production
pnpm build-storybook

# Test Storybook components
pnpm test-storybook
```

### Production

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Analyze bundle size
pnpm analyze

# Generate component coupling graph
pnpm coupling-graph
```

### Maintenance

```bash
# Apply patches to dependencies
pnpm postinstall
```

---

## 🐳 Docker Deployment

### Building the Production Image

The application uses a multi-stage Docker build optimized for production:

```bash
# Build the Docker image
docker build -t 10xr-backend:latest .

# Build with specific tag
docker build -t 10xr-backend:v1.0.0 .
```

### Running the Container

**Environment variables are injected by infrastructure** (Kubernetes, AWS ECS, etc.):

```bash
# Run container with environment variables from infrastructure
docker run -p 3000:3000 \
  -e DATABASE_URL=$DATABASE_URL \
  -e REDIS_URL=$REDIS_URL \
  -e BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET \
  -e BETTER_AUTH_URL=$BETTER_AUTH_URL \
  10xr-backend:latest
```

### Docker Image Details

The Dockerfile includes:

- **Base**: Node.js 22 slim (Debian-based)
- **Build Tools**: Python, LibreOffice, ImageMagick, GraphicsMagick
- **Document Processing**: poppler-utils, ghostscript, tesseract
- **Fonts**: DejaVu, Liberation fonts for document rendering
- **Security**: Runs as non-root user (`nextjs:nodejs`)
- **Health Check**: Built-in health check endpoint
- **Optimizations**: Multi-stage build, layer caching

### Health Check

The application exposes a health endpoint:

```bash
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-11-01T12:00:00.000Z"
}
```

Docker will automatically monitor this endpoint as configured in the `HEALTHCHECK` directive.

---

## 🚢 Deployment

### Infrastructure Requirements

- **Container Orchestration**: Kubernetes, AWS ECS, or Docker Swarm
- **Database**: PostgreSQL 14+ (managed service recommended)
- **Cache/Queue**: Redis 6+ (managed service recommended)
- **File Storage**: Object storage (S3, Azure Blob, GCS)
- **Load Balancer**: ALB, Nginx, or similar
- **SSL/TLS**: Certificate management (Let's Encrypt, ACM)

### Environment Variables (Injected by Infrastructure)

Required environment variables for production:

```bash
# Core Application
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Redis
REDIS_URL=redis://host:6379

# Authentication
BETTER_AUTH_SECRET=<secure-secret-key>
BETTER_AUTH_URL=https://your-domain.com

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: Resource Limits
NODE_OPTIONS=--max-old-space-size=4096

# Optional: Timezone
TZ=UTC
LANG=en_US.UTF-8
```

### Deployment Steps

1. **Build Docker Image**
   ```bash
   docker build -t 10xr-backend:v1.0.0 .
   ```

2. **Push to Container Registry**
   ```bash
   docker tag 10xr-backend:v1.0.0 your-registry/10xr-backend:v1.0.0
   docker push your-registry/10xr-backend:v1.0.0
   ```

3. **Deploy to Infrastructure**
    - Update Kubernetes deployment manifest
    - Apply configuration with `kubectl apply`
    - Or use CI/CD pipeline (GitHub Actions, GitLab CI, etc.)

4. **Run Database Migrations**
   ```bash
   # Run migrations as init container or manual job
   kubectl exec -it <pod-name> -- pnpm db:migrate
   ```

5. **Verify Deployment**
   ```bash
   curl https://your-domain.com/api/health
   ```

### Scaling Considerations

- **Horizontal Scaling**: Run multiple container instances behind load balancer
- **Database**: Use connection pooling (configured in Drizzle)
- **Redis**: Consider Redis Cluster for high availability
- **Session Storage**: Redis-backed sessions work across instances
- **File Uploads**: Use shared object storage (S3/Azure Blob)

---

## 🔐 Security Features

### Built-in Security

- **Non-root Container**: Application runs as `nextjs` user (UID 1001)
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Protection**: Drizzle ORM with parameterized queries
- **XSS Protection**: React's built-in escaping
- **CSRF Protection**: Better Auth session management
- **Rate Limiting**: Configurable via middleware
- **Secure Headers**: Security headers configured in Next.js
- **Audit Logging**: Track all authentication events

### HIPAA Compliance Considerations

For healthcare deployments:

- Encrypt data at rest (database encryption)
- Encrypt data in transit (TLS 1.3)
- Implement comprehensive audit logging
- Regular security updates
- Access control and authentication
- Data backup and disaster recovery

---

## 📊 Monitoring & Observability

### Built-in Monitoring

- **OpenTelemetry Integration**: Distributed tracing
- **Health Check Endpoint**: `/api/health`
- **Performance Metrics**: Via Vercel OTel
- **Error Tracking**: OpenTelemetry traces
- **Analytics**: PostHog integration

### Recommended Monitoring Stack

- **APM**: DataDog, New Relic, or Dynatrace
- **Logging**: ELK Stack, Loki, or CloudWatch
- **Metrics**: Prometheus + Grafana
- **Alerting**: PagerDuty, Opsgenie

---

## 🧪 Testing

### Test Coverage

- **Unit Tests**: Vitest for component and utility testing
- **Integration Tests**: API route testing
- **E2E Tests**: Playwright for full user flows
- **Component Tests**: Storybook for UI component testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm e2e:headless

# Run Storybook tests
pnpm test-storybook
```

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

---

## 📄 License

Proprietary - © 2025 10xR. All rights reserved.

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
- [Better Auth](https://www.better-auth.com/) by Better Auth Team
- [Drizzle ORM](https://orm.drizzle.team/) by Drizzle Team
- [shadcn/ui](https://ui.shadcn.com/) by shadcn
- Based on [next-enterprise](https://github.com/Blazity/next-enterprise) by Blazity

---

**10xR** - Transforming Healthcare Through Technology 🏥