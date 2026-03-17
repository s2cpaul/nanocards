# 🔵 Stripe Integration Setup Guide for nAnoCards

## What You Need from Stripe Dashboard

You'll need to get **3 keys** from your Stripe account. Here's where to find them:

---

## 📍 Step 1: Get Your API Keys

### Go to Stripe Dashboard:
1. Visit: https://dashboard.stripe.com
2. Log into your Stripe account

### Find Your Keys:
1. Click **"Developers"** in the top navigation
2. Click **"API keys"** in the left sidebar
3. You'll see two keys:

   **A) Publishable Key** (starts with `pk_live_...` or `pk_test_...`)
   - ✅ This is safe to use in your frontend
   - ✅ Already configured in your environment as `STRIPE_PUBLISHABLE_KEY`
   
   **B) Secret Key** (starts with `sk_live_...` or `sk_test_...`)
   - ⚠️ NEVER share this or put it in frontend code
   - ⚠️ Only use on your server
   - 📋 **Copy this now - you'll need it in Step 3**

---

## 📍 Step 2: Create Your Subscription Products

Before accepting payments, you need to create your subscription plans in Stripe:

### Go to Products:
1. In Stripe Dashboard, click **"Products"** in the left sidebar
2. Click **"+ Add product"**

### Create Each Tier:

**Student Tier (FREE):**
- Name: `nAnoCards Student`
- Description: `Free tier for .edu, .k12, and .mil emails - 2 cards`
- Pricing: One time → $0.00 (or skip creating a product for free tier)

**Creator Tier ($4.99/month):**
1. Name: `nAnoCards Creator`
2. Description: `Create up to 10 pitch cards`
3. Pricing Model: **Recurring**
4. Price: `$4.99`
5. Billing period: **Monthly**
6. Click **"Save product"**
7. ⭐ **COPY THE PRICE ID** (starts with `price_...`) - you'll need this!

**Pro Tier ($9.99/month):**
1. Name: `nAnoCards Pro`
2. Description: `Create up to 49 pitch cards`
3. Pricing Model: **Recurring**
4. Price: `$9.99`
5. Billing period: **Monthly**
6. Click **"Save product"**
7. ⭐ **COPY THE PRICE ID** (starts with `price_...`) - you'll need this!

**Enterprise Tier ($12.99/month):**
1. Name: `nAnoCards Enterprise`
2. Description: `LMS and Enterprise add-ons with unlimited cards`
3. Pricing Model: **Recurring**
4. Price: `$12.99`
5. Billing period: **Monthly**
6. Click **"Save product"**
7. ⭐ **COPY THE PRICE ID** (starts with `price_...`) - you'll need this!

---

## 📍 Step 3: Add Your Secret Key

The system will prompt you to add your **Stripe Secret Key**:

1. Copy your Secret Key from Step 1 (starts with `sk_live_...` or `sk_test_...`)
2. Paste it when prompted
3. This will be stored securely and only used on your server

---

## 📍 Step 4: Webhooks (We'll Set This Up After Deployment)

### What Are Webhooks?

Webhooks let Stripe notify your app when payments succeed/fail. Think of it like Stripe calling your app to say "Hey, this customer just paid!"

### When to Set This Up:

⏭️ **Skip this for now** - we'll set it up after you deploy your app to production.

### How It Works (For Later):

1. After deployment, you'll have a live URL like: `https://yourapp.com`
2. Go to Stripe Dashboard → **Developers** → **Webhooks**
3. Click **"Add endpoint"**
4. Enter: `https://[your-project-id].supabase.co/functions/v1/make-server-d91f8206/stripe/webhook`
5. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
6. Copy the **Signing Secret** (starts with `whsec_...`)
7. Add it to your environment variables

---

## 🧪 Test Mode vs Live Mode

### Test Mode (Recommended First):
- Use keys starting with `pk_test_...` and `sk_test_...`
- Use test credit card: `4242 4242 4242 4242`, any future expiry, any CVC
- No real money charged
- Perfect for testing!

### Live Mode (When Ready):
- Use keys starting with `pk_live_...` and `sk_live_...`
- Real credit cards only
- Real money charged
- Use only after thorough testing!

---

## ✅ Quick Checklist

Before proceeding, make sure you have:

- [ ] Stripe account created and logged in
- [ ] Secret Key copied (starts with `sk_`)
- [ ] Publishable Key copied (starts with `pk_`)
- [ ] Created 3 subscription products (Creator, Pro, Enterprise)
- [ ] Copied all 3 Price IDs (start with `price_`)

---

## 🎯 What Happens Next?

After you provide your keys:

1. ✅ Your app will create real Stripe checkout sessions
2. ✅ Users can enter credit card info securely (Stripe handles this)
3. ✅ Successful payments automatically upgrade subscriptions
4. ✅ Subscriptions renew automatically each month
5. ✅ Users can cancel anytime from their account

---

## 💡 Important Notes

- **Security**: Your Secret Key is stored securely and never exposed to users
- **PCI Compliance**: Stripe handles all credit card data - you never see it
- **Testing**: Always test with test keys before going live
- **Refunds**: You can issue refunds from the Stripe Dashboard
- **Analytics**: View all payment data in Stripe Dashboard

---

## 🆘 Need Help?

- **Stripe Docs**: https://stripe.com/docs
- **Test Cards**: https://stripe.com/docs/testing
- **Support**: https://support.stripe.com

---

## 🚀 Ready?

Once you have your **Secret Key** and **Price IDs**, we'll update your app configuration!
