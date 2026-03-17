import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "npm:@simplewebauthn/server@13";
import Stripe from "npm:stripe@17";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-11-20.acacia',
});

// Stripe Price IDs for each tier
const STRIPE_PRICES = {
  student: Deno.env.get('STRIPE_STUDENT_PRICE_ID') ?? 'price_1TAyXQ2V9h6ApeDfuJYKNBR6',
  creator: Deno.env.get('STRIPE_CREATOR_PRICE_ID') ?? 'price_1TAyXR2V9h6ApeDfvXEeEiHQ',
  pro: Deno.env.get('STRIPE_PRO_PRICE_ID') ?? 'price_1TAyXS2V9h6ApeDf8qv5dWUQ',
  enterprise: Deno.env.get('STRIPE_ENTERPRISE_PRICE_ID') ?? 'price_1TAyXT2V9h6ApeDf5EltqzAE',
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint with edge metrics
app.get("/make-server-d91f8206/health", (c) => {
  return c.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    edge: "supabase-edge-functions",
    version: "1.0.0"
  });
});

// Get all cards
app.get("/make-server-d91f8206/cards", async (c) => {
  try {
    const cards = await kv.getByPrefix("card:");
    return c.json({ cards: cards || [] });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return c.json({ error: "Failed to fetch cards" }, 500);
  }
});

// Get a single card by ID
app.get("/make-server-d91f8206/cards/:cardId", async (c) => {
  try {
    const cardId = c.req.param('cardId');
    const card = await kv.get(`card:${cardId}`);
    
    if (!card) {
      return c.json({ error: "Card not found" }, 404);
    }
    
    return c.json({ card });
  } catch (error) {
    console.error("Error fetching card:", error);
    return c.json({ error: "Failed to fetch card" }, 500);
  }
});

// Create a new card
app.post("/make-server-d91f8206/cards", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error("Authorization error while creating card:", authError);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { title, videoTime, videoUrl, insights, country, category, courseTitle, appOrigin } = body;

    if (!title || !videoTime) {
      return c.json({ error: "Title and videoTime are required" }, 400);
    }

    // Owner (carapaulson1@gmail.com) has unlimited Enterprise access - skip all tier checks
    const isOwner = user.email === "carapaulson1@gmail.com";
    
    // Get user's current card count (needed for both tier check and increment later)
    const userCardCount = await kv.get(`user:${user.id}:cardCount`) || 0;

    if (!isOwner) {
      // Get user's subscription tier
      const subscription = await kv.get(`user:${user.id}:subscription`);
      const userTier = subscription?.tier || 'free';

      // Define card limits per tier
      const cardLimits: { [key: string]: number } = {
        'free': 1,
        'student': 2,
        'creator': 10,
        'pro': 49,
        'enterprise': 999999, // Unlimited
        'custom': 999999, // Unlimited
      };

      const tierLimit = cardLimits[userTier] || 1;

      if (userCardCount >= tierLimit) {
        // Determine upgrade suggestion based on current tier
        let upgradeMessage = "";
        if (userTier === 'free') {
          upgradeMessage = "Upgrade to Student (2 cards), Creator (10 cards), or Pro (49 cards) to create more cards.";
        } else if (userTier === 'student') {
          upgradeMessage = "Upgrade to Creator (10 cards) or Pro (49 cards) to create more cards.";
        } else if (userTier === 'creator') {
          upgradeMessage = "Upgrade to Pro (49 cards) to create more cards.";
        } else if (userTier === 'pro') {
          upgradeMessage = "Upgrade to Enterprise for unlimited cards.";
        }

        return c.json({ 
          error: `Card limit reached for ${userTier} tier (${tierLimit} card${tierLimit > 1 ? 's' : ''} max). ${upgradeMessage}`,
          tierLimit,
          currentCount: userCardCount,
          tier: userTier
        }, 403);
      }
    }

    // Get user's org info if they're part of an organization
    const userProfile = await kv.get(`user:${user.id}`);
    const orgId = userProfile?.orgId || null;
    const orgPrefix = userProfile?.orgPrefix || null;

    // Generate unique sequential card ID using a persistent counter.
    // This counter only increments and never reuses IDs, even if cards are deleted.
    let cardCounter = await kv.get("system:cardCounter") || 0;
    cardCounter = cardCounter + 1;
    await kv.set("system:cardCounter", cardCounter);
    const newId = String(cardCounter).padStart(3, '0');

    // Deep link URL for QR code sharing - each card gets a unique, permanent URL
    // Uses appOrigin sent by the frontend (window.location.origin) for reliability
    const origin = appOrigin || c.req.header('origin') || '';
    const qrCodeUrl = origin ? `${origin}/card/${newId}` : `/card/${newId}`;
    console.log(`[POST /cards] Card ${newId} deep link: ${qrCodeUrl}`);

    const newCard = {
      id: newId,
      title,
      videoTime,
      videoUrl: videoUrl || '',
      likes: 0,
      createdBy: user.email || 'Anonymous',
      createdAt: new Date().toISOString(),
      qrCodeUrl,
      country: country || '',
      insights: insights || {},
      likedBy: [],
      orgId: orgId, // Organization ID (e.g., "ubar2461112")
      orgPrefix: orgPrefix, // Organization prefix for filtering (e.g., "ubar")
    };

    // Store card with org ID in the key for easy filtering
    const cardKey = orgId ? `card:${orgId}:${newId}` : `card:${newId}`;
    await kv.set(cardKey, newCard);
    
    // Also store with simple ID for backward compatibility
    if (orgId) {
      await kv.set(`card:${newId}`, newCard);
    }
    
    // Update org card count if applicable
    if (orgId) {
      const org = await kv.get(`org:${orgId}`);
      if (org) {
        org.cardCount = (org.cardCount || 0) + 1;
        await kv.set(`org:${orgId}`, org);
      }
    }
    
    // Increment user card count
    await kv.set(`user:${user.id}:cardCount`, userCardCount + 1);

    return c.json({ card: newCard }, 201);
  } catch (error) {
    console.error("Error creating card:", error);
    return c.json({ error: "Failed to create card" }, 500);
  }
});

// Update an existing card
app.put("/make-server-d91f8206/cards/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    console.log('[PUT /cards/:id] Access token received:', accessToken ? `${accessToken.substring(0, 20)}...` : 'none');
    
    if (!accessToken) {
      console.error('[PUT /cards/:id] No access token provided');
      return c.json({ error: "Unauthorized - No token" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error("[PUT /cards/:id] Authorization error while updating card:", authError?.message || 'No user found');
      console.error("[PUT /cards/:id] Error details:", authError);
      return c.json({ error: `Unauthorized - ${authError?.message || 'Invalid session'}` }, 401);
    }
    
    console.log('[PUT /cards/:id] User authenticated:', user.email);

    const cardId = c.req.param('id');
    
    // Protect featured card #000 from editing
    if (cardId === "000") {
      return c.json({ error: "Cannot edit featured card #000 - This card is protected" }, 403);
    }
    
    const existingCard = await kv.get(`card:${cardId}`);

    if (!existingCard) {
      console.error(`[PUT /cards/:id] Card ${cardId} not found`);
      return c.json({ error: "Card not found" }, 404);
    }

    // Owner can edit ALL cards, or user can edit their own cards
    const isOwner = user.email === "carapaulson1@gmail.com";
    if (!isOwner && existingCard.createdBy !== user.email) {
      console.error(`[PUT /cards/:id] User ${user.email} does not own card ${cardId} (owned by ${existingCard.createdBy})`);
      return c.json({ error: "You can only edit your own cards" }, 403);
    }

    const body = await c.req.json();
    const { title, objective, information, videoTime, videoUrl, thumbnailUrl, country, stage, category, insights, courseTitle } = body;

    // Update card data
    const updatedCard = {
      ...existingCard,
      title: title || existingCard.title,
      objective: objective !== undefined ? objective : existingCard.objective,
      information: information !== undefined ? information : existingCard.information,
      videoTime: videoTime || existingCard.videoTime,
      videoUrl: videoUrl !== undefined ? videoUrl : existingCard.videoUrl,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existingCard.thumbnailUrl,
      country: country !== undefined ? country : existingCard.country,
      stage: stage !== undefined ? stage : existingCard.stage,
      category: category !== undefined ? category : existingCard.category,
      courseTitle: courseTitle !== undefined ? courseTitle : existingCard.courseTitle,
      insights: insights !== undefined ? insights : existingCard.insights,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`card:${cardId}`, updatedCard);
    
    console.log(`[PUT /cards/:id] Card ${cardId} updated successfully`);

    return c.json({ card: updatedCard }, 200);
  } catch (error) {
    console.error("Error updating card:", error);
    return c.json({ error: "Failed to update card" }, 500);
  }
});

// Delete a card (owner only)
app.delete("/make-server-d91f8206/cards/:id", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: "Unauthorized - No token" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized - Invalid session" }, 401);
    }

    // Only owner can delete cards
    if (user.email !== "carapaulson1@gmail.com") {
      return c.json({ error: "Forbidden - Only owner can delete cards" }, 403);
    }

    const cardId = c.req.param('id');
    
    // Protect featured card #000 from deletion
    if (cardId === "000") {
      return c.json({ error: "Cannot delete featured card #000 - This card is protected" }, 403);
    }
    
    const existingCard = await kv.get(`card:${cardId}`);

    if (!existingCard) {
      return c.json({ error: "Card not found" }, 404);
    }

    await kv.del(`card:${cardId}`);
    
    console.log(`[DELETE /cards/:id] Card ${cardId} deleted successfully by ${user.email}`);

    return c.json({ success: true, message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error);
    return c.json({ error: "Failed to delete card" }, 500);
  }
});

// Like/unlike a card
app.post("/make-server-d91f8206/cards/:id/like", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error("Authorization error while liking card:", authError);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cardId = c.req.param('id');
    const card = await kv.get(`card:${cardId}`);

    if (!card) {
      return c.json({ error: "Card not found" }, 404);
    }

    const likedBy = card.likedBy || [];
    const userIndex = likedBy.indexOf(user.id);

    if (userIndex > -1) {
      // Unlike
      likedBy.splice(userIndex, 1);
      card.likes = Math.max(0, card.likes - 1);
    } else {
      // Like
      likedBy.push(user.id);
      card.likes += 1;
    }

    card.likedBy = likedBy;
    await kv.set(`card:${cardId}`, card);

    return c.json({ card, isLiked: userIndex === -1 });
  } catch (error) {
    console.error("Error toggling like on card:", error);
    return c.json({ error: "Failed to toggle like" }, 500);
  }
});

// Get user's liked cards
app.get("/make-server-d91f8206/cards/liked", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const allCards = await kv.getByPrefix("card:");
    const likedCards = allCards.filter(card => 
      card.likedBy && card.likedBy.includes(user.id)
    ).map(card => card.id);

    return c.json({ likedCards });
  } catch (error) {
    console.error("Error fetching liked cards:", error);
    return c.json({ error: "Failed to fetch liked cards" }, 500);
  }
});

// Track guest visit
app.post("/make-server-d91f8206/guest/visit", async (c) => {
  try {
    const body = await c.req.json();
    const { guestId } = body;

    if (!guestId) {
      return c.json({ error: "Guest ID is required" }, 400);
    }

    // Get or create guest record
    let guestData = await kv.get(`guest:${guestId}`);
    const now = new Date();

    if (!guestData) {
      // First visit
      guestData = {
        guestId,
        visitCount: 1,
        firstVisit: now.toISOString(),
        lastVisit: now.toISOString(),
      };
    } else {
      // Increment visit count
      guestData.visitCount += 1;
      guestData.lastVisit = now.toISOString();
    }

    // Check if 30 days have passed
    const firstVisitDate = new Date(guestData.firstVisit);
    const daysPassed = Math.floor((now.getTime() - firstVisitDate.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysPassed >= 30 || guestData.visitCount > 30;

    await kv.set(`guest:${guestId}`, guestData);

    return c.json({
      visitCount: guestData.visitCount,
      visitsRemaining: Math.max(0, 30 - guestData.visitCount),
      daysPassed,
      daysRemaining: Math.max(0, 30 - daysPassed),
      isExpired,
      firstVisit: guestData.firstVisit,
    });
  } catch (error) {
    console.error("Error tracking guest visit:", error);
    return c.json({ error: "Failed to track guest visit" }, 500);
  }
});

// Get guest visit status
app.get("/make-server-d91f8206/guest/status/:guestId", async (c) => {
  try {
    const guestId = c.req.param('guestId');
    const guestData = await kv.get(`guest:${guestId}`);

    if (!guestData) {
      return c.json({
        visitCount: 0,
        visitsRemaining: 30,
        daysPassed: 0,
        daysRemaining: 30,
        isExpired: false,
        isNew: true,
      });
    }

    const now = new Date();
    const firstVisitDate = new Date(guestData.firstVisit);
    const daysPassed = Math.floor((now.getTime() - firstVisitDate.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysPassed >= 30 || guestData.visitCount >= 30;

    return c.json({
      visitCount: guestData.visitCount,
      visitsRemaining: Math.max(0, 30 - guestData.visitCount),
      daysPassed,
      daysRemaining: Math.max(0, 30 - daysPassed),
      isExpired,
      firstVisit: guestData.firstVisit,
      isNew: false,
    });
  } catch (error) {
    console.error("Error fetching guest status:", error);
    return c.json({ error: "Failed to fetch guest status" }, 500);
  }
});

// Generate passkey authentication options
app.post("/make-server-d91f8206/auth/passkey/generate-authentication-options", async (c) => {
  try {
    const rpID = new URL(Deno.env.get('SUPABASE_URL') ?? '').hostname;
    
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
    });

    // Store challenge temporarily (expires in 5 minutes)
    const challengeKey = `challenge:${options.challenge}`;
    await kv.set(challengeKey, {
      challenge: options.challenge,
      createdAt: new Date().toISOString(),
    });

    // Set expiration - delete after 5 minutes
    setTimeout(async () => {
      await kv.del(challengeKey);
    }, 5 * 60 * 1000);

    return c.json({ options });
  } catch (error) {
    console.error("Error generating passkey authentication options:", error);
    return c.json({ error: "Failed to generate authentication options" }, 500);
  }
});

// Verify passkey authentication
app.post("/make-server-d91f8206/auth/passkey/verify-authentication", async (c) => {
  try {
    const body = await c.req.json();
    const { credential, challenge } = body;

    // Verify challenge exists
    const storedChallenge = await kv.get(`challenge:${challenge}`);
    if (!storedChallenge) {
      return c.json({ error: "Invalid or expired challenge" }, 400);
    }

    // Get stored credential for user
    const authenticator = await kv.get(`authenticator:${credential.id}`);
    if (!authenticator) {
      return c.json({ error: "Authenticator not found" }, 404);
    }

    const rpID = new URL(Deno.env.get('SUPABASE_URL') ?? '').hostname;
    const expectedOrigin = Deno.env.get('SUPABASE_URL') ?? '';

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: new Uint8Array(authenticator.credentialID),
        credentialPublicKey: new Uint8Array(authenticator.credentialPublicKey),
        counter: authenticator.counter,
      },
    });

    if (!verification.verified) {
      return c.json({ error: "Authentication failed" }, 401);
    }

    // Update counter
    authenticator.counter = verification.authenticationInfo.newCounter;
    await kv.set(`authenticator:${credential.id}`, authenticator);

    // Get user associated with this authenticator
    const userId = authenticator.userId;
    
    // Create a session token using Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: `passkey-${userId}@nanocards.app`,
      email_confirm: true,
    });

    if (error) {
      console.error("Error creating user session:", error);
      return c.json({ error: "Failed to create session" }, 500);
    }

    // Clean up challenge
    await kv.del(`challenge:${challenge}`);

    return c.json({ 
      verified: true,
      session: data.session,
    });
  } catch (error) {
    console.error("Error verifying passkey authentication:", error);
    return c.json({ error: "Failed to verify authentication" }, 500);
  }
});

// Generate passkey registration options
app.post("/make-server-d91f8206/auth/passkey/generate-registration-options", async (c) => {
  try {
    const body = await c.req.json();
    const { username } = body;

    if (!username) {
      return c.json({ error: "Username is required" }, 400);
    }

    const rpID = new URL(Deno.env.get('SUPABASE_URL') ?? '').hostname;
    const rpName = "nAnoCards";

    // Generate a user ID
    const userId = crypto.randomUUID();

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: userId,
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Store challenge temporarily
    await kv.set(`challenge:${options.challenge}`, {
      challenge: options.challenge,
      userId,
      username,
      createdAt: new Date().toISOString(),
    });

    return c.json({ options, userId });
  } catch (error) {
    console.error("Error generating passkey registration options:", error);
    return c.json({ error: "Failed to generate registration options" }, 500);
  }
});

// Verify passkey registration
app.post("/make-server-d91f8206/auth/passkey/verify-registration", async (c) => {
  try {
    const body = await c.req.json();
    const { credential, challenge, userId } = body;

    // Verify challenge
    const storedChallenge = await kv.get(`challenge:${challenge}`);
    if (!storedChallenge || storedChallenge.userId !== userId) {
      return c.json({ error: "Invalid or expired challenge" }, 400);
    }

    const rpID = new URL(Deno.env.get('SUPABASE_URL') ?? '').hostname;
    const expectedOrigin = Deno.env.get('SUPABASE_URL') ?? '';

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return c.json({ error: "Registration failed" }, 400);
    }

    // Store authenticator
    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
    await kv.set(`authenticator:${credentialID}`, {
      credentialID: Array.from(credentialID),
      credentialPublicKey: Array.from(credentialPublicKey),
      counter,
      userId,
      createdAt: new Date().toISOString(),
    });

    // Clean up challenge
    await kv.del(`challenge:${challenge}`);

    return c.json({ verified: true, userId });
  } catch (error) {
    console.error("Error verifying passkey registration:", error);
    return c.json({ error: "Failed to verify registration" }, 500);
  }
});

// ==================== TRAINING ENDPOINTS ====================

// Get all training modules
app.get("/make-server-d91f8206/training/modules", async (c) => {
  try {
    const modules = await kv.getByPrefix("training:");
    // Sort by order
    const sortedModules = (modules || []).sort((a, b) => a.order - b.order);
    return c.json({ modules: sortedModules });
  } catch (error) {
    console.error("Error fetching training modules:", error);
    return c.json({ error: "Failed to fetch training modules" }, 500);
  }
});

// Create training module (admin only)
app.post("/make-server-d91f8206/training/modules", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized - No auth header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }

    // Only carapaulson1@gmail.com can create training modules
    if (user.email !== "carapaulson1@gmail.com") {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    const body = await c.req.json();
    const { title, description, content, videoUrl, duration, order } = body;

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    // Generate module ID
    const existingModules = await kv.getByPrefix("training:");
    const moduleCount = (existingModules || []).length;
    const moduleId = `training:${String(moduleCount + 1).padStart(3, "0")}`;

    const module = {
      id: moduleId,
      title,
      description: description || "",
      content,
      videoUrl: videoUrl || "",
      duration: duration || "",
      order: order || moduleCount + 1,
      createdAt: new Date().toISOString(),
      createdBy: user.email,
    };

    await kv.set(moduleId, module);

    return c.json({ module });
  } catch (error) {
    console.error("Error creating training module:", error);
    return c.json({ error: "Failed to create training module" }, 500);
  }
});

// Update training module (admin only)
app.put("/make-server-d91f8206/training/modules/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized - No auth header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }

    // Only carapaulson1@gmail.com can update training modules
    if (user.email !== "carapaulson1@gmail.com") {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    const moduleId = c.req.param("id");
    const existingModule = await kv.get(moduleId);

    if (!existingModule) {
      return c.json({ error: "Module not found" }, 404);
    }

    const body = await c.req.json();
    const { title, description, content, videoUrl, duration } = body;

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const updatedModule = {
      ...existingModule,
      title,
      description: description || "",
      content,
      videoUrl: videoUrl || "",
      duration: duration || "",
      updatedAt: new Date().toISOString(),
    };

    await kv.set(moduleId, updatedModule);

    return c.json({ module: updatedModule });
  } catch (error) {
    console.error("Error updating training module:", error);
    return c.json({ error: "Failed to update training module" }, 500);
  }
});

// Delete training module (admin only)
app.delete("/make-server-d91f8206/training/modules/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized - No auth header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Unauthorized - Invalid token" }, 401);
    }

    // Only carapaulson1@gmail.com can delete training modules
    if (user.email !== "carapaulson1@gmail.com") {
      return c.json({ error: "Forbidden - Admin access required" }, 403);
    }

    const moduleId = c.req.param("id");
    const existingModule = await kv.get(moduleId);

    if (!existingModule) {
      return c.json({ error: "Module not found" }, 404);
    }

    await kv.del(moduleId);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting training module:", error);
    return c.json({ error: "Failed to delete training module" }, 500);
  }
});

// Check subscription status
app.get("/make-server-d91f8206/subscription/status", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ tier: "free", points: 0 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ tier: "free", points: 0 });
    }

    // Get user subscription from KV store
    const subscription = await kv.get(`user:${user.id}:subscription`);
    
    // Get user points from KV store
    const userPoints = await kv.get(`user:${user.id}:points`) || 0;
    
    if (!subscription) {
      return c.json({ tier: "free", points: userPoints });
    }

    // Check if subscription is still active
    const now = new Date();
    const expiresAt = new Date(subscription.expiresAt);
    
    if (now > expiresAt) {
      return c.json({ tier: "free", expired: true, points: userPoints });
    }

    return c.json({ 
      tier: subscription.tier,
      expiresAt: subscription.expiresAt,
      active: true,
      points: userPoints
    });
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return c.json({ tier: "free", points: 0 }, 500);
  }
});

// Get user profile (subscription tier, display name, points)
app.get("/make-server-d91f8206/user/profile", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ subscriptionTier: "free", displayName: "", points: 0 });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ subscriptionTier: "free", displayName: "", points: 0 });
    }

    // Special handling for owner - always return Enterprise tier
    if (user.email === "carapaulson1@gmail.com") {
      const userProfile = await kv.get(`user:${user.id}`);
      const userPoints = await kv.get(`user:${user.id}:points`) || 0;
      
      // Get name from: 1) KV store, 2) user metadata, 3) fallback
      const displayName = userProfile?.name || 
                         user.user_metadata?.name || 
                         user.user_metadata?.full_name || 
                         "Cara Paulson";
      
      return c.json({
        subscriptionTier: "enterprise",
        displayName: displayName,
        points: userPoints
      });
    }

    // Get user profile from KV store
    const userProfile = await kv.get(`user:${user.id}`);
    
    // Get user subscription from KV store
    const subscription = await kv.get(`user:${user.id}:subscription`);
    
    // Get user points from KV store
    const userPoints = await kv.get(`user:${user.id}:points`) || 0;
    
    let subscriptionTier = "free";
    
    if (subscription) {
      // Check if subscription is still active
      const now = new Date();
      const expiresAt = new Date(subscription.expiresAt);
      
      if (now <= expiresAt) {
        subscriptionTier = subscription.tier;
      }
    }

    // Get display name from multiple sources
    const displayName = userProfile?.name || 
                       user.user_metadata?.name || 
                       user.user_metadata?.full_name || 
                       "";
    
    return c.json({
      subscriptionTier,
      displayName: displayName,
      points: userPoints
    });
  } catch (error) {
    console.error("Error loading user profile:", error);
    return c.json({ subscriptionTier: "free", displayName: "", points: 0 }, 500);
  }
});

// Create Stripe Checkout Session
app.post("/make-server-d91f8206/subscription/create-checkout", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized - Please log in" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("Authorization error while creating checkout session:", error);
      return c.json({ error: "Unauthorized - Invalid session" }, 401);
    }

    const body = await c.req.json();
    const { tier, successUrl, cancelUrl } = body;

    // Validate tier
    if (!["student", "creator", "pro", "enterprise"].includes(tier)) {
      return c.json({ error: "Invalid tier. Must be 'student', 'creator', 'pro', or 'enterprise'" }, 400);
    }

    // Get the appropriate price ID
    const priceId = STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES];
    
    if (!priceId || priceId.includes('placeholder')) {
      console.error(`Missing Stripe Price ID for tier: ${tier}. Please configure STRIPE_${tier.toUpperCase()}_PRICE_ID environment variable.`);
      return c.json({ 
        error: `Payment configuration incomplete for ${tier} tier. Please contact support.`,
        details: `Missing price ID for ${tier}`
      }, 500);
    }

    // Get or create Stripe customer
    let customerId: string;
    const existingCustomer = await kv.get(`user:${user.id}:stripeCustomerId`);
    
    if (existingCustomer) {
      customerId = existingCustomer;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUserId: user.id,
        },
      });
      customerId = customer.id;
      await kv.set(`user:${user.id}:stripeCustomerId`, customerId);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${c.req.header('origin')}/app?upgrade=success`,
      cancel_url: cancelUrl || `${c.req.header('origin')}/pricing?upgrade=cancelled`,
      metadata: {
        userId: user.id,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: tier,
        },
      },
    });

    console.log(`Created Stripe checkout session for user ${user.email}, tier: ${tier}, sessionId: ${session.id}`);

    return c.json({ 
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    return c.json({ 
      error: "Failed to create checkout session",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Stripe Webhook Handler
app.post("/make-server-d91f8206/stripe/webhook", async (c) => {
  try {
    const signature = c.req.header("stripe-signature");
    if (!signature) {
      console.error("Missing Stripe signature header");
      return c.json({ error: "Missing signature" }, 400);
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      // Don't fail webhook if secret not configured yet
      return c.json({ received: true });
    }

    const body = await c.req.text();
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return c.json({ error: "Invalid signature" }, 400);
    }

    console.log(`Received Stripe webhook event: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (userId && tier) {
          // Create subscription record
          const subscription = {
            tier,
            stripeSubscriptionId: session.subscription,
            stripeCustomerId: session.customer,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            active: true,
          };

          await kv.set(`user:${userId}:subscription`, subscription);
          console.log(`Activated ${tier} subscription for user ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const existingSubscription = await kv.get(`user:${userId}:subscription`);
          
          if (existingSubscription) {
            existingSubscription.active = subscription.status === 'active';
            existingSubscription.stripeSubscriptionId = subscription.id;
            
            // Update expiration date based on current period end
            if (subscription.current_period_end) {
              existingSubscription.expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
            }
            
            await kv.set(`user:${userId}:subscription`, existingSubscription);
            console.log(`Updated subscription for user ${userId}, status: ${subscription.status}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const existingSubscription = await kv.get(`user:${userId}:subscription`);
          
          if (existingSubscription) {
            existingSubscription.active = false;
            existingSubscription.cancelledAt = new Date().toISOString();
            await kv.set(`user:${userId}:subscription`, existingSubscription);
            console.log(`Cancelled subscription for user ${userId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return c.json({ 
      error: "Webhook processing failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Upgrade subscription (now redirects to Stripe Checkout)
app.post("/make-server-d91f8206/subscription/upgrade", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { tier, paymentDetails } = body;

    // Validate tier
    if (!["student", "creator", "pro", "enterprise"].includes(tier)) {
      return c.json({ error: "Invalid tier" }, 400);
    }

    // Handle student tier (free upgrade for verified emails)
    if (tier === "student") {
      const email = user.email?.toLowerCase() || "";
      const freeDomains = ['.edu', '.k12.', '.mil', '@oratf.info'];
      const isEligible = freeDomains.some(domain => email.includes(domain));

      if (!isEligible) {
        return c.json({ 
          error: "Not eligible for student plan. Must use .edu, .k12, .mil, or @oratf.info email" 
        }, 403);
      }

      const subscription = {
        tier: "student",
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        createdAt: new Date().toISOString(),
        active: true,
      };

      await kv.set(`user:${user.id}:subscription`, subscription);
      console.log(`User ${user.email} activated free student tier`);

      return c.json({ 
        success: true,
        tier: "student",
        expiresAt: subscription.expiresAt,
        message: "Student plan activated successfully"
      });
    }

    // If payment details are provided, process direct payment
    if (paymentDetails) {
      console.log(`Processing direct payment for user: ${user.email}, tier: ${tier}`);
      
      // Get or create Stripe customer
      let customerId: string;
      const existingCustomer = await kv.get(`user:${user.id}:stripeCustomerId`);
      
      if (existingCustomer) {
        customerId = existingCustomer;
        console.log(`Using existing Stripe customer: ${customerId}`);
      } else {
        console.log(`Creating new Stripe customer for user: ${user.email}`);
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            supabaseUserId: user.id,
          },
        });
        customerId = customer.id;
        await kv.set(`user:${user.id}:stripeCustomerId`, customerId);
        console.log(`Created new Stripe customer: ${customerId}`);
      }

      // Create payment method from card details
      try {
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: paymentDetails.cardNumber,
            exp_month: parseInt(paymentDetails.expiryDate.split('/')[0]),
            exp_year: parseInt('20' + paymentDetails.expiryDate.split('/')[1]),
            cvc: paymentDetails.cvv,
          },
          billing_details: {
            name: paymentDetails.cardName,
            address: {
              postal_code: paymentDetails.billingZip,
            },
          },
        });

        // Attach payment method to customer
        await stripe.paymentMethods.attach(paymentMethod.id, {
          customer: customerId,
        });

        // Set as default payment method
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethod.id,
          },
        });

        // Get the price ID for the tier
        const priceId = STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES];
        
        if (!priceId || priceId.includes('placeholder')) {
          console.error(`Invalid price ID for tier ${tier}: ${priceId}`);
          return c.json({ 
            error: `Payment system not configured for ${tier} tier. Please contact support.`,
            details: 'Stripe price ID is not configured'
          }, 500);
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: priceId }],
          metadata: {
            userId: user.id,
            tier: tier,
          },
          expand: ['latest_invoice.payment_intent'],
        });

        console.log(`Created subscription ${subscription.id} for user ${user.email}`);

        // Update user subscription in database
        const subscriptionData = {
          tier: tier,
          stripeSubscriptionId: subscription.id,
          expiresAt: new Date(subscription.current_period_end * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          active: true,
        };

        await kv.set(`user:${user.id}:subscription`, subscriptionData);

        return c.json({ 
          success: true,
          tier: tier,
          subscriptionId: subscription.id,
          expiresAt: subscriptionData.expiresAt,
        });
      } catch (paymentError) {
        console.error("Error processing payment:", paymentError);
        return c.json({ 
          error: "Payment failed. Please check your card details and try again.",
          details: paymentError instanceof Error ? paymentError.message : 'Unknown error'
        }, 400);
      }
    }

    // If no payment details, create Stripe checkout session (redirect flow)
    const priceId = STRIPE_PRICES[tier as keyof typeof STRIPE_PRICES];
    
    console.log(`Processing checkout for tier: ${tier}, priceId: ${priceId}`);
    
    if (!priceId || priceId.includes('placeholder')) {
      console.error(`Invalid price ID for tier ${tier}: ${priceId}`);
      return c.json({ 
        error: `Payment system not configured for ${tier} tier. Please contact support.`,
        details: 'Stripe price ID is not configured'
      }, 500);
    }

    // Get or create Stripe customer
    let customerId: string;
    const existingCustomer = await kv.get(`user:${user.id}:stripeCustomerId`);
    
    if (existingCustomer) {
      customerId = existingCustomer;
      console.log(`Using existing Stripe customer: ${customerId}`);
    } else {
      console.log(`Creating new Stripe customer for user: ${user.email}`);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabaseUserId: user.id,
        },
      });
      customerId = customer.id;
      await kv.set(`user:${user.id}:stripeCustomerId`, customerId);
      console.log(`Created new Stripe customer: ${customerId}`);
    }

    // Create Checkout Session
    console.log(`Creating Stripe checkout session for customer: ${customerId}, price: ${priceId}`);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${c.req.header('origin')}/app?upgrade=success&tier=${tier}`,
      cancel_url: `${c.req.header('origin')}/subscription?upgrade=cancelled`,
      metadata: {
        userId: user.id,
        tier: tier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          tier: tier,
        },
      },
    });

    console.log(`Created Stripe checkout session for user ${user.email}, tier: ${tier}`);

    return c.json({ 
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return c.json({ 
      error: "Failed to create checkout session",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get API key for the current user
app.get("/make-server-d91f8206/api-key", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error("Authorization error while fetching API key:", authError);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user has access (Creator or Pro)
    const subscription = await kv.get(`user:${user.id}:subscription`);
    const userTier = subscription?.tier || 'free';
    
    if (userTier !== 'creator' && userTier !== 'pro') {
      return c.json({ error: "API key access requires Creator or Pro subscription" }, 403);
    }

    // Get existing API key
    const apiKeyData = await kv.get(`user:${user.id}:apikey`);
    
    if (!apiKeyData) {
      return c.json({ apiKey: null });
    }

    return c.json({ 
      apiKey: apiKeyData.key,
      createdAt: apiKeyData.createdAt
    });
  } catch (error) {
    console.error("Error fetching API key:", error);
    return c.json({ error: "Failed to fetch API key" }, 500);
  }
});

// Generate new API key for the current user
app.post("/make-server-d91f8206/api-key/generate", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error("Authorization error while generating API key:", authError);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user has access (Creator or Pro)
    const subscription = await kv.get(`user:${user.id}:subscription`);
    const userTier = subscription?.tier || 'free';
    
    if (userTier !== 'creator' && userTier !== 'pro') {
      return c.json({ error: "API key access requires Creator or Pro subscription" }, 403);
    }

    // Check if user already has an API key
    const existingKey = await kv.get(`user:${user.id}:apikey`);
    if (existingKey) {
      return c.json({ error: "API key already exists. Use regenerate endpoint to create a new key." }, 400);
    }

    // Generate a secure random API key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const apiKey = `nano_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    const apiKeyData = {
      key: apiKey,
      userId: user.id,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
    };

    // Store API key
    await kv.set(`user:${user.id}:apikey`, apiKeyData);
    // Also store reverse lookup for API key validation
    await kv.set(`apikey:${apiKey}`, { userId: user.id });

    console.log(`Generated API key for user ${user.email}`);

    return c.json({ 
      apiKey: apiKey,
      createdAt: apiKeyData.createdAt
    });
  } catch (error) {
    console.error("Error generating API key:", error);
    return c.json({ error: "Failed to generate API key" }, 500);
  }
});

// Regenerate API key for the current user
app.post("/make-server-d91f8206/api-key/regenerate", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      console.error("Authorization error while regenerating API key:", authError);
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user has access (Creator or Pro)
    const subscription = await kv.get(`user:${user.id}:subscription`);
    const userTier = subscription?.tier || 'free';
    
    if (userTier !== 'creator' && userTier !== 'pro') {
      return c.json({ error: "API key access requires Creator or Pro subscription" }, 403);
    }

    // Delete old API key reverse lookup if exists
    const oldKeyData = await kv.get(`user:${user.id}:apikey`);
    if (oldKeyData?.key) {
      await kv.del(`apikey:${oldKeyData.key}`);
    }

    // Generate a new secure random API key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const apiKey = `nano_${Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('')}`;

    const apiKeyData = {
      key: apiKey,
      userId: user.id,
      userEmail: user.email,
      createdAt: new Date().toISOString(),
      regeneratedAt: new Date().toISOString(),
    };

    // Store new API key
    await kv.set(`user:${user.id}:apikey`, apiKeyData);
    // Store reverse lookup for API key validation
    await kv.set(`apikey:${apiKey}`, { userId: user.id });

    console.log(`Regenerated API key for user ${user.email}`);

    return c.json({ 
      apiKey: apiKey,
      createdAt: apiKeyData.createdAt
    });
  } catch (error) {
    console.error("Error regenerating API key:", error);
    return c.json({ error: "Failed to regenerate API key" }, 500);
  }
});

// Generate a secure random password
function generateSecurePassword(): string {
  const length = 16;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

// Generate organization ID from email domain and Julian date/time
// Format: {domain}{JulianDay}{HHMM}
// Example: ubar.com on day 246 at 11:12 → ubar2461112
function generateOrgId(email: string): string {
  // Extract domain from email
  const domain = email.split('@')[1] || email;
  const domainPrefix = domain.split('.')[0].toLowerCase(); // e.g., "ubar" from "ubar.com"
  
  // Get current date/time
  const now = new Date();
  
  // Calculate Julian day (day of year, 1-366)
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const julianDay = Math.floor(diff / oneDay);
  
  // Get time in HHMM format
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeCode = `${hours}${minutes}`;
  
  // Combine: domain + julian day + time
  const orgId = `${domainPrefix}${julianDay}${timeCode}`;
  
  console.log(`[generateOrgId] Generated org ID: ${orgId} for email: ${email}`);
  console.log(`[generateOrgId] - Domain prefix: ${domainPrefix}`);
  console.log(`[generateOrgId] - Julian day: ${julianDay}`);
  console.log(`[generateOrgId] - Time code: ${timeCode}`);
  
  return orgId;
}

// Auth endpoint for user signup
app.post("/make-server-d91f8206/auth/signup", async (c) => {
  try {
    const { email, password, displayName } = await c.req.json();

    // Validate input
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    console.log(`[POST /auth/signup] Creating account for ${email}`);

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        display_name: displayName || email.split("@")[0],
      },
      email_confirm: true, // Auto-confirm email
    });

    if (error) {
      console.error("[POST /auth/signup] Error creating user:", error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    console.log(`[POST /auth/signup] Account created successfully for ${email}`);

    // Create user profile in public.users table
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: data.user.id,
        email: data.user.email,
        display_name: displayName || email.split("@")[0],
        subscription_tier: "free",
        points: 0,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error("[POST /auth/signup] Error creating user profile:", profileError);
      // User created but profile creation failed - still return success
      // as the user can be recovered
    }

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

    console.log(`[POST /auth/signup] Subscription and profile initialized for ${email}`);

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        display_name: displayName || email.split("@")[0],
      },
      message: "Account created successfully",
    });
  } catch (error: any) {
    console.error("[POST /auth/signup] Error:", error);
    return c.json({ error: error?.message || "Failed to create account" }, 500);
  }
});

// Admin endpoint to create user account with secure random password
app.post("/make-server-d91f8206/admin/create-account", async (c) => {
  try {
    const { email, name } = await c.req.json();
    
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Generate secure random password
    const randomPassword = generateSecurePassword();
    
    console.log(`[POST /admin/create-account] Creating account for ${email}`);
    console.log(`[POST /admin/create-account] Generated secure password (will NOT be emailed to user)`);

    // Create user in Supabase Auth with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: randomPassword,
      user_metadata: { 
        name: name || email.split('@')[0],
        passwordChangeRequired: true,
        passwordChangeRecommendedBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        accountCreatedAt: new Date().toISOString()
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error(`[POST /admin/create-account] Error creating user:`, error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: email,
      name: name || email.split('@')[0],
      points: 0,
      tier: 'free',
      createdAt: new Date().toISOString(),
      passwordChangeRequired: true,
      passwordChangeRecommendedBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    console.log(`[POST /admin/create-account] Account created successfully for ${email}`);
    console.log(`[POST /admin/create-account] User should change password within 30 days`);

    return c.json({ 
      success: true,
      user: {
        id: data.user.id,
        email: email,
        name: name || email.split('@')[0],
      },
      message: "Account created successfully. User will receive a welcome email with instructions to set their password.",
      temporaryPassword: randomPassword, // Only returned in this response, never emailed
      passwordChangeRecommendedBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }, 201);
  } catch (error) {
    console.error("[POST /admin/create-account] Error:", error);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Admin endpoint to create organization account with auto-generated org ID
app.post("/make-server-d91f8206/admin/create-org-account", async (c) => {
  try {
    const { email, name, organizationName } = await c.req.json();
    
    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Generate organization ID from email and Julian date/time
    const orgId = generateOrgId(email);
    
    // Check if org ID already exists
    const existingOrg = await kv.get(`org:${orgId}`);
    if (existingOrg) {
      console.error(`[POST /admin/create-org-account] Org ID ${orgId} already exists`);
      return c.json({ 
        error: `Organization ID ${orgId} already exists. Please try again in a few minutes.`,
        existingOrgId: orgId
      }, 409);
    }

    // Use org ID as the initial password for easy team access
    const initialPassword = orgId;
    
    console.log(`[POST /admin/create-org-account] Creating organization account for ${email}`);
    console.log(`[POST /admin/create-org-account] Generated org ID: ${orgId}`);
    console.log(`[POST /admin/create-org-account] Using org ID as initial password for team access`);

    // Create user in Supabase Auth with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: initialPassword,
      user_metadata: { 
        name: name || email.split('@')[0],
        organizationName: organizationName || '',
        orgId: orgId,
        accountType: 'organization',
        passwordChangeRequired: true,
        passwordChangeRecommendedBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        accountCreatedAt: new Date().toISOString()
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error(`[POST /admin/create-org-account] Error creating user:`, error);
      return c.json({ error: error.message }, 400);
    }

    // Extract domain prefix for organization grouping
    const domain = email.split('@')[1] || email;
    const orgPrefix = domain.split('.')[0].toLowerCase(); // e.g., "ubar" from "ubar.com"

    // Store organization profile in KV store
    await kv.set(`org:${orgId}`, {
      orgId: orgId,
      orgPrefix: orgPrefix, // For filtering by org name (e.g., "ubar")
      userId: data.user.id,
      email: email,
      name: organizationName || name || email.split('@')[0],
      contactName: name || '',
      points: 0,
      tier: 'free',
      accountType: 'organization',
      createdAt: new Date().toISOString(),
      teamMembers: [],
      cardCount: 0,
    });

    // Store user profile in KV store with org reference
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: email,
      name: name || email.split('@')[0],
      orgId: orgId,
      orgPrefix: orgPrefix,
      accountType: 'organization',
      points: 0,
      tier: 'free',
      createdAt: new Date().toISOString(),
      passwordChangeRequired: true,
      passwordChangeRecommendedBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Create reverse lookup: userId -> orgId
    await kv.set(`user:${data.user.id}:orgId`, orgId);
    
    // Create reverse lookup: orgPrefix -> list of orgIds
    const existingPrefixOrgs = await kv.get(`orgPrefix:${orgPrefix}`) || { orgIds: [] };
    existingPrefixOrgs.orgIds.push(orgId);
    await kv.set(`orgPrefix:${orgPrefix}`, existingPrefixOrgs);

    console.log(`[POST /admin/create-org-account] Organization account created successfully`);
    console.log(`[POST /admin/create-org-account] - Email: ${email}`);
    console.log(`[POST /admin/create-org-account] - Org ID: ${orgId}`);
    console.log(`[POST /admin/create-org-account] - Org Prefix: ${orgPrefix}`);
    console.log(`[POST /admin/create-org-account] - User ID: ${data.user.id}`);
    console.log(`[POST /admin/create-org-account] - Initial Password: ${orgId} (org ID)`);

    return c.json({ 
      success: true,
      organization: {
        orgId: orgId,
        orgPrefix: orgPrefix,
        userId: data.user.id,
        email: email,
        name: organizationName || name || email.split('@')[0],
        contactName: name || '',
      },
      message: "Organization account created successfully. Initial password is the org ID for easy team access.",
      initialPassword: initialPassword, // This is the org ID
      passwordChangeRecommendedBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }, 201);
  } catch (error) {
    console.error("[POST /admin/create-org-account] Error:", error);
    return c.json({ error: "Failed to create organization account" }, 500);
  }
});

// Get organization details by org ID
app.get("/make-server-d91f8206/org/:orgId", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    const org = await kv.get(`org:${orgId}`);
    
    if (!org) {
      return c.json({ error: "Organization not found" }, 404);
    }
    
    // Remove sensitive data
    const { teamMembers, ...publicOrgData } = org;
    
    return c.json({ organization: publicOrgData });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return c.json({ error: "Failed to fetch organization" }, 500);
  }
});

// Get all cards by organization prefix (e.g., "ubar")
app.get("/make-server-d91f8206/cards/org-prefix/:prefix", async (c) => {
  try {
    const prefix = c.req.param('prefix').toLowerCase();
    
    // Get all org IDs with this prefix
    const orgPrefixData = await kv.get(`orgPrefix:${prefix}`);
    if (!orgPrefixData || !orgPrefixData.orgIds || orgPrefixData.orgIds.length === 0) {
      return c.json({ cards: [], message: `No organizations found with prefix: ${prefix}` });
    }
    
    console.log(`[GET /cards/org-prefix/${prefix}] Found ${orgPrefixData.orgIds.length} org(s)`);
    
    // Get all cards from all matching organizations
    const allCards = [];
    for (const orgId of orgPrefixData.orgIds) {
      const orgCards = await kv.getByPrefix(`card:${orgId}:`);
      allCards.push(...orgCards);
    }
    
    // Sort by likes
    allCards.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    
    console.log(`[GET /cards/org-prefix/${prefix}] Found ${allCards.length} total cards`);
    
    return c.json({ 
      cards: allCards,
      organizationPrefix: prefix,
      organizationCount: orgPrefixData.orgIds.length
    });
  } catch (error) {
    console.error("Error fetching cards by org prefix:", error);
    return c.json({ error: "Failed to fetch cards" }, 500);
  }
});

// Get all cards by specific org ID (e.g., "ubar2461112")
app.get("/make-server-d91f8206/cards/org-id/:orgId", async (c) => {
  try {
    const orgId = c.req.param('orgId');
    
    // Verify org exists
    const org = await kv.get(`org:${orgId}`);
    if (!org) {
      return c.json({ error: "Organization not found", cards: [] }, 404);
    }
    
    // Get all cards for this specific org ID
    const cards = await kv.getByPrefix(`card:${orgId}:`);
    
    // Sort by likes
    cards.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    
    console.log(`[GET /cards/org-id/${orgId}] Found ${cards.length} cards for org ${org.name}`);
    
    return c.json({ 
      cards: cards,
      organization: {
        orgId: org.orgId,
        orgPrefix: org.orgPrefix,
        name: org.name
      }
    });
  } catch (error) {
    console.error("Error fetching cards by org ID:", error);
    return c.json({ error: "Failed to fetch cards" }, 500);
  }
});

// Get all unique course titles for a user/organization
app.get("/make-server-d91f8206/courses/titles", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      console.log('[GET /courses/titles] No access token provided');
      return c.json({ courseTitles: [] });
    }

    // Check if the token is the anon key (not a user access token)
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (accessToken === anonKey) {
      console.log('[GET /courses/titles] Anon key provided, not a user session');
      return c.json({ courseTitles: [] });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      // Only log actual errors, not missing sub claims from invalid tokens
      if (authError?.message && !authError.message.includes('missing sub claim')) {
        console.error("[GET /courses/titles] Authorization error:", authError?.message || 'No user found');
      } else {
        console.log('[GET /courses/titles] Invalid or expired user token, returning empty list');
      }
      return c.json({ courseTitles: [] });
    }

    // Get user's org info if they're part of an organization
    const userProfile = await kv.get(`user:${user.id}`);
    const orgId = userProfile?.orgId || null;

    // Get all cards for this user or their organization
    let cards = [];
    if (orgId) {
      // Get all cards from the organization
      cards = await kv.getByPrefix(`card:${orgId}:`);
    } else {
      // Get all cards created by this user
      const allCards = await kv.getByPrefix("card:");
      cards = allCards.filter(card => card.createdBy === user.email);
    }

    // Extract unique course titles from Training category cards (including "Training & Promotional")
    const courseTitles = new Set<string>();
    cards.forEach(card => {
      if ((card.category === 'Training' || card.category === 'Training & Promotional') && card.courseTitle) {
        courseTitles.add(card.courseTitle);
      }
    });

    const sortedTitles = Array.from(courseTitles).sort();

    console.log(`[GET /courses/titles] Found ${sortedTitles.length} course titles for user ${user.email}`);

    return c.json({ courseTitles: sortedTitles });
  } catch (error) {
    console.error("Error fetching course titles:", error);
    return c.json({ courseTitles: [] });
  }
});

// Initialize database with single featured card #000 (admin endpoint)
app.post("/make-server-d91f8206/admin/init-featured-card", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user || user.email !== "carapaulson1@gmail.com") {
      return c.json({ error: "Admin access only" }, 403);
    }

    console.log("[INIT] Starting database initialization - deleting all cards and creating featured card #000");

    // Step 1: Delete ALL existing cards
    const allCards = await kv.getByPrefix("card:");
    console.log(`[INIT] Found ${allCards?.length || 0} cards to delete`);
    
    if (allCards && allCards.length > 0) {
      const cardIds = allCards.map((card: any) => `card:${card.id}`);
      await kv.mdel(cardIds);
      console.log(`[INIT] Deleted ${cardIds.length} cards`);
    }

    // Step 2: Create the ONE featured card #000
    const featuredCard = {
      id: "000",
      globalCardNumber: "000",
      title: "nAnoCards: Edge Micro Learning",
      videoUrl: "https://naskxuojfdqcunotdjzi.supabase.co/storage/v1/object/public/nanocards/nAnoCards-short_1080p.mp4",
      videoTime: "0:00",
      thumbnailUrl: "https://ffhowwvlytnoulijclac.supabase.co/storage/v1/object/public/nano/nanoCards.png",
      category: "NanoCard Academy",
      courseTitle: "",
      objective: "Learn about nAnoCards edge micro-learning platform",
      information: "nAnoCards is a progressive web app for creating and sharing AI product pitch cards with edge-managed storage.",
      insights: {},
      country: "USA",
      stage: "",
      likes: 0,
      createdBy: "carapaulson1@gmail.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: true,
      visibleToAll: true
    };

    await kv.set("card:000", featuredCard);
    console.log("[INIT] Created featured card #000");

    return c.json({ 
      success: true, 
      message: "Database initialized with featured card #000. All other cards deleted.",
      card: featuredCard
    });
  } catch (error) {
    console.error("Error initializing database:", error);
    return c.json({ error: "Failed to initialize database" }, 500);
  }
});

// Auto-initialize featured card #000 on server startup
async function autoInitializeFeaturedCard() {
  try {
    console.log("[AUTO-INIT] Checking if featured card #000 exists...");
    
    const existingCard = await kv.get("card:000");
    
    if (existingCard) {
      console.log("[AUTO-INIT] ✅ Featured card #000 already exists");
      return;
    }
    
    console.log("[AUTO-INIT] Featured card #000 not found. Creating it now...");
    
    const featuredCard = {
      id: "000",
      globalCardNumber: "000",
      title: "nAnoCards: Edge Micro Learning",
      videoUrl: "https://naskxuojfdqcunotdjzi.supabase.co/storage/v1/object/public/nanocards/nAnoCards-short_1080p.mp4",
      videoTime: "0:00",
      thumbnailUrl: "https://ffhowwvlytnoulijclac.supabase.co/storage/v1/object/public/nano/nanoCards.png",
      category: "NanoCard Academy",
      courseTitle: "",
      objective: "Learn about nAnoCards edge micro-learning platform",
      information: "nAnoCards is a progressive web app for creating and sharing AI product pitch cards with edge-managed storage.",
      insights: {},
      country: "USA",
      stage: "",
      likes: 0,
      createdBy: "carapaulson1@gmail.com",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      featured: true,
      visibleToAll: true
    };

    await kv.set("card:000", featuredCard);
    console.log("[AUTO-INIT] ✅ Created featured card #000");
  } catch (error) {
    console.error("[AUTO-INIT] ❌ Error during auto-initialization:", error);
  }
}

// Run auto-initialization before starting the server
await autoInitializeFeaturedCard();

Deno.serve(app.fetch);