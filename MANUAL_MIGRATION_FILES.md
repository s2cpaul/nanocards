# 📦 MANUAL MIGRATION - Complete File List

## ✅ **EXACT FILES TO COPY FROM FIGMA MAKE → VS CODE**

Copy these **3 files** completely (entire file contents):

---

## 🎯 **CORE FILES (Both Features)**

### 1️⃣ `/src/app/components/NanoCardComponent.tsx`
**Features:** Both Thought Bubble + Edit Pencil  
**Action:** Copy the ENTIRE file from Figma Make → VS Code  
**Why:** Contains:
- `showInfoPopup` state (line 95)
- Edit3 pencil icon import (line 1)
- Edit pencil buttons next to card IDs (lines 932-936, 1074-1075, 1252-1253)
- Thought bubble popup on video (lines 1146-1173)
- Info icon with hover triggers (lines 1193-1194)

---

### 2️⃣ `/src/app/components/TrainingScreen.tsx`
**Features:** Both Thought Bubble + Edit Pencil  
**Action:** Copy the ENTIRE file from Figma Make → VS Code  
**Why:** Contains:
- `showInfoPopup` state with module ID tracking (line 55)
- Edit3 pencil icon import (line 3)
- Edit pencil button next to module ID (lines 1084-1085)
- Thought bubble popup on video (lines 941-971)
- Info icon with hover triggers (lines 991-992)
- Centered thought bubble display (lines 999-1030)
- `information?: string` in TrainingModule interface

---

### 3️⃣ `/src/app/components/EditCardModal.tsx`
**Features:** Edit Pencil Modal  
**Action:** Copy the ENTIRE file from Figma Make → VS Code  
**Why:** This is the modal that opens when clicking Edit pencil  
**Note:** This file might already exist in VS Code - if so, REPLACE it completely

---

## 📋 **OPTIONAL (Only if you use these)**

### 4️⃣ `/src/app/components/HamburgerMenu.tsx`
**Features:** Edit3 pencil in menu (if you have Quick Edit menu item)  
**Action:** Only copy if you see "Quick Edit" in your hamburger menu  
**Changes:**
- Edit3 import (line 1)
- Edit3 icon in menu (line 151)

---

## 🔧 **HOW TO MANUALLY MIGRATE**

### **Step 1: Open Both Environments**
- **Left Screen:** Figma Make (this environment)
- **Right Screen:** VS Code

### **Step 2: For EACH file above:**

1. **In Figma Make:**
   - Click the file name
   - Press `Ctrl+A` (Windows) or `Cmd+A` (Mac) to select all
   - Press `Ctrl+C` or `Cmd+C` to copy

2. **In VS Code:**
   - Open the same file path
   - Press `Ctrl+A` or `Cmd+A` to select all
   - Press `Ctrl+V` or `Cmd+V` to paste
   - Press `Ctrl+S` or `Cmd+S` to save

3. **Verify:**
   - Check for syntax errors (red squiggles)
   - Make sure the file saved successfully

### **Step 3: Test the App**

1. **Hard Refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Test Thought Bubble:**
   - Find any card with a blue ⓘ icon
   - Hover over it
   - White thought bubble should appear over video area
3. **Test Edit Pencil:**
   - Find the Edit3 pencil icon next to card ID
   - Click it
   - Modal should open with edit form

---

## ✅ **CHECKLIST**

After copying all files, verify:

- [ ] NanoCardComponent.tsx saved successfully
- [ ] TrainingScreen.tsx saved successfully  
- [ ] EditCardModal.tsx saved successfully
- [ ] HamburgerMenu.tsx copied (if applicable)
- [ ] No syntax errors in VS Code
- [ ] App refreshed in browser
- [ ] Thought bubble works (hover blue ⓘ icon)
- [ ] Edit pencil works (click Edit3 icon next to ID)

---

## 🚨 **COMMON ISSUES**

### **Issue 1: "EditCardModal not found"**
**Solution:** Make sure `/src/app/components/EditCardModal.tsx` exists

### **Issue 2: "Edit3 is not defined"**
**Solution:** Check line 1 of NanoCardComponent.tsx includes:
```tsx
import { ..., Edit3 } from "lucide-react";
```

### **Issue 3: "showInfoPopup is not defined"**
**Solution:** Check state declarations:
- NanoCardComponent.tsx line 95: `const [showInfoPopup, setShowInfoPopup] = useState(false);`
- TrainingScreen.tsx line 55: `const [showInfoPopup, setShowInfoPopup] = useState<string | null>(null);`

### **Issue 4: Thought bubble doesn't appear**
**Solution:** 
1. Make sure you're hovering over the **blue ⓘ icon**
2. Check browser console for errors (F12)
3. Verify the card has `information` or `insights.information` data

### **Issue 5: Edit modal doesn't open**
**Solution:**
1. Check that EditCardModal.tsx was copied
2. Verify the edit button has `onClick={handleEditClick}` or similar
3. Check browser console for errors

---

## 💡 **WHY FULL FILE COPY WORKS BETTER**

Copying full files avoids:
- ❌ Missing context/dependencies
- ❌ Indentation issues
- ❌ Incomplete code blocks
- ❌ State variable mismatches

Full file copy ensures:
- ✅ Complete imports
- ✅ Proper state declarations
- ✅ All event handlers connected
- ✅ Exact code structure

---

## 📊 **FILE SUMMARY**

| File | Size Estimate | Features | Priority |
|------|--------------|----------|----------|
| NanoCardComponent.tsx | ~1300 lines | Both | **REQUIRED** |
| TrainingScreen.tsx | ~1100 lines | Both | **REQUIRED** |
| EditCardModal.tsx | ~300 lines | Edit | **REQUIRED** |
| HamburgerMenu.tsx | ~300 lines | Edit | Optional |

---

## 🎯 **QUICK MIGRATION (3 STEPS)**

1. **Copy NanoCardComponent.tsx** (entire file)
2. **Copy TrainingScreen.tsx** (entire file)
3. **Copy EditCardModal.tsx** (entire file)

Done! 🚀

---

## ❓ **STILL NEED HELP?**

Tell me:
1. Which file you're copying
2. Any error messages
3. What happens when you test

I'm here to help! 💪
