# AI Raman Experiment Logbook

A full-stack scientific logbook for Raman spectroscopy experiments.

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4 → deployed on **Vercel**
- **Backend**: FastAPI + SQLAlchemy + SQLite → deployed on **Render**

---

## 🚀 Deployment Guide

### Prerequisites

- A GitHub account
- Push both `logbook-frontend/` and `logbook-backend/` to a GitHub repo (can be one monorepo or two separate repos)

---

### Step 1: Deploy the Backend on Render

1. Go to [render.com](https://render.com) and sign up / log in.
2. Click **"New" → "Web Service"** and connect your GitHub repo.
3. Configure the service:

| Setting | Value |
|---|---|
| **Root Directory** | `logbook-backend` (if monorepo) |
| **Runtime** | Python |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

4. Add the following **Environment Variable** on Render:

| Variable | Value |
|---|---|
| `CORS_ORIGINS` | `https://your-app-name.vercel.app` *(set this after deploying frontend)* |

5. Click **Deploy**. Note the URL (e.g. `https://logbook-backend-xxxx.onrender.com`).
6. Verify: visit `https://your-render-url.onrender.com/health` — should return `{"status":"ok"}`.

---

### Step 2: Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in.
2. Click **"Add New" → "Project"** and import your GitHub repo.
3. Configure:

| Setting | Value |
|---|---|
| **Root Directory** | `logbook-frontend` (if monorepo) |
| **Framework Preset** | Next.js (auto-detected) |

4. Add the following **Environment Variable** on Vercel:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-render-url.onrender.com` *(the URL from Step 1)* |

5. Click **Deploy**.

---

### Step 3: Update CORS on Render

After the Vercel deployment is live:

1. Go back to your Render dashboard → your backend service → **Environment**.
2. Update `CORS_ORIGINS` to your actual Vercel domain: `https://your-app-name.vercel.app`
3. Render will automatically redeploy.

---

## 🔧 Environment Variables Reference

### Vercel (Frontend)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Full URL of the deployed backend (no trailing slash) |

### Render (Backend)

| Variable | Required | Default | Description |
|---|---|---|---|
| `CORS_ORIGINS` | ✅ | `*` | Comma-separated allowed origins |
| `UPLOAD_DIR` | ❌ | `./uploads` | Directory for uploaded files |
| `DATABASE_URL` | ❌ | `sqlite:///./logbook.db` | Database connection string |

---

## 🏠 Local Development

### Backend
```bash
cd logbook-backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd logbook-frontend
npm install
npm run dev
```

The frontend `.env.local` is pre-configured to point to `http://localhost:8000`.

---

## ⚠️ Known Limitations (Testing Phase)

1. **Ephemeral Storage on Render Free Tier**: Uploaded files and the SQLite database are stored on Render's ephemeral filesystem. They **will be lost** when the service restarts or redeploys. This is acceptable for testing.

2. **Cold Starts**: Render free-tier services spin down after inactivity. The first request after inactivity may take 30-60 seconds.

3. **No Authentication**: The app currently has no login system. Anyone with the URL can create/edit experiments.

### Future Improvements for Production
- Migrate to PostgreSQL (Render offers a free managed Postgres instance)
- Use cloud storage (Cloudflare R2, AWS S3) for file uploads
- Add user authentication
