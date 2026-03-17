# nAnoCards Production Migration Guide

## ✅ Files TO MIGRATE (Frontend Code Only)

### Core Application Files
```
/src/app/App.tsx
/src/app/routes.ts
/src/app/types.ts
/src/main.tsx
```

### All Components (Copy entire directories)
```
/src/app/components/
  - All .tsx files in this directory
  - Including all subdirectories (ui/, figma/)
```

### Hooks & Utilities
```
/src/app/hooks/
  - useAuth.ts
  - useCards.ts
  - useGuestMode.ts
  - useLikes.ts

/src/app/utils/
  - cardFilters.ts
```

### Constants & Data
```
/src/app/constants/
  - icons.ts
  - stages.ts
  - subscriptionTiers.ts

/src/app/data/
  - demoCards.ts
```

### Styles
```
/src/styles/
  - fonts.css
  - index.css
  - tailwind.css
  - theme.css
```

### Public Assets (if modified)
```
/public/
  - manifest.json (PWA manifest)
  - sw.js (Service Worker)
  - offline.html
  - *.html (icon generators if needed)
```

### Build Configuration
```
/package.json (for dependencies only - merge carefully)
/vite.config.ts
/postcss.config.mjs
/index.html
/vercel.json (if deploying to Vercel)
```

### Imported Assets (if any)
```
/src/imports/ (if you have any imported images or assets)
```

---

## ❌ Files NOT TO MIGRATE (Keep Production Versions)

### Backend Files - KEEP YOUR PRODUCTION VERSIONS
```
/supabase/functions/server/
  - index.tsx
  - kv_store.tsx
  - Any other backend files

DO NOT overwrite these - your production backend is already set up!
```

### Environment Configuration - KEEP YOUR PRODUCTION VERSIONS
```
/utils/supabase/info.tsx
  - Contains your production projectId and publicAnonKey
  - DO NOT overwrite with development values!
```

### Documentation Files - Optional
```
/*.md files (all markdown documentation)
  - These are helpful but not required for the app to function
  - Migrate only if you want updated documentation
```

---

## 🔧 Shared Library Files - REVIEW BEFORE COPYING

### Supabase Client Configuration
```
/src/lib/supabase.ts
```

**ACTION REQUIRED:**
1. Open this file in both development and production
2. Verify it imports from `/utils/supabase/info.tsx` (it should)
3. If the file is identical, you can copy it
4. If your production version has custom modifications, keep those

This file should automatically use your production endpoints because it imports from `info.tsx`.

---

## 📋 Migration Steps

### Step 1: Backup Production
```bash
# In your production environment
# Create a backup branch or download all files
```

### Step 2: Copy Frontend Files
Copy these directories/files from development to production:
1. `/src/app/` (entire directory)
2. `/src/styles/` (entire directory)
3. `/src/main.tsx`
4. `/public/` (if you made PWA changes)

### Step 3: Update Dependencies
```bash
# Compare package.json files
# Install any new dependencies in production
npm install
# or
pnpm install
```

### Step 4: Verify Configuration Files
Ensure these are NOT overwritten in production:
- `/utils/supabase/info.tsx` - Should contain YOUR production values
- `/supabase/functions/` - Should contain YOUR production backend

### Step 5: Test Locally (Optional)
If you want to test with production config locally:
```bash
# In development, temporarily swap info.tsx to production values
# Run: npm run dev
# Test all features
# Restore development info.tsx when done
```

### Step 6: Deploy to Production
```bash
# Vercel deployment
vercel --prod

# Or push to your production Git branch
git push origin main
```

---

## 🔍 Key Files Updated in This Session

### Major Changes:
1. **TopCardsScreen.tsx** - Center-aligned cards, dark gray card numbers, new video URL
2. **HamburgerMenu.tsx** - Reordered menu (Top nAnoCards first, Demo moved to second-to-last)
3. **HomeScreen.tsx** - Logo redirects to /top-cards instead of app view
4. **CheckoutScreen.tsx** - Added age verification checkbox (13+ years)
5. **NanoCardComponent.tsx** - Dark gray card numbers with hover effects

### All Recent Updates:
```
/src/app/components/TopCardsScreen.tsx
/src/app/components/HamburgerMenu.tsx
/src/app/components/HomeScreen.tsx
/src/app/components/CheckoutScreen.tsx
/src/app/components/NanoCardComponent.tsx
```

---

## ⚠️ Critical Reminders

1. **DO NOT** copy `/utils/supabase/info.tsx` to production
2. **DO NOT** overwrite your production backend (`/supabase/functions/`)
3. **DO** keep your production Stripe keys and Supabase secrets
4. **DO** test the checkout flow after migration (age verification checkbox)
5. **DO** verify Google OAuth still works with your production credentials

---

## 🧪 Post-Migration Testing Checklist

- [ ] Login with Google OAuth works
- [ ] Top nAnoCards page loads and displays correctly
- [ ] Cards are center-aligned
- [ ] Card numbers show in dark gray
- [ ] Hamburger menu shows correct order
- [ ] Home screen logo redirects to Top nAnoCards
- [ ] Checkout flow includes age verification checkbox
- [ ] Video plays correctly for card #001
- [ ] PWA install prompt appears
- [ ] Service worker caches assets
- [ ] All API calls use production endpoints
- [ ] Stripe checkout works with production keys

---

## 📞 Support

If you encounter issues after migration:
1. Check browser console for errors
2. Verify `/utils/supabase/info.tsx` has correct production values
3. Ensure all dependencies are installed (`node_modules/`)
4. Clear browser cache and test again
5. Check Vercel deployment logs (if using Vercel)

---

**Last Updated:** March 16, 2026
**Migration Type:** Frontend-Only (Preserving Backend & Config)
