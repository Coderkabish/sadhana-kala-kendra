# Full-Stack Debugging Report (Frontend + Backend)

Date: 2026-03-17
Project: sadhana-kala-kendra
Stack: React + Vite (frontend), Node.js + Express (backend), MySQL

## 1. Project Structure Analysis

### 1.1 Repository layout

- `frontend/`: React SPA (Vite), user pages + admin panel UI.
- `backend/`: Express API server, controllers/routes/models, MySQL access.
- Root folder currently has a minimal `package.json` with no run scripts.

### 1.2 Entry points identified

- Frontend HTML entry: `frontend/index.html`
  - Contains `<div id="root"></div>` and loads `/src/main.jsx`.
- Frontend JS entry: `frontend/src/main.jsx`
  - Uses `createRoot(document.getElementById('root'))` and renders `<App />`.
- Frontend app shell/router: `frontend/src/App.jsx`
  - Uses `BrowserRouter`, `Routes`, and route table.
- Backend entry: `backend/server.js`
  - Creates Express app, applies middleware, mounts `/api/*` routes, listens on `PORT || 5000`.

### 1.3 Frontend-backend connection model

- Frontend API client base URL in `frontend/src/admin/services/api.js`:
  - `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";`
- Dev proxy in `frontend/vite.config.js`:
  - `/api` is proxied to `http://localhost:5001`.
- Backend default runtime port in `backend/server.js`:
  - `const PORT = process.env.PORT || 5000;`

Finding: frontend dev proxy target (`5001`) and backend default port (`5000`) are inconsistent.

## 2. Frontend Analysis

### 2.1 React initialization correctness

Frontend initialization is structurally correct:

- `frontend/index.html` has valid mount node (`id="root"`).
- `frontend/src/main.jsx` mounts React correctly with React 18 API.
- `frontend/src/App.jsx` exports default App and is imported correctly.

No mounting bug found in the initialization path.

### 2.2 Vite configuration review

`frontend/vite.config.js` is generally valid, but contains a critical environment mismatch:

```js
server: {
  host: 'localhost',
  port: Number(env.VITE_PORT) || 5173,
  strictPort: true,
  proxy: {
    "/api": {
      target: "http://localhost:5001",
      changeOrigin: true,
      secure: false,
    },
  },
}
```

This proxy expects backend on `5001`, while backend defaults to `5000`.

### 2.3 Runtime checks performed

- Frontend dev server was started successfully once: `http://localhost:5173/`.
- Later live check showed `localhost:5173` unreachable (frontend not running at that moment).
- Backend responded on `localhost:5000` with: `Backend is running!`.
- Port `5001` was unreachable (nothing listening there).

Interpretation: frontend is not consistently being run, and when it is run, API proxy points to a non-existent backend port.

### 2.4 Build health

`npm run build` inside frontend:

- Vite build succeeded.
- Postbuild failed because `react-snap` expects `frontend/build/index.html`, but Vite outputs to `frontend/dist/index.html`.

Error observed:

```text
ENOENT: no such file or directory, open '.../frontend/build/index.html'
```

This is a production pipeline misconfiguration.

## 3. Routing Analysis

### 3.1 React Router usage

`frontend/src/App.jsx` correctly uses SPA routing:

- `BrowserRouter as Router`
- `Routes` / `Route`
- Includes user routes and `/admin/*` subtree.

### 3.2 Refresh behavior implications

- In Vite dev mode, refresh fallback is handled by Vite automatically.
- In production static hosting, `BrowserRouter` requires rewrite fallback to `index.html`.

`DEPLOYMENT.md` already documents the need for `.htaccess` rewrite rules for refresh handling.

If fallback is missing in production, refreshing on deep routes (e.g., `/about`) will return 404/non-SPA response.

## 4. Network Behavior Analysis

## Observed symptom

"On refresh, nothing appears in Network tab."

### 4.1 Why this can happen in this project

There are three concrete project-specific scenarios:

1. Frontend is not running at all.
   - Verified case: `localhost:5173` unreachable during check.
   - If no frontend server is active, there is no SPA JS execution and no API traffic.

2. Wrong URL is being opened.
   - Backend root (`localhost:5000`) returns plain text: `Backend is running!`.
   - That endpoint serves no SPA bundle, so no React startup and typically no XHR/fetch calls.

3. API proxy mismatch (`5001` vs `5000`).
   - Even when frontend runs, `/api/*` calls go to `localhost:5001` and fail.
   - Network would show failed requests if frontend JS executes, but data loading appears broken.

### 4.2 What this means for the reported symptom

Primary root-cause for "empty network on refresh" is frontend not being served/opened correctly (or wrong origin opened), not MySQL or route/controller logic.

Secondary but critical issue is API proxy port mismatch, which causes backend request failures after frontend startup.

## 5. Backend Analysis

### 5.1 Express setup

`backend/server.js` has a valid Express setup:

- Security middleware: `helmet`, rate limiter on admin routes.
- Parsers: `express.json`, `cookieParser`.
- CORS configured with local-dev permissive behavior outside production.
- Static upload serving under `/uploads`.
- API route mounting under `/api/*`.

### 5.2 Port and reachability

- Backend default port: `5000`.
- Live probe returned expected root response (`Backend is running!`).

Backend is reachable and alive on expected port.

## 6. Environment Configuration Analysis

### 6.1 Files found

- `frontend/.env.example`
- `frontend/.env.production.example`
- `backend/.env.example`

No committed real `.env` values were available for inspection in workspace snapshots.

### 6.2 Expected values and consistency

- Frontend examples use `VITE_API_BASE_URL=/api` (good for same-origin or proxied API).
- Backend example uses `PORT=5000` and `FRONTEND_URL=https://yourdomain.com`.

Mismatch exists in runtime config file (`vite.config.js`) where proxy target is hardcoded to `5001`.

## 7. Build & Run Configuration

### 7.1 Scripts review

- Root `package.json`: only dependency declaration, no `dev` script.
- `frontend/package.json`: has `dev`, `build`, `preview`.
- `backend/package.json`: has `start`, `dev`, `server`, `create-admin`.

### 7.2 Operational impact

Running `npm run dev` from root fails (`Missing script: dev`).
If developer assumes root command should start app, frontend never starts.

### 7.3 Build misconfiguration

`frontend/package.json` includes:

```json
"postbuild": "react-snap"
```

With Vite output in `dist/`, `react-snap` default expectation of `build/` causes postbuild failure.

## 8. Critical Issue Identification (Root Cause)

## Root cause (primary)

The browser is not loading the React frontend runtime during refresh in the failing scenario.

This occurs because execution context is wrong:

- frontend dev server is not always running on `localhost:5173`, and/or
- user is opening backend URL (`localhost:5000`) instead of frontend URL (`localhost:5173`) during development.

When React runtime is not loaded, no app scripts run, therefore no API/fetch requests are generated, which explains the empty Network panel symptom.

## Root cause (secondary)

Even when frontend does run, `frontend/vite.config.js` proxies `/api` to `localhost:5001` while backend listens on `5000`. This breaks API calls and can make the app appear non-functional.

## 9. Fixes & Recommendations

### 9.1 Fix #1 (highest priority): align backend proxy port

Update `frontend/vite.config.js`:

```js
proxy: {
  "/api": {
    target: "http://localhost:5000",
    changeOrigin: true,
    secure: false,
  },
},
```

Alternative: use env variable for target:

```js
target: env.VITE_PROXY_TARGET || "http://localhost:5000"
```

### 9.2 Fix #2: enforce correct local startup workflow

Run in two terminals:

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev
```

Open only `http://localhost:5173` for frontend UI testing.

### 9.3 Fix #3: add root orchestrator scripts (recommended)

Current root `package.json` has no runnable scripts. Add workspace scripts so startup mistakes are less likely:

```json
{
  "scripts": {
    "dev:frontend": "npm --prefix frontend run dev",
    "dev:backend": "npm --prefix backend run dev",
    "start:backend": "npm --prefix backend run start"
  }
}
```

Optional: use `concurrently` for single-command startup.

### 9.4 Fix #4: resolve postbuild failure

Either remove `react-snap` if not needed, or configure it for Vite `dist/` output.

Minimum immediate fix:

- Remove/disable `postbuild` until react-snap is configured for Vite.

### 9.5 Fix #5: production refresh fallback (BrowserRouter)

For production static hosting, ensure rewrite fallback to `index.html` is always enabled (as described in `DEPLOYMENT.md`).

### 9.6 Diagnostic checklist for future incidents

1. Verify frontend URL responds: `http://localhost:5173`.
2. Verify backend URL responds: `http://localhost:5000`.
3. Verify proxy target port actually has a listener.
4. In DevTools Network, remove filters (set to `All`) and disable cache while testing.
5. Confirm no startup command is being run from repository root unless root scripts are added.

## 10. Final Summary

### What is working

- React app bootstrap structure (`index.html`, `main.jsx`, `App.jsx`) is valid.
- Express backend boots and responds on port `5000`.
- API route registration in backend is comprehensive and structurally correct.

### What is broken

- Frontend dev session is not consistently active when testing.
- Vite proxy is misconfigured to `localhost:5001` while backend is on `5000`.
- Frontend production build pipeline fails in postbuild due react-snap path mismatch (`build/` vs `dist/`).

### What must be fixed first

1. Change Vite proxy target from `5001` to `5000`.
2. Start frontend and backend from their own folders and use `localhost:5173` for UI testing.
3. Fix or remove `react-snap` postbuild to stabilize production build flow.

