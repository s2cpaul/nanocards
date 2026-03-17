# nAnoCards Development Setup

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5174`

4. **Build for production**
   ```bash
   npm run build
   ```

## Environment Variables

Required variables in `.env.local`:
- `VITE_SUPABASE_PROJECT_ID` - Your Supabase project ID
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## Project Structure

```
src/
├── main.tsx              # App entry point
├── app/
│   ├── App.tsx          # Main app component
│   ├── routes.tsx       # Route definitions
│   ├── types.ts         # TypeScript interfaces
│   ├── constants.ts     # App constants
│   └── components/      # React components
├── lib/
│   └── supabase.ts      # Supabase client
└── styles/
    ├── index.css        # Main stylesheet
    ├── tailwind.css     # Tailwind imports
    ├── theme.css        # Theme variables
    └── fonts.css        # Font imports
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Tech Stack

- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS v4** - Styling
- **Supabase** - Backend & Auth
- **Vite** - Build tool
- **TypeScript** - Type safety

## Design Rules

✓ Simple line icons in gray (no colorful icons)
✓ Red heart is the ONLY colored icon allowed
✓ No emojis
✓ Full-width text with minimal padding
✓ Clean, minimal UI

## Notes

- Icons in `/public/icons/` need to be generated/added manually
- Service Worker enabled for PWA functionality
- Offline page available at `/offline.html`
