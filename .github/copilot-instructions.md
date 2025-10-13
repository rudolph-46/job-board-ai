# Job Board AI - Copilot Instructions

## Architecture Overview

This is a **dual-role job board platform** built with Next.js 15 (Turbopack), featuring:
- **Job seekers**: Browse listings, AI-powered search, apply with resumes
- **Employers**: Post jobs, manage applications, AI applicant ranking

### Tech Stack
- **Frontend**: Next.js 15 + React 19, TailwindCSS + shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM (type-safe, schema-first)
- **Authentication**: Clerk (with organizations for employers)
- **AI Services**: OpenAI via @inngest/agent-kit for job matching and applicant ranking
- **Background Jobs**: Inngest for async processing
- **File Upload**: UploadThing for resume management
- **Email**: Resend with React Email templates

## Feature-Based Architecture

Code is organized by **business domains** in `/src/features/`:
```
src/features/
├── jobListings/           # Core job CRUD + AI search
├── jobListingApplications/ # Application management + rating
├── organizations/         # Employer org management
└── users/                # User profiles + resume handling
```

Each feature follows the pattern: `actions/` (server actions) → `db/` (database layer) → `components/` (UI)

## Critical Patterns

### 1. Database & Caching
- **Schema location**: `src/drizzle/schema/` (one file per entity)
- **Cache invalidation**: Each feature has `db/cache/` with revalidation helpers
- **Query caching**: Use `"use cache"` + `cacheTag()` for server-side caching
- **Environment**: Database URL constructed from individual env vars in `src/data/env/server.ts`

### 2. Authentication & Authorization
- **Current user**: `getCurrentUser()` and `getCurrentOrganization()` from clerk services
- **Permissions**: `hasOrgUserPermission()` checks Clerk-based permissions
- **Route protection**: Two main layouts - `(job-seeker)` and `employer`
- **Plan features**: `hasPlanFeature()` for subscription-based access control

### 3. AI Integration
- **Job search**: `getMatchingJobListings` agent in `services/inngest/ai/`
- **Application ranking**: Uses OpenAI to score applicants based on job requirements
- **Important**: AI responses need URL encoding cleanup (remove quotes, handle arrays)

### 4. Forms & Actions
- **Server actions**: All in `features/*/actions/actions.ts` with zod validation
- **UI pattern**: `ActionButton` component handles loading states + error toasts
- **Return format**: `{ error: boolean; message?: string }` for consistent handling

## Development Workflows

### Database
```bash
npm run db:push        # Push schema changes
npm run db:generate    # Generate migrations
npm run db:studio     # Open Drizzle Studio
npm run db:seed       # Seed with test data
npm run db:reset      # Reset + reseed
```

### Services
```bash
npm run dev           # Next.js with Turbopack
npm run inngest       # Background job dashboard
npm run email         # Email preview server
```

### Testing Upload
- Test page: `/test-upload` (bypasses auth)
- Real upload: `/user-settings/resume` (requires Clerk auth)
- **Issue pattern**: User must exist in local DB before resume upload (auto-created via `ensureUserExists`)

## Key Integration Points

### File Upload Flow
1. `UploadDropzone` → UploadThing API → `customFileRouter`
2. Router creates user if missing via Clerk API
3. Saves file metadata to `user_resumes` table
4. Triggers Inngest job for AI resume summary

### AI Search Flow  
1. User query → `getAiJobListingSearchResults` action
2. OpenAI agent processes with job schema context
3. Returns job IDs → URL with `jobIds` param
4. **Critical**: Clean URL params (remove quotes, handle comma-separated IDs)

### Application Management
1. Applications stored with ratings (1-5 stars)
2. `ApplicationTable` component with sortable columns
3. Employer can view resumes + cover letters in modals
4. AI ranking considers job requirements + applicant profile

## Common Gotchas

- **Environment**: Use `env` from `@/data/env/server` - constructs DATABASE_URL automatically
- **Cache tags**: Always revalidate related caches in DB operations
- **Clerk users**: Must sync to local DB for foreign key relationships  
- **AI responses**: Strip quotes and validate array parsing for job IDs
- **File uploads**: Requires both Clerk auth AND user record in local DB
- **Permissions**: Check both Clerk permissions AND plan features for job posting limits

## Component Conventions

- **UI components**: `src/components/ui/` (shadcn-style, use `data-slot` attributes)
- **Feature components**: `src/features/*/components/` (business logic)
- **Shared**: `src/components/` (cross-feature reusables like `ActionButton`, `DataTable`)
- **Naming**: Client components prefixed with `_` when paired with server component

## Database Schema Notes

- **Primary keys**: UUIDs for job listings, varchar for Clerk user IDs
- **Enums**: Defined in schema files, used for consistent dropdowns
- **Relations**: Drizzle relations defined separately from table schema
- **Foreign keys**: Always include `onDelete: "cascade"` for cleanup
