# ⚡ Quick Deploy Guide - 5 Minutes

## 🎯 Fastest Way to Deploy

### Step 1: Deploy Backend (2 minutes)

#### Option A: Render (Recommended)
1. Go to https://render.com/
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Select your repository: `HFT-Stock-Prediction`
5. Fill in:
   ```
   Name: hft-trading-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
6. Click **"Create Web Service"**
7. **COPY YOUR URL**: `https://hft-trading-backend-xxxx.onrender.com`

#### Option B: Railway (Alternative)
1. Go to https://railway.app/
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Add environment variable:
   ```
   ROOT: backend
   ```
6. Railway auto-deploys!
7. **COPY YOUR URL** from the deployment

---

### Step 2: Deploy Frontend (2 minutes)

#### Vercel (Recommended)
1. Go to https://vercel.com/
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure:
   ```
   Framework Preset: Create React App
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   ```
5. Add Environment Variable:
   ```
   Name: REACT_APP_API_URL
   Value: https://hft-trading-backend-xxxx.onrender.com/api
   ```
   (Paste the URL from Step 1)
6. Click **"Deploy"**
7. Wait 2-3 minutes
8. **Your app is LIVE!** 🎉

---

### Step 3: Update CORS (1 minute)

1. Go back to Render dashboard
2. Click on your backend service
3. Go to **"Environment"** tab
4. Add variable:
   ```
   Key: CORS_ORIGINS
   Value: https://your-project.vercel.app
   ```
   (Use your Vercel URL)
5. Click **"Save Changes"**
6. Service will auto-redeploy

---

## ✅ Verify Deployment

### Test Backend
Open: `https://your-backend.onrender.com/api/health`

Should see:
```json
{
  "status": "ok",
  "timestamp": "2025-12-09T...",
  "environment": "production"
}
```

### Test Frontend
1. Open your Vercel URL
2. Dashboard should load
3. Check browser console (F12) - no errors
4. Try making a prediction

---

## 🎉 Done!

Your HFT Trading System is now live at:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-backend.onrender.com`

### Share Your Links:
```
🚀 Live Demo: https://your-project.vercel.app
📡 API: https://your-backend.onrender.com/api
💻 GitHub: https://github.com/Sarthakm811/HFT-Stock-Prediction
```

---

## 🐛 Troubleshooting

**Backend not responding?**
- Wait 1-2 minutes for first deploy
- Check Render logs for errors
- Verify npm install completed

**Frontend shows errors?**
- Check REACT_APP_API_URL is correct
- Verify backend is running
- Check browser console

**CORS errors?**
- Add your Vercel URL to CORS_ORIGINS
- Redeploy backend

---

## 🔄 Auto-Deploy Setup

Both Vercel and Render auto-deploy when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel and Render automatically deploy! 🚀
```

---

## 💡 Pro Tips

1. **Free Tier Limits**:
   - Render: Sleeps after 15 min inactivity (first request takes 30s)
   - Vercel: Unlimited bandwidth, 100GB/month

2. **Keep Backend Awake**:
   - Use [UptimeRobot](https://uptimerobot.com/) to ping every 5 minutes
   - Or upgrade to paid plan ($7/month)

3. **Custom Domain**:
   - Buy domain from Namecheap ($10/year)
   - Add to Vercel: Settings → Domains
   - Automatic HTTPS!

4. **Monitor Performance**:
   - Vercel Analytics (built-in)
   - Render Metrics (dashboard)

---

## 📞 Need Help?

Common issues:
- ❌ "Failed to fetch" → Check API URL
- ❌ "CORS error" → Update CORS_ORIGINS
- ❌ "Application Error" → Check Render logs
- ❌ "Blank page" → Check browser console

Still stuck? Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

---

**Total Time**: ~5 minutes ⏱️
**Cost**: $0 (Free tier) 💰
**Difficulty**: Easy ⭐⭐

Happy Trading! 🚀📈
