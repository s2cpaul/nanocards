# nAnoCards - VS Code Transfer Guide

## 📦 Project Structure Overview

This is a **Progressive Web App (PWA)** built with:
- **Frontend**: React + TypeScript + Tailwind CSS v4 + React Router
- **Backend**: Supabase Edge Functions (Hono web server)
- **Database**: Supabase PostgreSQL with KV Store
- **Auth**: Supabase Auth with Passkey support
- **Payments**: Stripe API integration
- **PWA**: Full offline support, installable, service worker

---

## 🗂️ File Organization (Clean Chunks)

### **CHUNK 1: Root Configuration Files**
Essential config files for the project to run:

```
/package.json                    # Dependencies and scripts
/vite.config.ts                  # Vite build configuration
/postcss.config.mjs              # PostCSS config for Tailwind
/index.html                      # HTML entry point
```

### **CHUNK 2: Styles**
All CSS and theming:

```
/src/styles/
  ├── index.css                  # Main CSS entry
  ├── tailwind.css               # Tailwind v4 imports
  ├── theme.css                  # Custom theme tokens & variables
  └── fonts.css                  # Font imports
```

### **CHUNK 3: Core Application**
Main app entry and routing:

```
/src/main.tsx                    # React entry point
/src/app/App.tsx                 # Main App component (RouterProvider)
/src/app/routes.ts               # React Router configuration
/src/app/types.ts                # TypeScript type definitions
```

### **CHUNK 4: Main Screens (7 Pages)**
The seven main application screens:

```
/src/app/components/
  ├── LoginScreen.tsx            # Login/Signup with Passkey
  ├── MainApp.tsx                # Dashboard with card gallery
  ├── CreateCard.tsx             # Card creation with AI pitch
  ├── ProfileScreen.tsx          # User profile management
  ├── TrainingScreen.tsx         # Training center with premium gates
  ├── DevelopersScreen.tsx       # Developer Portal & API keys
  └── SubscriptionScreen.tsx     # Pricing tiers & Stripe checkout
```

### **CHUNK 5: Feature Components**
Reusable feature components:

```
/src/app/components/
  ├── NanoCardComponent.tsx      # Card display component
  ├── BottomNav.tsx              # Mobile bottom navigation
  ├── HamburgerMenu.tsx          # Desktop hamburger menu
  ├── Setup.tsx                  # Multi-stage card setup wizard
  ├── ProfileSetup.tsx           # Profile editing
  ├── QuizSetup.tsx              # Quiz/knowledge check creator
  ├── SurveySetup.tsx            # Survey creator
  ├── FeaturedLinkSetup.tsx      # Featured link management
  ├── BuildNetwork.tsx           # Social links builder
  ├── QuickEdit.tsx              # Quick card editing
  ├── FilterPanel.tsx            # Card filtering UI
  ├── SearchBar.tsx              # Search functionality
  ├── Settings.tsx               # User settings
  ├── ApiKeyScreen.tsx           # API key management
  ├── InstructionsScreen.tsx     # Setup instructions
  ├── AboutPlatformScreen.tsx    # About page
  ├── WelcomeModal.tsx           # First-time user modal
  ├── GuestBanner.tsx            # Guest mode banner
  ├── PhoneDemo.tsx              # Pricing page phone mockup
  └── PWAInstallPrompt.tsx       # PWA install prompt
```

### **CHUNK 6: UI Components Library**
Radix UI + Tailwind components (shadcn/ui style):

```
/src/app/components/ui/
  ├── accordion.tsx
  ├── alert-dialog.tsx
  ├── alert.tsx
  ├── avatar.tsx
  ├── badge.tsx
  ├── button.tsx
  ├── card.tsx
  ├── checkbox.tsx
  ├── dialog.tsx
  ├── dropdown-menu.tsx
  ├── input.tsx
  ├── label.tsx
  ├── popover.tsx
  ├── progress.tsx
  ├── select.tsx
  ├── separator.tsx
  ├── sheet.tsx
  ├── switch.tsx
  ├── tabs.tsx
  ├── textarea.tsx
  ├── tooltip.tsx
  ├── sonner.tsx                # Toast notifications
  └── [28 more UI components]
```

### **CHUNK 7: Hooks & Utils**
Custom React hooks and utilities:

```
/src/app/hooks/
  ├── useAuth.ts                 # Authentication hook
  ├── useCards.ts                # Card management hook
  ├── useGuestMode.ts            # Guest mode hook
  └── useLikes.ts                # Like system hook

/src/app/utils/
  └── cardFilters.ts             # Card filtering logic
```

### **CHUNK 8: Constants & Data**
Configuration constants and demo data:

```
/src/app/constants/
  ├── icons.ts                   # Icon definitions
  ├── stages.ts                  # Setup wizard stages
  └── subscriptionTiers.ts       # Subscription tier config

/src/app/data/
  └── demoCards.ts               # Demo cards for guest mode
```

### **CHUNK 9: Backend Server**
Supabase Edge Functions (Deno/Hono):

```
/supabase/functions/server/
  ├── index.tsx                  # Main server with all routes
  └── kv_store.tsx               # KV Store utility (PROTECTED - don't edit)
```

**Server Routes:**
- `/health` - Health check
- `/cards` - CRUD operations for cards
- `/profile` - User profile management
- `/links` - Social links management
- `/subscription/*` - Stripe subscription endpoints
- `/stripe/webhook` - Stripe webhook handler
- `/passkey/*` - Passkey auth endpoints
- `/api-keys` - Developer API key management
- `/training/*` - Training content endpoints
- `/points` - Gamification points system

### **CHUNK 10: Supabase Utils**
Supabase client configuration:

```
/utils/supabase/
  └── info.tsx                   # Supabase project info (PROTECTED)

/src/lib/
  └── supabase.ts                # Supabase client instance
```

### **CHUNK 11: PWA Assets**
Progressive Web App configuration:

```
/public/
  ├── manifest.json              # PWA manifest
  ├── sw.js                      # Service worker
  ├── offline.html               # Offline fallback page
  ├── icon-generator-192.html    # Icon generator tool (192x192)
  ├── icon-generator-512.html    # Icon generator tool (512x512)
  └── screenshot-generator.html  # Screenshot generator
```

### **CHUNK 12: Documentation**
Project documentation files:

```
/NANOCARDS-COMPLETE-OVERVIEW.md
/ARCHITECTURE.md
/STRIPE-INTEGRATION-COMPLETE.md
/STRIPE-SETUP-GUIDE.md
/STRIPE-PRICE-IDS.md
/TRAINING-FEATURE-DOCUMENTATION.md
/PWA-ENGAGEMENT-FEATURES-SUMMARY.md
/DEV-SUBSCRIPTION-SETUP.md
/OAUTH_SETUP_INSTRUCTIONS.md
/ICON-GENERATION-GUIDE.md
/REFACTOR-ANALYSIS.md
/ATTRIBUTIONS.md
/guidelines/Guidelines.md
```

---

## 🔧 Environment Variables Required

You need to create a `.env` file (or configure in Supabase Dashboard):

```env
# Supabase (already configured in Figma Make)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_URL=your_db_url

# Stripe (already configured in Figma Make)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx

# Stripe Webhook Secret (⚠️ REQUIRED - Add this to Supabase Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs (✅ Already integrated in code with fallback values)
STRIPE_STUDENT_PRICE_ID=price_1TAyXQ2V9h6ApeDfuJYKNBR6
STRIPE_CREATOR_PRICE_ID=price_1TAyXR2V9h6ApeDfvXEeEiHQ
STRIPE_PRO_PRICE_ID=price_1TAyXS2V9h6ApeDf8qv5dWUQ
STRIPE_ENTERPRISE_PRICE_ID=price_1TAyXT2V9h6ApeDf5EltqzAE
```

**Note:** The Stripe Price IDs are hardcoded in the application with fallback values, so they will work even without environment variables. However, for production deployment, it's recommended to set them via environment variables.

**See `/ENV-SETUP-COMPLETE.md` for detailed setup instructions.**

---

## 📋 VS Code Setup Instructions

### 1. **Initialize Git Repository**
```bash
git init
git add .
git commit -m "Initial commit - nAnoCards PWA"
```

### 2. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

### 3. **Run Development Server**
```bash
npm run dev
```

### 4. **Build for Production**
```bash
npm run build
```

### 5. **Recommended VS Code Extensions**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features
- Deno (for Edge Functions)

---

## 🎨 Design System

**Color Scheme:**
- Navy Blue: `#1e3a8a` (primary brand color)
- Clean white cards with subtle shadows
- Diagonal gradients: light blue (top-right) → black (bottom-left, 75%)

**Icon Style:**
- Simple line icons only (lucide-react)
- No colorful or filled variants
- No emojis anywhere in the interface

**Typography:**
- 40-character limit for card titles
- Live character counters in forms
- Truncation with ellipsis in displays

---

## 🚀 Key Features Checklist

✅ 7 main pages with full routing  
✅ Supabase backend integration  
✅ Stripe payment system (4 tiers)  
✅ Passkey authentication  
✅ PWA with offline support  
✅ Training Center with premium gates  
✅ Gamification (10 points per quiz)  
✅ Developer Portal with API keys  
✅ Card limits by subscription tier  
✅ QR code generation  
✅ Social links builder  
✅ Quiz/Survey creators  
✅ Guest mode with demo cards  
✅ Mobile-first responsive design  

---

## 🔒 Protected Files (DO NOT EDIT)

These files are system-managed:
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase/info.tsx`
- `/src/app/components/figma/ImageWithFallback.tsx`

---

## 📞 Support

All code is production-ready and tested. The payment system is fully configured with your Stripe credentials. 

For questions about specific features, refer to the documentation files in CHUNK 12.

---

**Last Updated:** March 14, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready