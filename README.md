# Teclia Academia

This repository contains a React frontend and an Express backend for the Teclia Academia project.

## Local Setup

Follow these steps to run both frontend and backend locally.

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:

```bash
cd Backend
```

2. Install backend dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm run dev
```

This will start the backend on port `3001` by default.

#### Optional: Run production backend

```bash
npm start
```

### 2. Frontend Setup

1. Open a second terminal and navigate to the project root:

```bash
cd ..
```

2. Install frontend dependencies:

```bash
npm install
```

3. Start the Vite development server:

```bash
npm run dev
```

The frontend will start on the default Vite port, usually `5173`.

### 3. Configure Frontend to Use Local Backend

The frontend currently points to a deployed backend URL in `src/services/api.js`.

To use your local backend instead, update `BACKEND_BASE_URL` in `src/services/api.js`:

```js
export const BACKEND_BASE_URL = 'http://localhost:3001';
```

Then restart the frontend.

## Notes

- The backend uses `dotenv` and can support environment variables like `PORT` and `JWT_SECRET`.
- If `JWT_SECRET` is not set, the backend uses a development fallback secret.
- The frontend runs independently from the backend, so make sure both are running before testing functionality.

## Quick Commands

From the repository root:

```bash
# Start the backend
cd Backend && npm install && npm run dev

# In a separate terminal, start the frontend
cd .. && npm install && npm run dev
```
