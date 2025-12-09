# 🚀 HFT Trading System - Deployment Guide

This guide covers multiple deployment options for your HFT Trading System.

## 📋 Table of Contents
- [Quick Deploy (Recommended)](#quick-deploy-recommended)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)

---

## 🎯 Quick Deploy (Recommended)

### Option 1: Vercel (Frontend) + Render (Backend)

**Best for**: Free tier, easy setup, automatic deployments

#### Step 1: Deploy Backend to Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `hft-trading-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   ```
6. Click "Create Web Service"
7. **Copy the deployed URL** (e.g., `https://hft-trading-backend.onrender.com`)

#### Step 2: Deploy Frontend to Vercel

1. Go to [Vercel.com](https://vercel.com) and sign up
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variable:
   ```
   REACT_APP_API_URL=https://hft-trading-backend.onrender.com/api
   ```
   (Use the URL from Step 1)
6. Click "Deploy"
7. Your app will be live at `https://your-project.vercel.app`

---

## 🔧 Backend Deployment Options

### Option A: Render (Recommended - Free Tier)

**Pros**: Free tier, auto-deploy from GitHub, easy setup
**Cons**: Cold starts after inactivity

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. New Web Service → Connect Repository
4. Settings:
   ```
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
5. Deploy!

### Option B: Railway

**Pros**: $5 free credit, fast deployments
**Cons**: Requires credit card

1. Go to [Railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Select repository
4. Railway auto-detects Node.js
5. Set root directory to `backend`
6. Deploy!

### Option C: Heroku

**Pros**: Mature platform, good documentation
**Cons**: No free tier anymore

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
cd backend
heroku create hft-trading-backend

# Deploy
git push heroku main

# Set environment variables
heroku config:set NODE_ENV=production
```

### Option D: DigitalOcean App Platform

**Pros**: $200 free credit for 60 days
**Cons**: More complex setup

1. Go to [DigitalOcean](https://www.digitalocean.com)
2. Create App → GitHub
3. Select repository and `backend` folder
4. Configure build and run commands
5. Deploy!

---

## 🎨 Frontend Deployment Options

### Option A: Vercel (Recommended)

**Pros**: Free, automatic deployments, CDN, perfect for React
**Cons**: None for this use case

See Quick Deploy above.

### Option B: Netlify

**Pros**: Free tier, drag-and-drop option
**Cons**: Slightly slower than Vercel

1. Go to [Netlify.com](https://netlify.com)
2. "Add new site" → "Import from Git"
3. Select repository
4. Settings:
   ```
   Base directory: frontend
   Build command: npm run build
   Publish directory: frontend/build
   ```
5. Add environment variable:
   ```
   REACT_APP_API_URL=your-backend-url/api
   ```
6. Deploy!

### Option C: GitHub Pages

**Pros**: Free, simple
**Cons**: Static only, requires homepage setup

```bash
cd frontend

# Add to package.json
"homepage": "https://yourusername.github.io/HFT-Stock-Prediction"

# Install gh-pages
npm install --save-dev gh-pages

# Add scripts
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

### Option D: AWS S3 + CloudFront

**Pros**: Scalable, professional
**Cons**: More complex, costs money

1. Build the app: `npm run build`
2. Create S3 bucket
3. Enable static website hosting
4. Upload build folder
5. Set up CloudFront distribution
6. Configure DNS

---

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
CORS_ORIGINS=https://your-frontend-url.vercel.app
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

---

## ✅ Post-Deployment Checklist

### 1. Update CORS Settings
In `backend/server.js`, update CORS origins:
```javascript
const corsOptions = {
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
};
```

### 2. Test API Connection
Visit: `https://your-backend-url.onrender.com/api/health`

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-12-09T..."
}
```

### 3. Test Frontend
1. Open your deployed frontend URL
2. Check browser console for errors
3. Verify API calls are working
4. Test all features:
   - Dashboard loads
   - Predictions work
   - Charts display
   - Dark mode toggles
   - Notifications appear

### 4. Monitor Performance
- Check Render/Railway logs for backend errors
- Monitor Vercel analytics for frontend performance
- Set up error tracking (optional):
  - [Sentry](https://sentry.io)
  - [LogRocket](https://logrocket.com)

### 5. Set Up Custom Domain (Optional)
- Buy domain from Namecheap/GoDaddy
- Add to Vercel: Settings → Domains
- Update DNS records
- Enable HTTPS (automatic on Vercel)

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "Application Error" or 503
- Check logs in Render/Railway dashboard
- Verify `npm install` completed successfully
- Check PORT environment variable is set

**Problem**: CORS errors
- Update CORS origins in server.js
- Redeploy backend

### Frontend Issues

**Problem**: "Failed to fetch" errors
- Verify REACT_APP_API_URL is correct
- Check backend is running
- Test API endpoint directly in browser

**Problem**: Blank page after deployment
- Check browser console for errors
- Verify build completed successfully
- Check public URL in package.json

**Problem**: Environment variables not working
- Rebuild the app after adding variables
- Verify variable names start with REACT_APP_

---

## 📊 Deployment Comparison

| Platform | Backend | Frontend | Free Tier | Auto Deploy | Difficulty |
|----------|---------|----------|-----------|-------------|------------|
| Vercel + Render | ✅ | ✅ | ✅ | ✅ | ⭐⭐ |
| Netlify + Railway | ✅ | ✅ | ⚠️ | ✅ | ⭐⭐ |
| Heroku | ✅ | ❌ | ❌ | ✅ | ⭐⭐⭐ |
| AWS | ✅ | ✅ | ⚠️ | ❌ | ⭐⭐⭐⭐⭐ |
| DigitalOcean | ✅ | ✅ | ⚠️ | ✅ | ⭐⭐⭐⭐ |

---

## 🎉 Success!

Your HFT Trading System is now live! Share your deployment URL:
- Frontend: `https://your-project.vercel.app`
- Backend API: `https://your-backend.onrender.com/api`

### Next Steps:
1. Add custom domain
2. Set up monitoring
3. Enable analytics
4. Add error tracking
5. Optimize performance
6. Set up CI/CD pipeline

---

## 📞 Need Help?

- Check platform documentation
- Review deployment logs
- Test locally first
- Verify environment variables
- Check CORS settings

Happy Trading! 🚀📈
