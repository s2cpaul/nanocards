# OAuth Provider Setup Instructions for nAnoCards

## Overview
This guide will help you enable LinkedIn and Discord login for your nAnoCards app. Follow these instructions to complete the OAuth provider configuration in Supabase.

---

## 🔵 LinkedIn OAuth Setup

### Step 1: Create a LinkedIn App
1. Go to the [LinkedIn Developers Portal](https://www.linkedin.com/developers/apps)
2. Click **"Create app"**
3. Fill in the required information:
   - **App name**: nAnoCards
   - **LinkedIn Page**: Select your company page (or create one if needed)
   - **App logo**: Upload your nAnoCards logo
   - **Legal agreement**: Check the box to agree
4. Click **"Create app"**

### Step 2: Configure OAuth Settings
1. In your LinkedIn app dashboard, go to the **"Auth"** tab
2. Under **"OAuth 2.0 settings"**, add the following redirect URL:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   Replace `[YOUR-PROJECT-ID]` with your actual Supabase project ID

3. Click **"Update"** to save

### Step 3: Get Your Credentials
1. In the **"Auth"** tab, find your:
   - **Client ID**
   - **Client Secret** (click "Show" to reveal it)
2. Copy these values - you'll need them for Supabase

### Step 4: Request Required Permissions
1. Go to the **"Products"** tab
2. Request access to **"Sign In with LinkedIn using OpenID Connect"**
3. Wait for approval (usually instant for basic access)

### Step 5: Configure Supabase
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your nAnoCards project
3. Navigate to **Authentication** → **Providers**
4. Find **LinkedIn (OIDC)** in the list
5. Toggle it **ON**
6. Enter your LinkedIn credentials:
   - **Client ID**: Paste from LinkedIn
   - **Client Secret**: Paste from LinkedIn
7. Click **"Save"**

### Step 6: Test the Integration
1. Go to your nAnoCards login page
2. Click **"Continue with LinkedIn"**
3. You should be redirected to LinkedIn to authorize
4. After authorization, you'll be redirected back to your app

**LinkedIn Setup Complete! ✅**

---

## 🟣 Discord OAuth Setup

### Step 1: Create a Discord Application
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Enter application name: **nAnoCards**
4. Agree to the Terms of Service
5. Click **"Create"**

### Step 2: Configure OAuth2 Settings
1. In your Discord application dashboard, go to **"OAuth2"** in the left sidebar
2. Under **"Redirects"**, click **"Add Redirect"**
3. Enter the following redirect URL:
   ```
   https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback
   ```
   Replace `[YOUR-PROJECT-ID]` with your actual Supabase project ID

4. Click **"Save Changes"**

### Step 3: Get Your Credentials
1. In the **"OAuth2"** section, under **"Client information"**, you'll find:
   - **Client ID** (visible)
   - **Client Secret** (click "Reset Secret" if you haven't created one yet)
2. Copy these values - you'll need them for Supabase
3. **⚠️ Important**: Save your Client Secret immediately - you won't be able to see it again!

### Step 4: Configure Supabase
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your nAnoCards project
3. Navigate to **Authentication** → **Providers**
4. Find **Discord** in the list
5. Toggle it **ON**
6. Enter your Discord credentials:
   - **Client ID**: Paste from Discord
   - **Client Secret**: Paste from Discord
7. Click **"Save"**

### Step 5: Test the Integration
1. Go to your nAnoCards login page
2. Click **"Continue with Discord"**
3. You should be redirected to Discord to authorize
4. After authorization, you'll be redirected back to your app

**Discord Setup Complete! ✅**

---

## 📋 Quick Reference

### Your Supabase Project Info
- **Project ID**: Find this in your Supabase project URL
- **Redirect URL Format**: `https://[PROJECT-ID].supabase.co/auth/v1/callback`

### Already Configured Providers
✅ Gmail (Google OAuth)
✅ Outlook (Azure OAuth)
✅ GitHub

### Providers to Configure
⬜ LinkedIn (OIDC)
⬜ Discord

---

## 🔧 Troubleshooting

### LinkedIn Issues
- **"Provider not enabled" error**: Make sure you've enabled LinkedIn (OIDC) in Supabase, not regular LinkedIn
- **Redirect URI mismatch**: Double-check that the redirect URL in LinkedIn exactly matches your Supabase callback URL
- **"Sign In with LinkedIn" not available**: Make sure you requested the OpenID Connect product in LinkedIn

### Discord Issues
- **"Invalid OAuth2 redirect_uri"**: Verify the redirect URL in Discord matches your Supabase callback URL exactly
- **"Provider not enabled" error**: Ensure Discord is toggled ON in Supabase Authentication settings
- **Client Secret error**: You may need to reset your client secret in Discord and update it in Supabase

---

## 📚 Official Documentation Links

- **Supabase LinkedIn Setup**: https://supabase.com/docs/guides/auth/social-login/auth-linkedin
- **Supabase Discord Setup**: https://supabase.com/docs/guides/auth/social-login/auth-discord
- **LinkedIn Developers**: https://www.linkedin.com/developers/
- **Discord Developer Portal**: https://discord.com/developers/applications

---

## ✅ Verification Checklist

After completing both setups, verify:

- [ ] LinkedIn app created in LinkedIn Developers Portal
- [ ] LinkedIn redirect URL configured correctly
- [ ] LinkedIn Client ID and Secret added to Supabase
- [ ] LinkedIn (OIDC) provider enabled in Supabase
- [ ] Discord application created in Discord Developer Portal
- [ ] Discord redirect URL configured correctly
- [ ] Discord Client ID and Secret added to Supabase
- [ ] Discord provider enabled in Supabase
- [ ] Tested LinkedIn login on nAnoCards
- [ ] Tested Discord login on nAnoCards

---

**Need Help?**
If you encounter any issues, check the error messages in your browser console and refer to the troubleshooting section above or the official Supabase documentation.

Good luck with your setup! 🚀
