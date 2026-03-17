# Vercel Deployment Checklist - nAnoCards

## ⚠️ Current Issue
The deployed site is showing an old version of the project instead of the updated code.

## ✅ Deployment Steps

### Step 1: Verify Git is Committed
```bash
cd /Users/carajohnson/nAnoCards
git status
git add .
git commit -m "Initial nAnoCards deployment"
git push origin main
```

### Step 2: Set Environment Variables on Vercel

1. Go to: https://vercel.com/dashboard
2. Select your `nanocards` project
3. Go to **Settings → Environment Variables**
4. Add these variables for **Production**:

```
VITE_SUPABASE_PROJECT_ID = ffhowwvlytnoulijclac
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaG93d3ZseXRub3VsaWpjbGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTgwOTAsImV4cCI6MjA4NzYzNDA5MH0.-JGGJDwK6yd4K6aJj6nDIW74tts6GMyPyBPJJtIaJHg
```

5. **Save changes** - Vercel will automatically redeploy

### Step 3: Trigger a Redeploy

Option A - Via Vercel Dashboard:
1. Go to **Deployments**
2. Click the three dots (⋮) on latest deployment
3. Select **Redeploy**

Option B - Via CLI:
```bash
vercel --prod --force
```

### Step 4: Verify Deployment

After redeployment completes:
1. Go to https://nanocards-psi.vercel.app/
2. Open DevTools (F12)
3. Check Console for errors
4. Check that nAnoLogo.png loads
5. Try clicking "Development Mode" button

## 🔍 Troubleshooting

### If Still Showing Old Version:
- Clear browser cache: `Cmd+Shift+Delete`
- Check Vercel build logs for errors
- Ensure all files were committed to git

### If Supabase Not Working:
- Verify environment variables are set in Vercel
- Check that variable names match exactly
- Redeploy after setting variables

### If Images Not Loading:
- Check public/icons/ files exist
- Check public/manifest.json references
- Verify nAnoLogo.png in src/assets/

## 📋 What Changed in This Update

- ✅ Fixed all 8 figma:asset imports
- ✅ Added nAnoLogo.png to GlobalHeader and LandingPage
- ✅ Created proper icon files (SVG)
- ✅ Set up environment variables
- ✅ Configured Vite, PostCSS, and Vercel settings
- ✅ All components integrated
- ✅ Build passes with no errors

## 🚀 After Environment Variables Are Set

Your app will have:
- ✅ Working Supabase authentication
- ✅ User login & signup
- ✅ Subscription tiers
- ✅ Stripe payment integration (when configured)
- ✅ PWA capabilities
- ✅ Offline support

---

**Next: Complete the deployment steps above, then test the live app!**
