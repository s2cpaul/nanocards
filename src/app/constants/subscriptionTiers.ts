/**
 * Subscription tier configuration
 */

export interface SubscriptionTier {
  id: string;
  name: string;
  price: string;
  priceId: string;
  cardLimit: number;
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: "student",
    name: "Student",
    price: "$0",
    priceId: "price_1TAyXQ2V9h6ApeDfuJYKNBR6",
    cardLimit: 2,
    features: [
      "2 nAnoCards",
      "Unlimited viewing",
      ".edu / .k12 / .mil emails only",
      "Basic analytics",
      "Community support",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: "$4.99",
    priceId: "price_1TAyXR2V9h6ApeDfvXEeEiHQ",
    cardLimit: 10,
    features: [
      "10 nAnoCards",
      "Unlimited viewing",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9.99",
    priceId: "price_1TAyXS2V9h6ApeDf8qv5dWUQ",
    cardLimit: 49,
    features: [
      "49 nAnoCards",
      "Unlimited viewing",
      "Premium analytics",
      "Priority support",
      "Team collaboration",
      "API access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$12.99",
    priceId: "price_1TAyXT2V9h6ApeDf5EltqzAE",
    cardLimit: 100,
    features: [
      "Up to 100 team members",
      "Unlimited viewing",
      "LMS integration",
      "Advanced analytics",
      "Dedicated support",
      "Custom features",
      "SSO support",
    ],
  },
];

export const GUEST_VISIT_LIMIT = 10;
export const POINTS_PER_CORRECT_ANSWER = 10;