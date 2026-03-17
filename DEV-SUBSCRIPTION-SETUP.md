# 🧪 Development: Testing Training Feature with Mock Subscription

**Purpose:** Test the Training Center feature before implementing full Stripe integration

---

## 🎯 Quick Setup for Testing

Since Stripe integration isn't complete yet, here's how to manually set subscription status for testing:

### **Option 1: Admin Testing (Easiest)**

1. **Login as carapaulson1@gmail.com**
   - You automatically have full access
   - No subscription needed (admin bypass)
   - Can create, edit, delete modules

### **Option 2: Create Mock Subscription via Backend**

You can manually set a subscription in the KV store for testing:

**Backend Endpoint (Create This Temporarily):**

Add this to `/supabase/functions/server/index.tsx`:

```typescript
// TEMPORARY DEV ONLY - Remove before production
app.post("/make-server-d91f8206/dev/set-subscription", async (c) => {
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
    const { tier } = body; // "free", "creator", or "pro"

    // Set subscription (expires in 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const subscription = {
      tier: tier || "creator",
      expiresAt: expiresAt.toISOString(),
      active: true,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${user.id}:subscription`, subscription);

    return c.json({ 
      message: "Subscription set successfully",
      subscription 
    });
  } catch (error) {
    console.error("Error setting subscription:", error);
    return c.json({ error: "Failed to set subscription" }, 500);
  }
});
```

**Frontend Test Script:**

Open browser console on `/app` and run:

```javascript
// Get your auth token
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

// Set yourself to Creator tier
const response = await fetch('https://YOUR-PROJECT-ID.supabase.co/functions/v1/make-server-d91f8206/dev/set-subscription', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ tier: 'creator' })
});

const result = await response.json();
console.log('Subscription set:', result);

// Refresh page to see training access
location.reload();
```

---

## 🧪 Testing Scenarios

### **Test 1: Admin Access (carapaulson1@gmail.com)**

1. Login as carapaulson1@gmail.com
2. Click book icon
3. ✅ See admin banner
4. ✅ See "New Module" button
5. Create a test module
6. Edit it
7. Delete it

**Expected:** Full CRUD access, no subscription needed

---

### **Test 2: Free User**

1. Login as any other email
2. Click book icon
3. ✅ See upgrade gate
4. ✅ Cannot access training

**Expected:** Premium gate with upgrade CTA

---

### **Test 3: Mock Paid Subscriber**

1. Login as any email (not admin)
2. Run subscription setup script (above)
3. Refresh page
4. Click book icon
5. ✅ See training modules
6. ✅ Cannot see admin controls
7. ✅ Can read all content

**Expected:** Read-only access to all training

---

### **Test 4: Guest Mode**

1. Continue as guest
2. Click book icon
3. ✅ See premium gate
4. ✅ "Back to Home" button works

**Expected:** No access, clear upgrade message

---

## 🗂️ Sample Training Content

Here are some sample modules you can create for testing:

### **Module 1: Introduction to nAnoCards**

**Title:** Welcome to nAnoCards - Your AI Pitch Platform

**Description:** Learn the basics of creating compelling AI product pitch cards

**Content:**
```
Welcome to nAnoCards!

In this module, you'll learn:

1. What makes a great AI product pitch
2. How to structure your 90-second video
3. Best practices for engagement
4. Using interactive elements effectively

Key Takeaways:
- Keep it concise (90 seconds max)
- Focus on the problem you're solving
- Show, don't just tell
- Include a clear call-to-action
- Use interactive quizzes to boost engagement

Next Steps:
Complete Module 2 to learn about video production best practices.
```

**Video URL:** https://youtube.com/watch?v=example1
**Duration:** 10 min

---

### **Module 2: Video Production Tips**

**Title:** Creating Professional 90-Second Pitch Videos

**Description:** Master the art of video storytelling in under 2 minutes

**Content:**
```
Video Production Essentials

Equipment:
- Smartphone camera (modern phones are sufficient)
- Good lighting (natural light or ring light)
- Clear audio (external mic recommended)
- Stable tripod or mount

Structure:
0-15 seconds: Hook (grab attention)
15-45 seconds: Problem (what pain point are you solving?)
45-75 seconds: Solution (your AI product)
75-90 seconds: Call-to-action (what you want viewers to do)

Pro Tips:
- Script your pitch and practice
- Record multiple takes
- Use subtitles for accessibility
- Keep background simple and uncluttered
- Smile and show enthusiasm!

Common Mistakes to Avoid:
- Too much technical jargon
- No clear call-to-action
- Poor audio quality
- Going over 90 seconds
```

**Video URL:** https://youtube.com/watch?v=example2
**Duration:** 15 min

---

### **Module 3: Maximizing Engagement**

**Title:** Interactive Elements: Quizzes, Surveys & Drag-Drop

**Description:** Boost engagement by up to 3x with interactive content

**Content:**
```
Why Interactive Elements Matter

Studies show that cards with interactive elements get:
- 3x longer view time
- 2x more shares
- 5x more conversions

Types of Interactive Content:

1. QUIZZES
   Best for: Testing knowledge, product fit
   Example: "Which pricing tier is right for you?"

2. SURVEYS
   Best for: Gathering feedback, understanding needs
   Example: "What's your biggest challenge with AI?"

3. DRAG & DROP
   Best for: Gamification, ranking preferences
   Example: "Rank these features by importance"

Best Practices:
- Keep questions simple and clear
- Limit to 3-5 questions
- Provide immediate feedback
- Use results to guide viewers
- Make it fun, not a test

Implementation:
Step 1: Enable interactive content in create form
Step 2: Choose your type (quiz/survey/drag-drop)
Step 3: Write your question
Step 4: Add answer options
Step 5: Preview and publish

Measuring Success:
- Track completion rates
- Analyze answer patterns
- A/B test different questions
- Iterate based on data
```

**Video URL:** https://youtube.com/watch?v=example3
**Duration:** 20 min

---

## 🔧 Manual Database Setup (If Needed)

If you want to manually add training modules to the KV store without using the UI:

**Using Supabase SQL Editor:**

```sql
-- This won't work directly since we're using KV store, not SQL
-- You need to use the backend API or create via admin UI
```

**Using Backend API (Postman/Thunder Client):**

```bash
# Create Module 1
POST https://YOUR-PROJECT.supabase.co/functions/v1/make-server-d91f8206/training/modules
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "title": "Introduction to nAnoCards",
  "description": "Learn the basics of creating compelling AI product pitch cards",
  "content": "Full content here...",
  "videoUrl": "https://youtube.com/watch?v=example1",
  "duration": "10 min",
  "order": 1
}
```

---

## 🚨 Important Notes

### **Before Going to Production:**

1. ✅ **Remove dev subscription endpoint** (`/dev/set-subscription`)
2. ✅ **Implement real Stripe integration**
3. ✅ **Add webhook to update subscription status**
4. ✅ **Test subscription expiration logic**
5. ✅ **Add grace period for expired subscriptions**
6. ✅ **Implement subscription management UI**

### **Security Reminders:**

- ⚠️ Never commit admin credentials
- ⚠️ Dev endpoint is for testing only
- ⚠️ Always validate admin email on backend
- ⚠️ Use environment variables for sensitive data

---

## 📊 Checking Current Subscription Status

**Browser Console Command:**

```javascript
// Get current subscription status
const { data: { session } } = await supabase.auth.getSession();
const token = session.access_token;

const response = await fetch('https://YOUR-PROJECT.supabase.co/functions/v1/make-server-d91f8206/subscription/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const status = await response.json();
console.log('Your subscription:', status);
```

**Expected Responses:**

```javascript
// Free user
{ tier: "free" }

// Creator tier
{ tier: "creator", expiresAt: "2026-04-08T...", active: true }

// Pro tier
{ tier: "pro", expiresAt: "2026-04-08T...", active: true }

// Expired
{ tier: "free", expired: true }
```

---

## ✅ Quick Test Checklist

### **As Admin (carapaulson1@gmail.com):**

- [ ] Login to app
- [ ] Click book icon → Navigate to training
- [ ] See admin banner
- [ ] Click "New Module"
- [ ] Create test module
- [ ] Verify module appears in list
- [ ] Click edit icon
- [ ] Update module
- [ ] Verify changes saved
- [ ] Click delete icon
- [ ] Confirm deletion
- [ ] Verify module removed

### **As Free User:**

- [ ] Login with different email
- [ ] Click book icon
- [ ] See premium gate
- [ ] Verify "Upgrade" button exists
- [ ] Verify cannot access training

### **As Mock Paid User:**

- [ ] Login with different email
- [ ] Run subscription setup script
- [ ] Refresh page
- [ ] Click book icon
- [ ] See training modules
- [ ] Verify no edit/delete buttons
- [ ] Verify can read all content
- [ ] Click video links (should open)

### **As Guest:**

- [ ] Continue as guest
- [ ] Click book icon
- [ ] See premium gate
- [ ] Verify "Back to Home" works
- [ ] Cannot access training

---

## 🎓 Next Steps After Testing

1. **Content Creation**
   - Create 5-10 high-quality training modules
   - Record professional videos
   - Test content with beta users

2. **Stripe Integration**
   - Set up Stripe account
   - Create products (Creator, Pro)
   - Implement checkout flow
   - Add webhook handlers

3. **Subscription Management**
   - Build subscription page (`/subscription`)
   - Add billing portal
   - Implement cancellation flow
   - Add upgrade/downgrade logic

4. **Analytics**
   - Track module views
   - Monitor completion rates
   - Measure engagement
   - A/B test content

---

**Ready to test! 🚀**

For any issues, check browser console for errors and verify:
1. User is authenticated
2. Backend endpoints are accessible
3. KV store is functioning
4. Admin email is correct

---

**Testing Guide Complete**  
**Date:** March 8, 2026  
**Status:** Ready for Development Testing
