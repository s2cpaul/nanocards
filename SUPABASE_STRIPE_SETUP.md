# Supabase & Stripe Integration Guide

## Current Setup

### Supabase Configuration

**Project ID:** `ffhowwvlytnoulijclac`

#### Environment Variables
The app uses environment variables for Supabase credentials:

```bash
# .env.local
VITE_SUPABASE_PROJECT_ID=ffhowwvlytnoulijclac
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These are loaded in `utils/supabase/info.tsx`:
```typescript
export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
```

#### Security Note
- ✅ The anon key is **safe to expose client-side** (it's a public key by design)
- ✅ Row Level Security (RLS) policies in Supabase protect data
- ✅ Never expose the **Secret key** in client-side code
- ✅ `.env.local` is in `.gitignore` and not committed to git

### Vercel Deployment

For Vercel deployment, add environment variables in Vercel dashboard:

1. Go to your Vercel project Settings
2. Add Environment Variables:
   ```
   VITE_SUPABASE_PROJECT_ID = ffhowwvlytnoulijclac
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

The app will automatically use these in production.

## Stripe Integration

### Setup Checklist

- [ ] Create Stripe account at https://stripe.com
- [ ] Get **Publishable Key** (pk_live_... or pk_test_...)
- [ ] Get **Secret Key** (sk_live_... or sk_test_...)
- [ ] Create price IDs for each tier:
  - [ ] Student tier
  - [ ] Creator tier
  - [ ] Pro tier
  - [ ] Enterprise tier

### Configuration

Add Stripe keys to `.env.local`:
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_51234567890...
```

**Note:** Store Secret Key in Supabase Edge Function only (not client-side)

### Supabase Edge Function

The `make-server-d91f8206` function handles:
- Stripe payment processing
- Subscription creation
- Invoice management

Deploy using Supabase CLI:
```bash
supabase functions deploy make-server-d91f8206
```

Function should have access to:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## File Structure

```
nAnoCards/
├── .env.local                      # Local environment variables (gitignored)
├── .env.example                    # Template for environment variables
├── utils/
│   └── supabase/
│       └── info.tsx               # Supabase config exports
├── src/
│   ├── lib/
│   │   └── supabase.ts            # Supabase client initialization
│   └── app/
│       └── components/
│           ├── LoginScreen.tsx     # Email/password authentication
│           ├── SignupScreen.tsx    # Account creation
│           ├── CheckoutScreen.tsx  # Stripe payment form
│           └── SubscriptionScreen.tsx # Subscription tier selection
└── supabase/
    └── functions/
        └── server/                # Edge functions directory
```

## Authentication Flow

### User Signup → Login → Checkout

1. **Signup** (SignupScreen.tsx)
   - User creates account via `supabase.auth.signUp()`
   - Email verification link sent

2. **Login** (LoginScreen.tsx)
   - User logs in via `supabase.auth.signInWithPassword()`
   - Session persisted in localStorage

3. **Subscription** (SubscriptionScreen.tsx)
   - User selects tier
   - Redirected to checkout

4. **Checkout** (CheckoutScreen.tsx)
   - Stripe payment form
   - Create subscription via Edge Function
   - Update user tier in database

## API Endpoints

### Main API
- **Base URL:** `https://ffhowwvlytnoulijclac.supabase.co/functions/v1/make-server-d91f8206`
- **Requests:** Include auth headers with Bearer token

### Available Functions
- `POST /cards` - Create card
- `GET /cards` - Fetch cards
- `PUT /cards/:id` - Update card
- `DELETE /cards/:id` - Delete card
- `POST /checkout` - Create Stripe session
- `POST /webhooks/stripe` - Handle Stripe events

## Development vs Production

### Development
- Uses `.env.local` with test credentials
- Supabase project: `ffhowwvlytnoulijclac`
- Stripe Test Mode (pk_test_*, sk_test_*)

### Production
- Uses Vercel environment variables
- Same Supabase project (production RLS policies active)
- Stripe Live Mode (pk_live_*, sk_live_*)

## Security Checklist

- [ ] Enable RLS on all Supabase tables
- [ ] Never commit `.env.local` to git
- [ ] Use test Stripe keys in development
- [ ] Rotate Stripe keys if compromised
- [ ] Set up Stripe webhooks for payment events
- [ ] Enable 2FA on Supabase & Stripe accounts
- [ ] Review RLS policies monthly
- [ ] Monitor Vercel environment variables access

## Troubleshooting

### "supabaseKey is required"
- Check `.env.local` exists with `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`

### Stripe payments not working
- Verify `VITE_STRIPE_PUBLIC_KEY` in `.env.local`
- Check Stripe price IDs match subscription tiers
- Review Edge Function logs in Supabase dashboard

### Authentication fails
- Check Supabase project is active
- Verify anon key has auth enabled
- Check email configuration in Supabase settings

## Next Steps

1. Set up Supabase table schema for subscriptions
2. Create Stripe price IDs for each tier
3. Deploy Edge Function with Stripe integration
4. Test checkout flow in Stripe test mode
5. Configure webhooks for production events
6. Set up email templates for notifications
7. Deploy to Vercel and enable production variables
