# Technology Stack

## Framework & Runtime

- **Next.js 16** (App Router)
- **React 19.2**
- **TypeScript 5**
- **Node.js** (ES2017 target)

## Backend & Database

- **Supabase** for authentication, database, and storage
  - `@supabase/supabase-js` - Main client library
  - `@supabase/ssr` - Server-side rendering support
  - `@supabase/auth-helpers-nextjs` - Auth helpers

## UI & Styling

- **Tailwind CSS 4** with PostCSS
- **shadcn/ui** components (New York style)
- **Radix UI** primitives for accessible components
- **Framer Motion** for animations
- **Lucide React** for icons

## Forms & Validation

- **React Hook Form** for form management
- **Zod** for schema validation
- **@hookform/resolvers** for integration

## Utilities

- **clsx** and **tailwind-merge** for className management
- **class-variance-authority** for component variants

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

Required variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
