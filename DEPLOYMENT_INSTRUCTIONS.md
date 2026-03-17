# Deployment Instructions - Auth Signup Update

## ✅ Frontend Complete
Your frontend code is now pushed to GitHub and will automatically deploy to Vercel.

## 🔄 Status

**Frontend:**
- ✅ SignupScreen.tsx updated to use `/auth/signup` server endpoint
- ✅ Build passes successfully (1773 modules)
- ✅ Pushed to GitHub
- ✅ Vercel will auto-deploy within 1-2 minutes

**Backend:**
- ✅ `/auth/signup` endpoint added to `supabase/functions/server/index.tsx`
- ⏳ Needs to be deployed to Supabase Edge Functions

## 📋 Step 4: Deploy Supabase Edge Function

### Option A: Deploy via CLI

```bash
# Install/update Supabase CLI if needed
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref ffhowwvlytnoulijclac

# Deploy the function
supabase functions deploy server
```

### Option B: Deploy via Supabase Dashboard

1. Go to: https://app.supabase.com/project/ffhowwvlytnoulijclac/functions
2. Click "Deploy Function"
3. Upload `supabase/functions/server/index.tsx`
4. Set environment variables (if needed):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`

## 🌐 Verify Environment Variables on Vercel

Go to: https://vercel.com/dashboard/nanocards-psi/settings/environment-variables

Make sure these are set for **Production**:
- ✅ `VITE_SUPABASE_PROJECT_ID` = `ffhowwvlytnoulijclac`
- ✅ `VITE_SUPABASE_ANON_KEY` = `eyJhbGc...` (your key)

## ✨ After Deployment

### Test Signup Locally
```bash
npm run dev
# Go to http://localhost:5173/signup
# Fill form and submit
# Should redirect to /app
```

### Test in Production
1. Go to https://nanocards-psi.vercel.app/signup
2. Create a test account
3. Should redirect to app page
4. Check browser DevTools Console for any errors

## 📊 Request Flow

```
User clicks "Create Account"
         ↓
SignupScreen validates input
         ↓
POST to https://functions.supabase.com/api/v1/functions/v1/server
    (endpoint: /make-server-d91f8206/auth/signup)
         ↓
Server receives: { email, password, displayName }
         ↓
Supabase Auth creates user (auto-confirmed)
         ↓
Server creates profile in public.users table
         ↓
Returns: { user: { id, email, display_name }, message: "..." }
         ↓
Client redirects to /app
```

## 🔐 Security Notes

- ✅ Password validation: min 6 chars (client + server)
- ✅ Email auto-confirmed (prevents email verification step)
- ✅ Profile auto-created with defaults (free tier, 0 points)
- ✅ User ID from Auth service used directly
- ✅ Server has Supabase service role access

## 🐛 Troubleshooting

### "Failed to create account"
Check:
- Edge Function is deployed
- Environment variables in Vercel are set
- Supabase is accessible
- Browser console for full error message

### "Passwords do not match"
- Check password validation in form
- Both password fields must be identical

### Profile not created but user exists
- User is created but profile creation failed
- User can still login (profile will be created on next login)

---

**Next:** Deploy edge function and test signup flow! 🚀
