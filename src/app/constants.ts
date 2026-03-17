/**
 * Universal Constants for nAnoCards App
 * 
 * RULE: Keep this app simple and use universal constants.
 * All shared values, labels, and configuration should be defined here
 * to ensure consistency across the entire application.
 * 
 * DESIGN RULES:
 * ============================================
 * 1. NO COLORFUL ICONS - Only simple line icons with no filled/multi-color variants
 *    ❌ BAD: Crown icon with yellow/orange gradient background
 *    ❌ BAD: CheckCircle icon in green color
 *    ❌ BAD: Filled icons or icons with multiple colors
 *    ✓ GOOD: Simple line icons in gray (text-gray-400, text-gray-600)
 *    ✓ EXCEPTION: Red heart (text-red-500 fill) is the ONLY colored icon allowed
 * 
 * 2. NO EMOJIS - Clean interface only
 *    ❌ BAD: ✓ ✗ 💡 🎯 emoji characters
 *    ✓ GOOD: Use line icons from lucide-react instead
 * 
 * 3. TEXT FULL WIDTH - Text must span left to right with minimal padding
 *    for full viewport use. Decorative icons must NOT limit text width.
 *    ❌ BAD: Large decorative icons that force text to wrap or limit width
 *    ❌ BAD: Excessive padding that reduces usable text area
 *    ✓ GOOD: Text spans full card width (left to right edges)
 *    ✓ GOOD: Minimal padding (px-2 to px-4 maximum)
 *    ✓ GOOD: Icons are small and inline, not blocking text flow
 * 
 * 4. RED HEART ONLY - The red heart is the ONLY colored icon allowed on cards.
 *    All other icons must be gray line icons (no fill, no color).
 *    ❌ BAD: Crown in yellow, Star in purple, CheckCircle in green
 *    ✓ GOOD: Heart in red (text-red-500 with fill)
 *    ✓ GOOD: All other icons in gray (text-gray-400 or text-gray-600)
 */

// ============================================
// SCREEN LABELS
// ============================================
export const SCREEN_LABELS = {
  LEARNING_AND_DEVELOPMENT: "Learning & Development",
  HOME: "Home",
  MY_CARDS: "My Cards",
  TOP_CARDS: "Top Cards",
  CREATE_CARD: "Create Card",
  PROFILE: "Profile",
  SUBSCRIPTION: "Subscription",
  DEVELOPER_PORTAL: "Developer Portal",
  SETTINGS: "Settings",
} as const;

// ============================================
// ROUTE PATHS
// ============================================
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  APP: "/app",
  TOP_CARDS: "/top-cards",
  CREATE: "/create",
  EDIT: "/edit/:id",
  TRAINING: "/training", // Route path stays as /training for backward compatibility
  SUBSCRIPTION: "/subscription",
  CHECKOUT: "/checkout",
  PROFILE: "/profile",
  PROFILE_SETUP: "/profile-setup",
  FEATURED_LINK: "/featured-link",
  BUILD_NETWORK: "/build-network",
  SETTINGS: "/settings",
  DEVELOPER_PORTAL: "/developer-portal",
} as const;

// ============================================
// SUBSCRIPTION TIERS
// ============================================
export const SUBSCRIPTION_TIERS = {
  FREE: "free",
  STUDENT: "student",
  CREATOR: "creator",
  PRO: "pro",
  ENTERPRISE: "enterprise",
} as const;

// ============================================
// GAMIFICATION
// ============================================
export const POINTS = {
  QUIZ_CORRECT_ANSWER: 10,
  KNOWLEDGE_CHECK_CORRECT: 10,
} as const;

// ============================================
// CARD LIMITS
// ============================================
export const CARD_LIMITS = {
  TITLE_MAX_LENGTH: 40,
  FREE_TIER_MAX_CARDS: 1,
  STUDENT_TIER_MAX_CARDS: 2,
  CREATOR_TIER_MAX_CARDS: 10,
  PRO_TIER_MAX_CARDS: 49,
  ENTERPRISE_TIER_MAX_CARDS: 99,
} as const;

// ============================================
// THE 6 STAGES OF INNOVATION
// ============================================
export const INNOVATION_STAGES = [
  "Idea",
  "Validation",
  "Planning",
  "Execution",
  "Growth",
  "Reinvention",
] as const;

export const INNOVATION_STAGES_DETAILED = [
  { value: "idea", label: "Idea" },
  { value: "validation", label: "Validation" },
  { value: "planning", label: "Planning" },
  { value: "execution", label: "Execution" },
  { value: "growth", label: "Growth" },
  { value: "reinvention", label: "Reinvention" },
] as const;

// ============================================
// ADMIN USERS
// ============================================
export const ADMIN_EMAILS = [
  "carapaulson1@gmail.com",
] as const;

// ============================================
// CATEGORY LABELS
// ============================================
export const LEARNING_CATEGORIES = {
  ALL: "All Categories",
  APPLIED_AI_LEADERSHIP: "Applied AI Leadership",
  CUSTOMER_SERVICE_TRAINING: "Customer Service Training",
  NANOCARDS_ACADEMY: "nAnoCards Academy",
} as const;

// ============================================
// UI TEXT
// ============================================
export const UI_TEXT = {
  MANAGE_LEARNING_CONTENT: "Manage Learning Content",
  LEARNING_BUTTON_LABEL: "Learning",
  NO_LEARNING_ACCESS: "No Learning & Development access",
} as const;

// ============================================
// TYPE EXPORTS
// ============================================
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];
export type LearningCategory = typeof LEARNING_CATEGORIES[keyof typeof LEARNING_CATEGORIES];