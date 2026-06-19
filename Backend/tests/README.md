Backend tests for Teclia Academia

Prereqs
- Node >= 18
- From the repository root run `npm install` inside `Backend/` to install dev dependencies.

Setup
- Tests use a dedicated SQLite file stored under `Backend/tests_db/teclia.db`. The test helper sets `DATABASE_DIR` automatically.
- Do NOT run tests against production or development databases.

Scripts
- `npm run test` — run tests once
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run with coverage

Structure
- `tests/` contains `auth.test.js`, `content.test.js`, `stats.test.js`.
- `tests/helpers/db.setup.js` initializes and cleans the test DB.
- `tests/fixtures/` holds sample users and content used across tests.

Notes
- Some endpoints (e.g. `/api/auth/refresh`) are not implemented in the current backend; tests will reflect actual behavior.
- Tests are built to be isolated and remove created users/content between tests.
