# Testing Login & Card Creation - nAnoCards

## ✅ Your Test Account

**Email:** carapaulson1@gmail.com  
**Status:** Should exist in Supabase  
**Tier:** Verify in account settings after login

---

## 🧪 Step-by-Step Testing

### **Step 1: Go to Login Page**

1. Visit: https://nanocards.now/login
2. You should see:
   - Email input field
   - Password input field
   - "Log In" button
   - "Create Account" link
   - "Continue as guest" option

### **Step 2: Enter Your Credentials**

1. **Email:** carapaulson1@gmail.com
2. **Password:** (Enter your Supabase password)
3. Click **"Log In"**

### **Step 3: What Should Happen**

**Success:**
- ✅ See toast notification: "Logged in successfully"
- ✅ Automatically redirected to `/app`
- ✅ See "Welcome back" or user profile in header
- ✅ Display name shows in top right

**If Error:**
- ❌ Check password is correct
- ❌ Check account exists in Supabase
- ❌ Check Supabase environment variables are set
- ❌ See error message in toast notification

### **Step 4: Navigate to Create Card**

Once logged in:
1. Look for button to create new card (usually in header or home page)
2. Click **"+ Create Card"** or similar button
3. You should see the card creation form

### **Step 5: Create a Test Card**

Fill in the form:
- **Title:** "Test Card" (40 chars max)
- **Objective:** "Testing the card creation flow"
- **Video URL:** (optional - can leave blank)
- **Video Time:** 0:00 (if no video)
- **Stage:** Select one from dropdown
- **Category:** "Promotional" (default)
- Click **"Create Card"**

### **Step 6: Verify Card Created**

**Success:**
- ✅ Toast notification: "Card created successfully"
- ✅ Redirected to cards list or dashboard
- ✅ Your new card appears in the list
- ✅ Card shows your name as creator

---

## 🔍 Troubleshooting

### **Login Issues**

| Problem | Solution |
|---------|----------|
| "Invalid credentials" | Check password spelling, reset if needed |
| "User not found" | Account may not exist - check Supabase dashboard |
| "Invalid email format" | Make sure email is correct: carapaulson1@gmail.com |
| Blank error | Check browser console (F12) for details |

### **Card Creation Issues**

| Problem | Solution |
|---------|----------|
| "Must be logged in" | Not authenticated - try logout and login again |
| "Title too long" | Keep title under 40 characters |
| "Missing required fields" | Fill all required fields |
| Card doesn't appear | Refresh page or check network tab |

---

## 📋 Verification Checklist

After logging in, verify:

- [ ] Profile shows your email (carapaulson1@gmail.com)
- [ ] Subscription tier is visible
- [ ] User points are displayed
- [ ] Can access Create Card page
- [ ] Can submit a new card
- [ ] Card appears in your cards list
- [ ] Card has correct title and details
- [ ] Can edit the card you created
- [ ] Can delete the card you created
- [ ] Can log out and log back in

---

## 🖥️ Browser Developer Tools

If you encounter issues, open **DevTools (F12)** and check:

1. **Console Tab:** Any error messages?
2. **Network Tab:** Are requests succeeding (200 status)?
3. **Application Tab:** Check Local Storage for auth token
4. **Network → XHR:** API calls to Supabase/Edge Functions

---

## 📞 Common Issues & Fixes

### **Issue: Login page keeps asking for credentials**
**Fix:** Clear browser cache and cookies, then try again

### **Issue: Profile picture not loading**
**Fix:** Normal - avatar will be generated when needed

### **Issue: Can't find Create Card button**
**Fix:** Look in header menu or try navigating to `/create-card` directly

### **Issue: Card created but doesn't appear**
**Fix:** 
1. Refresh the page
2. Check Network tab in DevTools
3. Verify the API response was successful

---

## 🎯 What to Test Next (After Login Works)

1. ✅ Create a card with video URL
2. ✅ Generate QR code for card
3. ✅ Share card link
4. ✅ View card details
5. ✅ Edit card
6. ✅ Delete card
7. ✅ View subscription tier page
8. ✅ Check user profile/account settings

---

## 📧 If Account Doesn't Exist

If login fails with "user not found":

1. Go to: https://nanocards.now/signup
2. Create new account with carapaulson1@gmail.com
3. Set a password
4. Verify email (check inbox)
5. Log in with the new account

---

**Ready to test? Visit: https://nanocards.now/login** 🚀
