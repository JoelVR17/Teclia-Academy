# Prisma Migration Guide

This guide explains how to run the Teclia Academy backend with Prisma ORM against Supabase PostgreSQL.

## Overview

- **Database access**: Prisma Client (`Backend/utils/prismaClient.js`) with `@prisma/adapter-pg`
- **CLI config**: `Backend/prisma.config.js` (connection URL for Migrate/Studio)
- **Schema**: `Backend/prisma/schema.prisma`
- **Migrations**: `Backend/prisma/migrations/`
- **Seed**: `Backend/prisma/seed.js`
- **File uploads**: Supabase Storage (unchanged — `@supabase/supabase-js` in `Backend/storage/`)

## Prerequisites

- Node.js 18+
- A Supabase project (free tier works)
- `DATABASE_URL` from Supabase → Project Settings → Database → Connection string (URI)

## First-time setup

```bash
cd Backend
cp ../.env.example .env
# Edit .env and set DATABASE_URL, JWT_SECRET, and storage vars
npm install
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

## Running migrations

### New database (empty Supabase project)

```bash
cd Backend
npm run prisma:deploy
npm run prisma:seed
```

### Existing database (tables already created by legacy setup)

If your Supabase database already has `users`, `content`, and `site_stats` tables matching the current schema:

1. Compare your live schema with `Backend/prisma/migrations/20250619000000_init/migration.sql`
2. If they match, mark the migration as applied without re-running DDL:

```bash
cd Backend
npx prisma migrate resolve --applied 20250619000000_init
```

3. Run seed only if needed:

```bash
npm run prisma:seed
```

> **Warning:** Do not run destructive migrations against production without a backup.

## Local development workflow

```bash
cd Backend
npm run dev
```

The server connects via Prisma on startup (`Backend/db/init.js` → `connectDb()`).

### Create a new migration (schema change)

```bash
cd Backend
npm run prisma:migrate
# Follow prompts to name the migration
```

### Inspect data

```bash
cd Backend
npm run prisma:studio
```

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Supabase PostgreSQL connection string for Prisma |
| `TEST_DATABASE_URL` | Recommended | Separate DB for Jest tests |
| `JWT_SECRET` | Yes | Auth token signing |
| `SUPABASE_URL` | For storage | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | For storage | Service role key for uploads |
| `SUPABASE_BUCKET` | Optional | Storage bucket name (default: `uploads`) |
| `LOCAL_UPLOADS` | Optional | Set `true` to use local filesystem instead of Supabase Storage |

Prisma reads `DATABASE_URL` from `Backend/.env` (loaded via `dotenv`).

## Supabase connection pooling

If you use Supabase's connection pooler (PgBouncer), you may need a direct connection for migrations:

1. Add to `Backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

2. Set `DIRECT_URL` to the direct (non-pooled) connection string in `.env`.

For most local/dev setups, the standard `DATABASE_URL` is sufficient.

## Testing

Backend tests require a database. **Never point tests at production.**

```bash
# In Backend/.env
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5432/teclia_test
```

```bash
cd Backend
npm test
```

Tests connect via Prisma and clean up data between runs.

## Scripts reference

| Script | Command | Description |
|--------|---------|-------------|
| Generate client | `npm run prisma:generate` | Regenerate Prisma Client after schema changes |
| Dev migration | `npm run prisma:migrate` | Create and apply migration in development |
| Deploy migrations | `npm run prisma:deploy` | Apply pending migrations (CI/production) |
| Seed | `npm run prisma:seed` | Run admin/normalization seed |
| Studio | `npm run prisma:studio` | Open Prisma Studio GUI |

## What stayed the same

- All API endpoints (`/api/auth`, `/api/content`, `/api/stats`)
- Supabase Storage for avatars and content files
- JWT authentication
- Response shapes (snake_case fields like `plan_tier`, `avatar_url`)

## Legacy notes

- SQLite and `sql.js` are no longer used by the backend runtime.
- `Backend/postgres_setup.sql` and `Backend/sqlite_setup.sql` remain as historical reference only.
- Use Prisma migrations as the source of truth for schema versioning.
