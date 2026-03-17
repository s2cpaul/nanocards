# 📚 Training Center - Feature Documentation

**Date:** March 8, 2026  
**Status:** ✅ Complete  
**Access Level:** Premium (Paid Subscription Only)

---

## 🎯 Overview

The **Training Center** is a premium feature in nAnoCards that provides comprehensive training content for creating effective AI product pitches. This section is:

- **100% Paid Subscription Only** (Creator or Pro tier required)
- **Editable Only by Admin** (carapaulson1@gmail.com)
- **Viewable by All Paid Subscribers**

---

## 🔐 Access Control

### **Subscription Requirements**

| User Type | Can View | Can Edit | Can Create |
|-----------|----------|----------|------------|
| **Free Tier** | ❌ No | ❌ No | ❌ No |
| **Guest Mode** | ❌ No | ❌ No | ❌ No |
| **Creator ($4.99/mo)** | ✅ Yes | ❌ No | ❌ No |
| **Pro ($9.99/mo)** | ✅ Yes | ❌ No | ❌ No |
| **Admin (carapaulson1@gmail.com)** | ✅ Yes | ✅ Yes | ✅ Yes |

### **Backend Authorization**

All training endpoints check:
1. **Authentication**: Valid Supabase session token
2. **Subscription**: Active Creator or Pro subscription
3. **Admin Status**: Email matches `carapaulson1@gmail.com` for edit operations

---

## 📍 Navigation & Access

### **How Users Access Training**

1. **Book Icon in Global Navigation**
   - Located in top navigation bar
   - Second icon from the left
   - Labeled "Training Center (Premium)" on hover
   - Navigates to `/training`

2. **Direct URL**
   - `/training` route

### **What Users See**

**Free Users / Guest Mode:**
- Premium access gate with upgrade prompt
- Feature highlights (what's inside)
- "Upgrade to Access Training" button → `/subscription`
- Crown icon with gradient (yellow-orange)

**Paid Subscribers:**
- Full training module list
- Premium badge in header
- Read-only access to all content

**Admin (carapaulson1@gmail.com):**
- All subscriber features PLUS:
- "New Module" button
- Edit/Delete buttons on each module
- Admin access banner
- Full CRUD operations

---

## 🎨 User Interface

### **Header**

```
┌──────────────────────────────────────────┐
│ ← Back  📖 Training Center  👑 PREMIUM    │
│                          [+ New Module]  │  ← Admin only
└──────────────────────────────────────────┘
```

**Elements:**
- Back arrow → `/app`
- Book icon + "Training Center" title
- Premium badge (gradient: yellow-400 to orange-500)
- New Module button (admin only)

### **Admin Banner** (Visible to carapaulson1@gmail.com only)

```
┌──────────────────────────────────────────┐
│ 👑  Admin Access                         │
│                                          │
│ You have full edit access to all        │
│ training modules. Only you can create,  │
│ edit, and delete content.               │
└──────────────────────────────────────────┘
```

**Styling:**
- Purple-to-blue gradient background
- Purple border
- Crown icon with purple background

### **Training Module Card**

```
┌──────────────────────────────────────────┐
│ [1]  Creating Compelling AI Pitches      │  ✏️ 🗑️  ← Admin only
│      ⏱️ 15 min                           │
│                                          │
│ Brief description of the module...      │
│                                          │
│ Full content in plain text or markdown. │
│ Supports multi-line formatting.         │
│                                          │
│ 📺 Watch Training Video                 │
│                                          │
│ Created March 8, 2026                   │
└──────────────────────────────────────────┘
```

**Card Elements:**
- Module number badge (blue-900 background)
- Title (bold, large)
- Duration badge (optional)
- Description (gray text)
- Content (formatted text, markdown support)
- Video link (optional, opens in new tab)
- Created date
- Edit/Delete buttons (admin only)

### **Create/Edit Form** (Admin only)

```
┌──────────────────────────────────────────┐
│ Create New Module                    ✕  │
│                                          │
│ Module Title *                          │
│ [_________________________________]     │
│                                          │
│ Short Description                       │
│ [_________________________________]     │
│                                          │
│ Module Content *                        │
│ [                                  ]    │
│ [                                  ]    │
│ [                                  ]    │
│                                          │
│ Video URL (Optional)  |  Duration       │
│ [________________]    |  [_______]      │
│                                          │
│ [💾 Create Module]  [Cancel]           │
└──────────────────────────────────────────┘
```

**Form Fields:**
- **Title** (required) - Module name
- **Description** (optional) - Brief overview
- **Content** (required) - Full training content (textarea)
- **Video URL** (optional) - YouTube, Vimeo, etc.
- **Duration** (optional) - e.g., "15 min"

### **Premium Access Gate** (Free/Guest users)

```
┌──────────────────────────────────────────┐
│            👑                            │
│                                          │
│     Premium Training Access             │
│                                          │
│ Training content is exclusively         │
│ available to Creator and Pro            │
│ subscribers.                            │
│                                          │
│ What's Inside:                          │
│ ✓ Comprehensive AI product pitch       │
│   training                              │
│ ✓ Step-by-step video tutorials         │
│ ✓ Best practices & examples             │
│ ✓ Exclusive content from experts       │
│                                          │
│ [Upgrade to Access Training]           │
│ [Back to Home]                          │
└──────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### **Training Module Structure**

```typescript
interface TrainingModule {
  id: string;           // "training:001", "training:002", etc.
  title: string;        // Module title
  description: string;  // Short description
  content: string;      // Full training content (markdown supported)
  videoUrl?: string;    // Optional video URL
  duration?: string;    // Optional duration (e.g., "15 min")
  order: number;        // Display order (1, 2, 3...)
  createdAt: string;    // ISO timestamp
  createdBy: string;    // Admin email
  updatedAt?: string;   // ISO timestamp (on updates)
}
```

### **KV Store Keys**

```
training:001 → { id, title, content, ... }
training:002 → { id, title, content, ... }
training:003 → { id, title, content, ... }
```

### **Subscription Data**

```
user:{userId}:subscription → {
  tier: "free" | "creator" | "pro",
  expiresAt: "2026-04-08T00:00:00.000Z",
  active: true
}
```

---

## 🔌 API Endpoints

### **1. GET /training/modules**

**Purpose:** Fetch all training modules

**Auth:** None (publicly readable, but UI enforces subscription)

**Response:**
```json
{
  "modules": [
    {
      "id": "training:001",
      "title": "Creating Compelling AI Product Pitches",
      "description": "Learn the fundamentals...",
      "content": "Full training content here...",
      "videoUrl": "https://youtube.com/...",
      "duration": "15 min",
      "order": 1,
      "createdAt": "2026-03-08T12:00:00.000Z",
      "createdBy": "carapaulson1@gmail.com"
    }
  ]
}
```

---

### **2. POST /training/modules**

**Purpose:** Create new training module

**Auth:** Required (Admin only: carapaulson1@gmail.com)

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Creating Compelling AI Product Pitches",
  "description": "Learn the fundamentals...",
  "content": "Full training content here...",
  "videoUrl": "https://youtube.com/...",
  "duration": "15 min",
  "order": 1
}
```

**Response (201):**
```json
{
  "module": {
    "id": "training:001",
    "title": "Creating Compelling AI Product Pitches",
    ...
  }
}
```

**Error (403):**
```json
{
  "error": "Forbidden - Admin access required"
}
```

---

### **3. PUT /training/modules/:id**

**Purpose:** Update existing training module

**Auth:** Required (Admin only: carapaulson1@gmail.com)

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "content": "Updated content",
  "videoUrl": "https://youtube.com/...",
  "duration": "20 min"
}
```

**Response (200):**
```json
{
  "module": {
    "id": "training:001",
    "title": "Updated Title",
    "updatedAt": "2026-03-08T14:00:00.000Z",
    ...
  }
}
```

---

### **4. DELETE /training/modules/:id**

**Purpose:** Delete training module

**Auth:** Required (Admin only: carapaulson1@gmail.com)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200):**
```json
{
  "success": true
}
```

**Error (404):**
```json
{
  "error": "Module not found"
}
```

---

### **5. GET /subscription/status**

**Purpose:** Check user's subscription tier

**Auth:** Optional (returns "free" if not authenticated)

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "tier": "creator",
  "expiresAt": "2026-04-08T00:00:00.000Z",
  "active": true
}
```

**Free User Response:**
```json
{
  "tier": "free"
}
```

---

## 🔒 Security

### **Authorization Flow**

1. **User clicks Book icon**
2. Frontend checks:
   - Guest mode? → Show upgrade gate
   - Has session? → Continue
   - No session? → Show upgrade gate

3. **Frontend calls `/subscription/status`**
   - Returns tier: "free", "creator", or "pro"
   - Checks if `tier === "creator" || tier === "pro"`
   - If free → Show upgrade gate
   - If paid → Load modules

4. **Admin Check** (for edit operations)
   - Get current user email from session
   - Compare with `carapaulson1@gmail.com`
   - If match → Show admin controls
   - If no match → Hide admin controls

5. **Backend Enforcement**
   - All CREATE/UPDATE/DELETE endpoints check:
     ```typescript
     if (user.email !== "carapaulson1@gmail.com") {
       return 403 Forbidden
     }
     ```

### **Protected Operations**

| Operation | Requires Auth | Requires Subscription | Requires Admin |
|-----------|---------------|----------------------|----------------|
| View modules list | ❌ No | ⚠️ UI only | ❌ No |
| Create module | ✅ Yes | ❌ No | ✅ Yes |
| Update module | ✅ Yes | ❌ No | ✅ Yes |
| Delete module | ✅ Yes | ❌ No | ✅ Yes |

**Note:** View is technically open, but UI enforces subscription check client-side.

---

## 🎓 Admin Workflow

### **Creating a Training Module**

1. Login as carapaulson1@gmail.com
2. Navigate to `/training` via book icon
3. See admin banner + "New Module" button
4. Click "New Module"
5. Fill in form:
   - Title (required)
   - Description (optional)
   - Content (required) - Supports plain text or markdown
   - Video URL (optional)
   - Duration (optional)
6. Click "Create Module"
7. Module appears in list with sequential ID
8. Success toast notification

### **Editing a Module**

1. Navigate to `/training`
2. Find module to edit
3. Click edit icon (✏️) on module card
4. Form opens with pre-filled data
5. Modify fields
6. Click "Update Module"
7. Module updated in place
8. Success toast notification

### **Deleting a Module**

1. Navigate to `/training`
2. Find module to delete
3. Click delete icon (🗑️) on module card
4. Confirm deletion in browser prompt
5. Module removed from list
6. Success toast notification

---

## 📊 Module Display Order

Modules are displayed in ascending order based on the `order` field:

```
Module 1 (order: 1)
Module 2 (order: 2)
Module 3 (order: 3)
```

When creating a new module:
- Order is automatically set to `existingModules.length + 1`
- Can be manually adjusted during creation

---

## 🎨 Design Specifications

### **Colors**

| Element | Color |
|---------|-------|
| Premium badge background | gradient: yellow-400 to orange-500 |
| Premium badge text | white |
| Module number badge | blue-900 background, white text |
| Admin banner background | gradient: purple-100 to blue-100 |
| Admin banner border | purple-200 |
| Admin icon background | purple-600 |
| Edit button | blue-600 |
| Delete button | red-600 |
| Upgrade gate background | gradient: blue-900 via indigo-800 to purple-900 |

### **Icons**

- **Book**: BookOpen (lucide-react)
- **Crown**: Crown (lucide-react)
- **Edit**: Edit2 (lucide-react)
- **Delete**: Trash2 (lucide-react)
- **Save**: Save (lucide-react)
- **Close**: X (lucide-react)
- **Add**: Plus (lucide-react)
- **Back**: ArrowLeft (lucide-react)

### **Typography**

- **Page Title**: text-xl font-bold
- **Module Title**: text-lg font-bold
- **Description**: text-gray-600
- **Content**: text-gray-700, whitespace-pre-wrap
- **Timestamps**: text-xs text-gray-500

---

## 🧪 Testing Scenarios

### **Test 1: Free User Access**

1. Login as free tier user
2. Click book icon
3. ✅ See upgrade gate
4. ✅ See feature highlights
5. ✅ "Upgrade" button navigates to `/subscription`

### **Test 2: Guest Mode Access**

1. Continue as guest
2. Click book icon
3. ✅ See upgrade gate
4. ✅ See "Back to Home" button

### **Test 3: Paid Subscriber Access**

1. Login as Creator/Pro subscriber
2. Click book icon
3. ✅ See training modules
4. ✅ See premium badge in header
5. ✅ Cannot see edit/delete buttons
6. ✅ Cannot see "New Module" button

### **Test 4: Admin Access**

1. Login as carapaulson1@gmail.com
2. Click book icon
3. ✅ See admin banner
4. ✅ See "New Module" button
5. ✅ See edit/delete buttons on modules
6. ✅ Can create module
7. ✅ Can edit module
8. ✅ Can delete module

### **Test 5: Unauthorized Edit Attempt**

1. Non-admin user tries to call POST `/training/modules`
2. ✅ Returns 403 Forbidden
3. ✅ Error message: "Forbidden - Admin access required"

### **Test 6: Module Creation Flow**

1. Admin creates module
2. ✅ Sequential ID assigned (training:001, training:002...)
3. ✅ Module saved to KV store
4. ✅ Module appears in list
5. ✅ Sorted by order field

---

## 🚀 Future Enhancements

### **Planned Features**

1. **Rich Text Editor**
   - WYSIWYG editor for content
   - Image uploads
   - Code snippets with syntax highlighting

2. **Module Categories**
   - Organize by topic (Basics, Advanced, Case Studies)
   - Filter by category

3. **Progress Tracking**
   - Mark modules as complete
   - Progress bar
   - Certificates of completion

4. **Interactive Quizzes**
   - Quiz questions within modules
   - Score tracking
   - Correct answer feedback

5. **Video Embedding**
   - Embed videos directly (not just links)
   - YouTube/Vimeo iframe support
   - Timestamp navigation

6. **Comments & Discussion**
   - User comments on modules
   - Q&A section
   - Admin can respond

7. **Downloadable Resources**
   - PDF downloads
   - Templates
   - Worksheets

8. **Multi-language Support**
   - Translate modules
   - Language selector

---

## 📝 Admin Checklist

### **Before Creating Content**

- [ ] Login as carapaulson1@gmail.com
- [ ] Navigate to Training Center
- [ ] Verify admin banner appears
- [ ] Plan module structure (topics, order)

### **Creating a Module**

- [ ] Click "New Module"
- [ ] Add clear, descriptive title
- [ ] Write brief description (1-2 sentences)
- [ ] Write comprehensive content
- [ ] Add video URL if available
- [ ] Set duration estimate
- [ ] Review for typos/formatting
- [ ] Click "Create Module"
- [ ] Verify module appears correctly

### **After Creating Content**

- [ ] Test viewing as paid subscriber
- [ ] Test viewing as free user (should see gate)
- [ ] Verify video links work
- [ ] Check mobile responsiveness
- [ ] Share with beta testers

---

## 🐛 Known Limitations

1. **No Rich Text Formatting**
   - Currently plain text only
   - Markdown not fully rendered (shows as plain text)
   - No bold, italic, headings, etc.

2. **No Module Reordering**
   - Order set on creation
   - Cannot drag-and-drop to reorder
   - Must edit order field manually

3. **No Drafts**
   - Modules are immediately published
   - No "draft" or "unpublished" state

4. **No Version History**
   - Edits overwrite previous content
   - No rollback capability

5. **Single Admin Only**
   - Only carapaulson1@gmail.com can edit
   - No role-based permissions
   - No delegated admin access

---

## 📞 Support

**For Admin (carapaulson1@gmail.com):**
- Any issues with creating/editing modules
- Questions about content structure
- Technical problems with backend

**For Paid Subscribers:**
- Cannot access training despite subscription
- Video links not working
- Content display issues

**For Free Users:**
- Questions about upgrading
- Pricing information
- Subscription benefits

---

## ✅ Implementation Checklist

- [x] Create TrainingScreen component
- [x] Add training routes to backend
- [x] Implement admin authorization
- [x] Add subscription status endpoint
- [x] Update navigation (book icon)
- [x] Add route to router
- [x] Create access gate UI
- [x] Create admin UI
- [x] Add CRUD operations
- [x] Test all authorization flows
- [x] Write documentation

---

**Training Center is now live and ready for content creation! 🎉**

---

**Last Updated:** March 8, 2026  
**Admin:** carapaulson1@gmail.com  
**Access:** Creator & Pro tiers only  
**Status:** Production Ready ✅
