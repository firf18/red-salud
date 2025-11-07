# Project Structure

## Directory Organization

```
/app                    # Next.js App Router pages
  /api                  # API routes
  /auth                 # Authentication pages (login, register, callback)
  /dashboard            # Dashboard pages by role
  /public               # Public assets
  layout.tsx            # Root layout
  globals.css           # Global styles

/components             # React components
  /auth                 # Authentication forms
  /dashboard            # Dashboard-specific components
    /layout             # Dashboard layouts and modals
  /layout               # Shared layout components
  /providers            # Context providers
  /sections             # Landing page sections
  /ui                   # shadcn/ui components
  /video                # Video-related components

/lib                    # Utility libraries
  /supabase             # Supabase client and functions
    client.ts           # Browser client
    profile-functions.ts # Profile CRUD operations
  /validations          # Zod schemas
  animations.ts         # Framer Motion configs
  constants.ts          # App constants
  utils.ts              # Utility functions

/hooks                  # Custom React hooks
  use-patient-profile.ts

/scripts                # Utility scripts
  check-user-status.ts
  sync-user-roles.ts

/supabase               # Supabase configuration
  /migrations           # Database migrations

/public                 # Static assets
  /videos               # Video files
```

## Key Patterns

### Path Aliases

Use `@/` prefix for imports:
```typescript
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
```

### Component Structure

- Client components use `"use client"` directive
- Server components by default (no directive needed)
- Separate layout components for different roles

### Supabase Integration

- Browser client: `@/lib/supabase/client`
- Profile operations: `@/lib/supabase/profile-functions`
- All functions return `{ success: boolean, data?, error? }` pattern
- Activity logging for user actions

### Form Handling

- React Hook Form + Zod validation
- Schemas in `/lib/validations`
- Error messages in Spanish

### Authentication Flow

- OAuth and email/password supported
- Role-based routing (`/dashboard/{role}`)
- Rate limiting on login attempts (localStorage)
- Callback handling at `/auth/callback`

### Styling Conventions

- Tailwind utility classes
- shadcn/ui components with Radix UI primitives
- Framer Motion for page transitions and animations
- CSS variables for theming
