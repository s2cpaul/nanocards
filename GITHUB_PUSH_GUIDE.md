# Quick Git Push Guide

## Step 1: Add Your GitHub Remote

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:

```bash
cd /Users/carajohnson/nAnoCards
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/nAnoCards.git
git push -u origin main
```

## Step 2: Vercel Auto-Deployment

Once pushed to GitHub:
1. Vercel will automatically detect the push
2. It will trigger a new build with the latest code
3. The deployment will complete in 1-2 minutes
4. Your site will show the new version at https://nanocards-psi.vercel.app/

## Step 3: Add Environment Variables (CRITICAL)

While Vercel builds, go to:
1. **https://vercel.com/dashboard**
2. Select your **nanocards-psi** project
3. **Settings** → **Environment Variables**
4. Add:
   - `VITE_SUPABASE_PROJECT_ID` = `ffhowwvlytnoulijclac`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaG93d3ZseXRub3VsaWpjbGFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTgwOTAsImV4cCI6MjA4NzYzNDA5MH0.-JGGJDwK6yd4K6aJj6nDIW74tts6GMyPyBPJJtIaJHg`

5. **Redeploy** the latest build

## Step 4: Test

After deployment, visit https://nanocards-psi.vercel.app/ and:
- [ ] Landing page shows new nAnoLogo
- [ ] "Development Mode" button visible
- [ ] Login/Signup buttons work
- [ ] No console errors

---

**Don't know your GitHub username?** Check: https://github.com/settings/profile
