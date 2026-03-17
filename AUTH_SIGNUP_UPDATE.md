# Auth Signup Update - Server Integration

## Changes Made

### 1. `/supabase/functions/server/index.tsx`
**Added new `/auth/signup` endpoint** (lines 1573-1631)

**What it does:**
- Accepts POST requests with `{ email, password, displayName }`
- Creates user account via Supabase Auth with auto-confirmed email
- Creates user profile in `public.users` table with:
  - User ID
  - Email
  - Display name
  - Default tier: "free"
  - Default points: 0
  - Created timestamp

**Key features:**
- Validates email and password (min 6 chars)
- Returns user object on success
- Handles errors gracefully
- Logs all operations for debugging

### 2. `/src/app/components/SignupScreen.tsx`
**Updated to call server endpoint instead of `supabase.auth.signUp()`**

**Changes:**
- Imports `API_BASE_URL` from supabase.ts
- `handleSignup` now calls: `POST {API_BASE_URL}/make-server-d91f8206/auth/signup`
- Passes email, password, and displayName to server
- Handles server response and error messages
- UI and validation logic unchanged

## Flow Diagram

```
User fills form
     ↓
SignupScreen validates input
     ↓
POST to /auth/signup server endpoint
     ↓
Server creates Supabase Auth user
     ↓
Server creates user profile record
     ↓
Return user object to client
     ↓
Navigate to /app
```

## Testing

1. **Local Testing:**
   ```bash
   npm run dev
   # Navigate to /signup
   # Fill form and submit
   ```

2. **Production Testing:**
   - Environment variables must be set in Vercel:
     - `VITE_SUPABASE_PROJECT_ID`
     - `VITE_SUPABASE_ANON_KEY`
   - Edge Function must be deployed to Supabase

## Benefits

✅ Centralized auth logic on server
✅ Better error handling
✅ Automatic profile creation
✅ More secure (no direct auth calls from client)
✅ Consistent with other endpoints (/admin/create-account)

## Next Steps

1. Deploy Edge Functions to Supabase:
   ```bash
   supabase functions deploy server
   ```

2. Test signup flow in production

3. Monitor logs for any issues
