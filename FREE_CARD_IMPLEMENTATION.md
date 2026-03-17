# One Free Card Per New Account - Implementation

## Overview

When a user creates an account in nAnoCards, they automatically get:
- ✅ Free tier subscription
- ✅ Ability to create **1 free card** immediately
- ✅ User profile stored in Supabase
- ✅ All subscription data initialized in KV store

## How It Works

### Account Creation Flow

**1. User Signs Up** → SignupScreen.tsx
```
Email + Password → POST /make-server-d91f8206/auth/signup
```

**2. Backend Creates Account** → supabase/functions/server/index.tsx (line ~1573)
```
✅ Creates Supabase Auth user (auto-confirmed)
✅ Creates user profile in public.users table (subscription_tier: "free", points: 0)
✅ Initializes KV store subscription data:
   - user:{userId}:subscription = {tier: "free", status: "active", ...}
   - user:{userId}:cardCount = 0
   - user:{userId}:points = 0
```

**3. User Redirected to App** → LoginScreen/SignupScreen clears guestMode flag
```
localStorage.removeItem('guestMode')
Navigate to /app (authenticated)
```

### Card Creation Limits

When user tries to create a card, the backend checks:

**File:** `supabase/functions/server/index.tsx` line ~117-130

```typescript
// Get user's subscription tier
const subscription = await kv.get(`user:${user.id}:subscription`);
const userTier = subscription?.tier || 'free';

// Define card limits per tier
const cardLimits: { [key: string]: number } = {
  'free': 1,           // ✅ NEW USERS CAN CREATE 1 CARD
  'student': 2,
  'creator': 10,
  'pro': 49,
  'enterprise': 999999,
  'custom': 999999,
};

const tierLimit = cardLimits[userTier] || 1;

if (userCardCount >= tierLimit) {
  // Return error with upgrade suggestion
  return c.json({ 
    error: `Card limit reached for free tier (1 card max). Upgrade to Student (2 cards), Creator (10 cards), or Pro (49 cards) to create more cards.`,
    tierLimit,
    currentCount: userCardCount,
    tier: userTier
  }, 403);
}
```

### Card Counter Management

When a card is created:
1. User's card count is incremented: `user:{userId}:cardCount++`
2. If count >= limit, next card creation is rejected with 403 error
3. User is prompted to upgrade tier

## Files Modified

### 1. **supabase/functions/server/index.tsx** (Lines 1606-1633)

**Added to POST /auth/signup endpoint:**
```typescript
// Store initial subscription info in KV store for card limit checking
const newSubscription = {
  tier: "free",
  status: "active",
  expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
  createdAt: new Date().toISOString(),
};
await kv.set(`user:${data.user.id}:subscription`, newSubscription);

// Initialize card count to 0
await kv.set(`user:${data.user.id}:cardCount`, 0);

// Initialize points to 0
await kv.set(`user:${data.user.id}:points`, 0);
```

**Why?** The card creation endpoint checks `kv.get('user:{userId}:subscription')` to get the tier. Without this, it would default to 'free' but wouldn't have the proper subscription data structure.

### 2. **src/app/components/LoginScreen.tsx** (Already Fixed)

Clears guest mode flag on successful login
```typescript
localStorage.removeItem('guestMode');
localStorage.removeItem('guestVisits');
```

### 3. **src/app/components/SignupScreen.tsx** (Already Fixed)

Clears guest mode flag on successful account creation
```typescript
localStorage.removeItem('guestMode');
localStorage.removeItem('guestVisits');
```

## Testing the Feature

### Test Case 1: Create Account and Create 1 Card ✅

1. Go to https://nanocards.now/signup
2. Create account:
   - Email: `test@example.com`
   - Password: `Test1234`
   - Display Name: `Test User`
3. Should see: "Account created successfully"
4. Redirected to /app
5. Navigate to /app/create-card
6. Fill form and create card
7. Should succeed (Card 1/1)
8. Try to create another card
9. Should see error: "Card limit reached for free tier (1 card max). Upgrade to..."

### Test Case 2: Verify Tier Display ✅

After account creation:
1. Go to account settings or profile
2. Should show: "Subscription Tier: Free"
3. Should show: "Cards Created: 1/1"
4. Should show: "Points: 0"

### Test Case 3: Login After Account Creation ✅

1. Create account on https://nanocards.now/signup
2. Close browser or log out
3. Go to https://nanocards.now/login
4. Log in with same credentials
5. Should NOT see "Guest Mode" in header
6. Should see authenticated user profile
7. Should still have 1/1 card limit

## Database Structure

### PostgreSQL (public.users table)
```sql
id: UUID
email: string
display_name: string
subscription_tier: "free" | "student" | "creator" | "pro" | "enterprise"
points: integer
created_at: timestamp
```

### Supabase KV Store
```
user:{userId}:subscription = {
  tier: "free",
  status: "active",
  expiresAt: ISO timestamp,
  createdAt: ISO timestamp
}

user:{userId}:cardCount = 0

user:{userId}:points = 0
```

## Upgrade Path

When user hits card limit (1 card):
- Error message shows: "Upgrade to Student (2 cards), Creator (10 cards), or Pro (49 cards)"
- Link to `/subscription` page with pricing tiers
- After payment, tier updated in both PostgreSQL and KV store
- Card limit immediately increases

## Status

✅ **IMPLEMENTED AND READY FOR TESTING**

### Checklist
- [x] Signup endpoint creates subscription in KV store
- [x] Card creation checks subscription tier
- [x] Free tier limited to 1 card
- [x] Card count incremented on creation
- [x] Guest mode cleared on signup
- [x] Guest mode cleared on login
- [x] Error message guides user to upgrade

### Pending
- [ ] Test account creation and card limit in production
- [ ] Verify tier display in UI
- [ ] Verify card count increment
- [ ] Test upgrade flow when hitting limit
