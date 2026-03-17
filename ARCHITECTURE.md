# nAnoCards Architecture Documentation

## Overview
nAnoCards is a mobile-first Progressive Web App for sharing AI product pitch cards. The application is built with React, TypeScript, Tailwind CSS, and Supabase backend.

## Project Structure

```
/src/app/
├── components/          # React components
│   ├── ui/             # Reusable UI components (buttons, inputs, selects)
│   ├── figma/          # Figma-specific components
│   ├── MainAppRefactored.tsx    # Main app component (uses hooks & smaller components)
│   ├── LoginScreen.tsx           # Login/authentication screen
│   ├── CreateCard.tsx            # Card creation form
│   ├── TrainingScreen.tsx        # Training modules
│   ├── SubscriptionScreen.tsx    # Pricing & subscriptions
│   ├── NanoCardComponent.tsx     # Individual card component
│   ├── GuestBanner.tsx           # Guest mode banner
│   ├── SearchBar.tsx             # Search input component
│   ├── FilterPanel.tsx           # Filter/sort panel
│   └── BottomNav.tsx             # Mobile bottom navigation
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication state management
│   ├── useCards.ts     # Card CRUD operations
│   ├── useLikes.ts     # Like functionality
│   └── useGuestMode.ts # Guest mode visit tracking
│
├── data/               # Static data and constants
│   └── demoCards.ts    # Demo cards for guest mode
│
├── constants/          # Application constants
│   ├── icons.ts        # Icon mappings
│   └── subscriptionTiers.ts  # Subscription tier configuration
│
├── utils/              # Utility functions
│   └── cardFilters.ts  # Card filtering and sorting logic
│
├── types.ts            # TypeScript type definitions
└── routes.ts           # React Router configuration

/supabase/functions/server/
└── index.tsx           # Backend API (Hono server)
```

## Architecture Patterns

### 1. **Component Composition**
- Large components are broken into smaller, focused components
- Each component has a single responsibility
- Components are reusable and testable

### 2. **Custom Hooks**
- Business logic is extracted into custom hooks
- Hooks manage specific concerns (auth, data fetching, likes, etc.)
- Makes state logic reusable across components

### 3. **Utility Functions**
- Pure functions for data transformation
- No side effects in utility functions
- Easy to test and reason about

### 4. **Data Separation**
- Static data (demo cards, constants) is separated from components
- Configuration is centralized
- Easy to update without touching component code

## Key Components

### MainAppRefactored
The main application component that orchestrates the card feed. Uses:
- `useAuth()` for authentication
- `useCards()` for card data
- `useLikes()` for like functionality
- `useGuestMode()` for guest visit tracking
- Smaller UI components (SearchBar, FilterPanel, BottomNav, etc.)

### Custom Hooks

#### useAuth()
Manages authentication state including:
- Current user email
- Guest mode status
- Login/logout functionality
- Session management

#### useCards()
Handles card operations:
- Loading cards from backend
- Liking cards
- Deleting cards
- Loading state management

#### useLikes()
Manages liked cards:
- Tracks which cards user has liked
- Persists likes to localStorage
- Toggle like functionality

#### useGuestMode()
Tracks guest visits:
- Counts remaining visits
- Banner visibility
- Visit increment logic

## Subscription Tiers

Defined in `/src/app/constants/subscriptionTiers.ts`:

1. **Student** - FREE (2 cards, .edu/.k12/.mil only)
2. **Creator** - $4.99/month (10 cards)
3. **Pro** - $9.99/month (49 cards)
4. **Enterprise** - $12.99/month (100 team members)

## Backend API

Server endpoint: `/make-server-d91f8206/`

### Main Routes:
- `POST /cards` - Create new card
- `GET /cards` - Get all cards
- `POST /cards/:id/like` - Like a card
- `DELETE /cards/:id` - Delete a card
- `POST /subscription/create-checkout` - Create Stripe checkout session

## State Management

### Local State
- Component-specific UI state (modals, filters, etc.)
- Managed with useState

### Derived State
- Filtered/sorted cards computed with useMemo
- Prevents unnecessary recalculations

### Persistent State
- User preferences in localStorage
- Liked cards per user
- Guest visit count
- User points

## Styling

### Tailwind CSS
- Mobile-first responsive design
- Navy blue color scheme (#1e3a8a)
- Simple line icons (lucide-react)
- Clean white cards

### PWA Features
- Installable on mobile devices
- Offline support (via service worker)
- Install prompt component

## Gamification

- Users earn 10 points per correct quiz answer
- Points stored in localStorage
- Displayed in header with trophy icon
- Subtle pulse animation on star for correct answers

## Best Practices

### 1. **Component Size**
- Keep components under 200 lines
- Extract logic into hooks
- Break large components into smaller ones

### 2. **File Organization**
- Group by feature/concern
- Use index files for exports
- Keep related files together

### 3. **Type Safety**
- All types defined in types.ts
- No implicit any types
- Props interfaces for all components

### 4. **Performance**
- Use useMemo for expensive computations
- Lazy load routes if needed
- Optimize images with proper formats

### 5. **Accessibility**
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support

## Scaling Guidelines

### Adding New Features
1. Create hook if it involves state/logic
2. Create component if it's UI
3. Add constants to appropriate file
4. Update types.ts for new data structures

### Adding New Routes
1. Create component in /components
2. Add route to routes.ts
3. Update navigation components

### Adding New API Endpoints
1. Add route to /supabase/functions/server/index.tsx
2. Update relevant hooks to call new endpoint
3. Update types if needed

## Testing Strategy

### Unit Tests
- Test utility functions in isolation
- Test custom hooks with @testing-library/react-hooks

### Integration Tests
- Test components with user interactions
- Test API routes with mock data

### E2E Tests
- Test critical user flows
- Test payment integration

## Performance Optimization

### Current Optimizations
- useMemo for filtered/sorted data
- Lazy loading of components (can be added)
- Optimized images with ImageWithFallback

### Future Optimizations
- Virtual scrolling for large card lists
- Image lazy loading
- Route-based code splitting
- Service worker caching strategies

## Security Considerations

### Frontend
- Never expose SUPABASE_SERVICE_ROLE_KEY
- Use getAuthHeaders() for authenticated requests
- Validate user input before submission

### Backend
- Verify auth tokens on protected routes
- Validate all input data
- Use environment variables for secrets
- Implement rate limiting (future)

## Deployment

### Environment Variables
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- Price IDs for each tier

### Build Process
1. Run type checking: `tsc --noEmit`
2. Build application: `npm run build`
3. Deploy to hosting platform
4. Deploy Supabase functions separately

## Future Enhancements

### Planned Features
1. Team collaboration features
2. Advanced analytics dashboard
3. LMS integrations
4. Social sharing improvements
5. Bulk card operations
6. Card templates
7. Video upload and hosting
8. Real-time collaboration

### Technical Debt
1. Add comprehensive test coverage
2. Implement error boundaries for all routes
3. Add analytics tracking
4. Implement proper logging system
5. Add performance monitoring
