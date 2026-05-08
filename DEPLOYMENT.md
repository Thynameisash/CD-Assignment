# Netlify Deployment Guide

## Overview
Your project is now configured for Netlify deployment with a unified build command.

## What's Been Set Up

1. **Root package.json** - Added `npm run build` command that:
   - Builds the frontend (Vite) to `frontend/dist`
   - Seeds the database for the backend

2. **netlify.toml** - Configuration file that:
   - Sets Netlify to publish the `frontend/dist` folder
   - Configures API routing
   - Sets up SPA routing for React Router

## Deployment Options

### Option 1: Frontend on Netlify + Backend on Separate Service (Recommended)

Deploy your frontend to Netlify and backend to a free service like Render or Railway:

1. **Deploy Frontend to Netlify:**
   - Push to GitHub/GitLab
   - Connect repository to Netlify
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

2. **Deploy Backend to Render/Railway:**
   - Push backend to GitHub
   - Deploy to [Render](https://render.com) or [Railway](https://railway.app)
   - Set `PORT` environment variable
   - Your backend will get a URL like `https://carfinder-api.onrender.com`

3. **Update Frontend API URL:**
   - In `frontend/src/lib/api.js`, change:
     ```javascript
     const BASE = process.env.VITE_API_URL || '/api';
     ```
   - Create `frontend/.env.production` with:
     ```
     VITE_API_URL=https://carfinder-api.onrender.com/api
     ```

### Option 2: Full Stack on Netlify (Using Netlify Functions)

To deploy both frontend and backend entirely on Netlify:

1. Create `netlify/functions/` directory:
   ```bash
   mkdir -p netlify/functions
   ```

2. Set `VITE_API_URL=/api` in your build or environment variables

3. Configure your API endpoints as Netlify Functions (requires converting Express routes)

## Quick Start for Option 1

```bash
# 1. Push to GitHub
git add .
git commit -m "Configure for Netlify deployment"
git push

# 2. On Netlify Dashboard:
# - Click "New site from Git"
# - Select your repository
# - Build command: npm run build
# - Publish directory: frontend/dist
# - Deploy!

# 3. Deploy backend separately to Render/Railway
```

## Environment Variables on Netlify

Add these in Netlify Dashboard (Site Settings > Build & Deploy > Environment):

```
NODE_VERSION=20
NPM_VERSION=10
```

## Notes

- **Build Command:** `npm run build` (already configured)
- **Frontend Build Output:** `frontend/dist` (automatically published)
- **Backend Database:** Uses SQLite stored in `backend/data/` (you may need to configure persistent storage if using Netlify Functions)

## Troubleshooting

- **API calls fail:** Check that your backend URL is correct in environment variables
- **Database not persisting:** SQLite files in `backend/data/` need persistent storage (recommended: use external database or backend service)
- **Build fails:** Run `npm run build` locally to test before deploying
