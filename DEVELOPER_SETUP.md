# Developer Setup — Teclia Academia

This guide walks a new developer through cloning the repository, installing dependencies, configuring environment variables, and running both frontend and backend locally.

## 1) Project overview

- Frontend: React + Vite app located at the repository root.
- Backend: Express server and lightweight database code in `Backend/`.
- Database: Defaults to local SQLite (no external services required). Optionally use PostgreSQL or Supabase for production.

## 2) Tech stack

- Frontend: React 18, Vite, Axios
- Backend: Node.js (ESM), Express, JWT authentication, multer for file uploads
- Storage: Optional Supabase storage (client in `Backend/lib/supabaseClient.js`)
- Database: SQLite (local file) or PostgreSQL via `DATABASE_URL`

## 3) Prerequisites

- Node.js 18.x or later (LTS recommended). Verify with `node -v`.
- npm (bundled with Node) or an alternative package manager (Yarn, pnpm) — npm examples are used here.
- Optional: `psql` if you plan to run Postgres SQL scripts locally.

## 4) Clone the repository

```bash
git clone https://github.com/<your-org>/Teclia-Academy.git
cd Teclia-Academy
```

## 5) Install dependencies

- Frontend (root):

```bash
npm install
```

- Backend (Backend/):

```bash
cd Backend
npm install
```

## 6) Configure environment variables

- Copy the example file to create a real `.env` for the backend:

```bash
cd Backend
cp ../.env.example .env
# On Windows PowerShell: copy ../.env.example .env
```

- Edit `Backend/.env` and set values for `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `SENDGRID_API_KEY` (for emails), and `DATABASE_URL` (if using Postgres). See `.env.example` for descriptions for each variable.

Notes:
- If you do not set `DATABASE_URL`, the backend will use a local SQLite file (default) created under `Backend/`.
- The backend will fall back to a development `JWT_SECRET` if none is provided, but you should set `JWT_SECRET` for real development or production.

## 7) Running the project locally

- Start backend (from `Backend/`):

```bash
cd Backend
npm run dev
```

The backend listens on `PORT` (defaults to `3001`). APIs mount under `/api` (for example `http://localhost:3001/api/auth/login`).

- Start frontend (from repository root):

```bash
npm run dev
```

The Vite dev server typically runs on `http://localhost:5173`.

## 8) Connecting to Supabase (optional)

If you prefer to use Supabase for storage and/or Postgres hosting:

- Create a Supabase project and a storage bucket (default bucket name in this project: `uploads`).
- Copy `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` into your `Backend/.env`.
- Ensure `SUPABASE_SERVICE_KEY` is the service-role key (required for server-side uploads/deletes).
- If you want the backend DB to target Supabase Postgres, set `DATABASE_URL` to the Supabase Postgres connection string.

## 9) Database initialization, migrations and seed data

- The backend will automatically initialize the schema on startup when using SQLite or Postgres (see `Backend/db/init.js`).
- A default admin account is created automatically during initialization. Defaults are documented in `Backend/db/init.js`.
- If you need to run SQL scripts manually, examples are in `Backend/postgres_setup.sql` and `Backend/sqlite_setup.sql`.
- There is a `npm run migrate:postgres` script in `Backend/package.json` intended for migration helpers; inspect the script before running.

## 10) Common setup errors and fixes

- "SUPABASE_URL and SUPABASE_SERVICE_KEY must be defined" — Copy `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` into `Backend/.env` or remove Supabase-dependent calls if you are working purely with local uploads.
- "No token provided" or 401 responses — Ensure `JWT_SECRET` is set in `Backend/.env` and that you include `Authorization: Bearer <token>` in requests that require authentication.
- Port already in use — Change `PORT` in `Backend/.env` or stop the process using the port.
- File upload errors with multer — Ensure the `uploads/` directory is writable or that Supabase credentials are correct for server-side uploads.
- Email (SendGrid) failures — Set `SENDGRID_API_KEY` or disable email-based flows (password reset) during local development.

## 11) Helpful commands

- Backend in production mode:

```bash
cd Backend
npm start
```

- Purge non-admin users (utility):

```bash
node ./scripts/purge_non_admins.js
```

## 12) Further reading

- API reference: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Code structure: inspect `Backend/routes`, `Backend/controllers`, and `Backend/db` for server behavior.

If you get stuck, open an issue with the output of your backend logs and the `.env` values you used (omit secrets).
