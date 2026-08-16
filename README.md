# StudyAI — Full-Stack Project

One folder, two apps: an Express/MongoDB API and a React (Vite) frontend.

```
studyai-app/
├── backend/     Node.js + Express + MongoDB + JWT REST API
└── frontend/    React + Vite + Tailwind + Recharts client
```

## Quick start

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env      # then set MONGO_URI and JWT_SECRET
npm run seed               # optional: creates demo@studyai.app / password123
npm run dev                 # runs on http://localhost:5000
```

**2. Frontend** (in a second terminal)
```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm run dev                 # runs on http://localhost:5173
```

Open `http://localhost:5173`. The backend's `CLIENT_URL` in `backend/.env` should match this
address so CORS allows the browser requests.

## What's where

- `backend/README.md` — backend setup, folder structure, security features
- `backend/API_DOCUMENTATION.md` — every endpoint, request/response shapes
- `frontend/src/App.jsx` — the full UI (landing page, auth, dashboard with all 8 modules)
- `frontend/src/lib/api.js` — fetch client, one function per backend endpoint
- `frontend/INTEGRATION_GUIDE.md` — which line in `App.jsx` to replace with which `api.js` call, module by module

## Current state

The frontend ships with realistic **mock/local state** in `App.jsx` (matching the exact
data shapes the backend returns) so it's fully explorable on its own. `api.js` is included
and ready to call — follow `INTEGRATION_GUIDE.md` to swap each module's local state for the
real network call, one module at a time (start with Login/Signup, then Notes, then the rest).

---

## Pushing to GitHub

### Which files should NOT be pushed

Already excluded by `.gitignore` at the project root — never remove these lines:

| Pattern | Why |
|---|---|
| `node_modules/` | Huge, regenerated from `package.json` by `npm install` — never commit |
| `.env`, `backend/.env`, `frontend/.env` | Real secrets (DB password, JWT secret) — commit `.env.example` instead, never the real file |
| `dist/`, `build/` | Generated build output — the hosting platform builds this itself |
| `backend/uploads/*` (except `.gitkeep`) | User-uploaded files shouldn't live in git |
| `*.log`, `.DS_Store` | OS/tool junk |

Everything else (all source code, both `package.json` + `package-lock.json` files,
`.env.example` files, docs, `.vscode/` config) **should** be pushed — that's the actual project.

### Step-by-step push

```bash
cd studyai-app

# one-time setup
git init
git branch -M main

# sanity check — confirm no .env or node_modules will be included
git status

git add .
git commit -m "Initial commit: StudyAI full-stack app"

# create a NEW EMPTY repo on github.com first (no README/gitignore added there),
# then copy its URL and run:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

**Before running `git add .`**, double-check with `git status` that no line mentions `.env`
(only `.env.example` should ever show up). If `.env` appears, it means `.gitignore` isn't
being picked up correctly — fix that first.

---

## Going live

### 1. Database — MongoDB Atlas (needed before either deploy)

1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Database Access** → create a DB user (username + password)
3. **Network Access** → add `0.0.0.0/0` (allow from anywhere)
4. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/studyai`

### 2. Backend → Render.com

Netlify/Vercel run serverless functions, not a persistent Express server — Render fits this
project's architecture directly.

1. Sign up at [render.com](https://render.com) with GitHub
2. **New +** → **Web Service** → select this repo
3. Settings:

   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free |

4. Add environment variables (Render dashboard → Environment):
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<a long random string — generate with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))">
   JWT_EXPIRES_IN=7d
   JWT_EXPIRES_IN_REMEMBER=30d
   MAX_FILE_SIZE_MB=20
   UPLOAD_DIR=uploads
   RATE_LIMIT_WINDOW_MIN=15
   RATE_LIMIT_MAX=200
   CLIENT_URL=          # fill in after step 3, once you have the Vercel URL
   ```
5. Deploy. You'll get a URL like `https://studyai-backend.onrender.com`. Confirm it's live by
   visiting `https://studyai-backend.onrender.com/api/health`.

> Free Render instances spin down after inactivity — the first request after idle can take
> ~30–60s to wake up. Fine for a demo/portfolio project.

### 3. Frontend → Vercel

1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. **Add New → Project** → select the same repo
3. Settings:

   | Setting | Value |
   |---|---|
   | Root Directory | `frontend` |
   | Framework Preset | Vite (auto-detected) |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

4. Environment variable:
   ```
   VITE_API_URL=https://studyai-backend.onrender.com/api
   ```
   (use your actual Render URL from step 2)
5. Deploy. You'll get a URL like `https://studyai-app.vercel.app`.

### 4. Connect the two (required — CORS)

Go back to Render → your backend service → Environment → set:
```
CLIENT_URL=https://studyai-app.vercel.app
```
Save — Render auto-restarts the service. Without this step, the browser will block API
requests from the live frontend to the live backend.

### Post-deploy checklist

- [ ] `GET https://<render-url>/api/health` returns `{ "success": true, ... }`
- [ ] Signing up / logging in on the live frontend actually creates a user in MongoDB Atlas (check the **Collections** tab in Atlas)
- [ ] `CLIENT_URL` on Render matches the exact Vercel URL (including `https://`, no trailing slash)
- [ ] No `.env` file is visible in the GitHub repo — only `.env.example`

