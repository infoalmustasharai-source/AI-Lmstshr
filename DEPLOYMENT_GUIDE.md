# 🚀 Deployment Guide - المستشار AI

Complete guide for deploying the AI-Lmstshr application to production.

---

## 📋 Prerequisites

Before deployment, ensure you have:
- GitHub account (for code hosting and actions)
- OpenAI API key
- Render account (for backend)
- Vercel or Netlify account (for frontend)

---

## 🏗️ Backend Deployment (Render.com)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "feat: prepare for production deployment"
git push origin master
```

### Step 2: Create Render Service
1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "Create New" → "Web Service"
4. Select your GitHub repository: `AI-Lmstshr`
5. Configure:
   - **Name**: `ai-lmstshr-api`
   - **Environment**: `Node`
   - **Region**: Frankfurt (or nearest to you)
   - **Plan**: Free Tier (or paid for better performance)
   - **Build Command**: `cd artifacts/api-server && npm install && npm run build`
   - **Start Command**: `cd artifacts/api-server && node dist/index.js`

### Step 3: Set Environment Variables
In Render dashboard, go to "Environment" and add:
```
NODE_ENV=production
PORT=3000
DATABASE_URL=file:./data/production.db
OPENAI_API_KEY=sk-your-actual-key
JWT_SECRET=your-super-secret-jwt-key-change-this
ADMIN_EMAIL=bishoysamy390@gmail.com
ADMIN_PASSWORD=Bishoysamy2020
FRONTEND_URL=https://your-frontend-domain.com
```

### Step 4: Deploy
Click "Deploy" button. The backend will be live at:
```
https://ai-lmstshr-api.onrender.com
```

⚠️ **Note**: Free tier services sleep after 15 minutes of inactivity. Upgrade to paid for production.

---

## 🎨 Frontend Deployment

### Option A: Vercel (Recommended)

#### Step 1: Deploy to Vercel
1. Go to https://vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Project Name**: `ai-lmstshr`
   - **Root Directory**: `artifacts/al-mustashar`

#### Step 2: Environment Variables
In Vercel project settings → "Environment Variables":
```
VITE_API_URL=https://ai-lmstshr-api.onrender.com/api
```

#### Step 3: Deploy
Click "Deploy". Your frontend will be at:
```
https://ai-lmstshr.vercel.app
```

---

### Option B: Netlify (Alternative)

#### Step 1: Deploy to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select the repository
4. Configure:
   - **Base directory**: `artifacts/al-mustashar`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`

#### Step 2: Environment Variables
In Netlify site settings → "Build & deploy" → "Environment":
```
VITE_API_URL=https://ai-lmstshr-api.onrender.com/api
```

#### Step 3: Deploy
Click "Deploy site". Your frontend will be at:
```
https://ai-lmstshr.netlify.app
```

---

## 🔐 Security Checklist

Before going live, ensure:

- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Set strong `ADMIN_PASSWORD`
- [ ] Store all secrets in environment variables (never in code)
- [ ] Enable HTTPS on both backend and frontend
- [ ] Update `FRONTEND_URL` in backend to match your deployed frontend URL
- [ ] Test authentication flow
- [ ] Test payment/credit system

---

## 🧪 Testing Deployment

### Test Backend
```bash
curl https://ai-lmstshr-api.onrender.com/api/health
# Expected response: {"status":"ok","timestamp":"..."}
```

### Test Frontend Login
1. Navigate to your frontend URL
2. Login with test account:
   - Email: `bishoysamy390@gmail.com`
   - Password: `Bishoysamy2020`
3. Create a new chat and test AI response

---

## 📊 Monitoring

### Render Backend Monitoring
- Dashboard: https://dashboard.render.com
- View logs, memory usage, and uptime

### Vercel/Netlify Frontend Monitoring
- Vercel: https://vercel.com/dashboard
- Netlify: https://app.netlify.app
- View build logs and error tracking

---

## 🔄 Continuous Deployment

### Automatic Deployment on Push
Both Render, Vercel, and Netlify support automatic deployments when you push to your main branch.

To enable:
1. Connect your GitHub repository
2. Push to `master`/`main` branch
3. Services automatically rebuild and deploy

---

## 🆘 Troubleshooting

### Backend won't start
- Check logs in Render dashboard
- Ensure all environment variables are set
- Verify database file permissions

### Frontend shows blank page
- Check VITE_API_URL is pointing to correct backend
- Check browser console for errors (F12)
- Verify backend is accessible

### API connection errors
- Check browser Network tab (F12)
- Verify CORS is enabled on backend
- Ensure FRONTEND_URL matches your deployment URL

---

## 📝 Production Deployment Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel/Netlify
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Database backup system set up
- [ ] Admin login tested
- [ ] User registration tested
- [ ] Chat functionality tested
- [ ] Payment system tested
- [ ] Error logging configured
- [ ] Support email configured

---

## 🎉 Deployment Complete!

Your application is now live. Share these URLs:
- **Frontend**: https://your-frontend-domain.com
- **API**: https://your-backend-domain.com

Happy coding! 🚀
