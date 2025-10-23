# GitHub and Vercel Deployment Instructions

Your workout tracker is ready to deploy! Follow these steps to push to GitHub and deploy to Vercel.

## ✅ Already Completed

- ✅ Git repository initialized
- ✅ All files committed
- ✅ README.md and .gitignore created
- ✅ Vercel configuration added

## 🚀 Quick Deployment (2 Options)

### Option 1: Automatic (via GitHub CLI)

If you have GitHub CLI installed:

```bash
cd /Users/britainsaluri/workout-tracker

# Authenticate (if not already)
gh auth login

# Create repo and push
gh repo create workout-tracker --public --source=. --push

# Deploy to Vercel (install Vercel CLI first)
npm install -g vercel
vercel --prod
```

### Option 2: Manual (Recommended - Faster!)

#### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `workout-tracker`
3. Description: "Mobile-first PWA for tracking workout progress"
4. Choose **Public** or **Private**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click "Create repository"

#### Step 2: Push to GitHub

Run these commands in your terminal:

```bash
cd /Users/britainsaluri/workout-tracker

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/workout-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

#### Step 3: Deploy to Vercel

**Method A: Import from GitHub (Easiest)**

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import your `workout-tracker` repository
4. Click "Deploy"
5. Done! Vercel will give you a URL like `https://workout-tracker-abc123.vercel.app`

**Method B: Deploy via CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (follow prompts)
cd /Users/britainsaluri/workout-tracker
vercel

# For production deployment
vercel --prod
```

## 📱 After Deployment

1. **Visit your app**: Open the Vercel URL on your phone
2. **Install as PWA**:
   - iOS: Safari → Share → Add to Home Screen
   - Android: Chrome → Menu → Install App
3. **Start tracking**: Your workout data will be saved locally on your phone

## 🔧 Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## 🔄 Making Updates

After making changes to your app:

```bash
cd /Users/britainsaluri/workout-tracker

# Stage and commit changes
git add .
git commit -m "Update workout tracker"

# Push to GitHub
git push

# Vercel will automatically redeploy!
```

## 📊 Vercel Configuration

Your app is configured with `vercel.json`:

- ✅ Static file hosting
- ✅ Proper routing for single-page app
- ✅ Service Worker headers configured
- ✅ Cache headers optimized

## 🆘 Troubleshooting

**Issue**: Git push fails with authentication error

**Solution**:
```bash
# Use SSH instead of HTTPS
git remote set-url origin git@github.com:YOUR_USERNAME/workout-tracker.git
```

**Issue**: Vercel deployment fails

**Solution**: Check that:
- `src/index.html` exists
- `vercel.json` is at root level
- No build errors in Vercel logs

## 🎯 Expected URLs

After deployment, you'll have:

- **GitHub**: `https://github.com/YOUR_USERNAME/workout-tracker`
- **Vercel**: `https://workout-tracker-YOUR_NAME.vercel.app`

## ✨ What's Next?

1. Share the Vercel URL with your phone
2. Bookmark it or add to home screen
3. Start logging your workouts!
4. Data syncs automatically (locally)

---

Need help? Check the [User Guide](USER-GUIDE.md) or [Deployment Guide](DEPLOYMENT.md)
