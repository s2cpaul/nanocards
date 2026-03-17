# Edit Pencil Locations on All Cards in nAnoCards

## ✅ Card Type 1: Regular nAnoCards (NanoCardComponent)
**Used in:** Home Feed, Profile Screen, Top nAnoCards View

```
┌─────────────────────────────────────┐
│ 📝 Edit                         QR  │ ← Top-left: Edit pencil
│                                     │   Top-right: QR code
│                                     │
│  Title: AI Product Name Here        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    Video Thumbnail          │   │
│  │    with Play Button         │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Social Icons Row 1]               │
│  [Social Icons Row 2]               │
│  ❤️ 42  #001                        │
└─────────────────────────────────────┘
```

**Code Location:** `/src/app/components/NanoCardComponent.tsx` (Line 815-822)
```tsx
{/* Edit Pencil Icon - Top Left Corner */}
<button
  onClick={() => setShowEditMode(true)}
  className="absolute top-2 left-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors z-10"
  title={`Edit Card #${card.id}`}
>
  <Edit3 className="w-4 h-4 text-gray-600" />
</button>
```

---

## ✅ Card Type 2: Training Module Cards (TrainingScreen)
**Used in:** Training Center

```
┌─────────────────────────────────────┐
│ 📝 Edit                         QR  │ ← Top-left: Edit pencil (admin only)
│                                     │   Top-right: QR code
│                                     │
│  Title: Module Name Here            │
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │    Video Thumbnail          │   │
│  │    with Play Button         │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  Category Badge                     │
│  Description text...                │
│  👁️ 125                             │
└─────────────────────────────────────┘
```

**Code Location:** `/src/app/components/TrainingScreen.tsx` (Line 774-783)
```tsx
{/* Edit Pencil Icon - Top Left Corner (only for admin and non-placeholder) */}
{isAdmin && !module.isPlaceholder && (
  <button
    onClick={() => startEdit(module)}
    className="absolute top-2 left-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors z-10"
    title={`Edit Module #${cardId}`}
  >
    <Edit2 className="w-4 h-4 text-gray-600" />
  </button>
)}
```

---

## 📍 Summary of Pencil Positions

| Card Type | Location | Color | Icon | Visibility |
|-----------|----------|-------|------|------------|
| **nAnoCards** | Top-left corner | Dark gray (#4B5563) | `Edit3` (lucide) | ✅ Always visible |
| **Training Modules** | Top-left corner | Dark gray (#4B5563) | `Edit2` (lucide) | ✅ Admin only |

---

## 🎯 Why Top-Left?

**Original Issue:** Edit pencils were at `top-2 right-2` which conflicted with the QR code position, causing them to be hidden.

**Solution:** Moved all edit pencils to `top-2 left-2` (top-left corner) to avoid QR code overlap.

---

## 🔍 Where Cards Are Displayed

### Regular nAnoCards (NanoCardComponent):
1. ✅ **MainApp.tsx** - Home feed (line 582-589)
2. ✅ **ProfileScreen.tsx** - User's cards section (line 374-381)
3. ✅ **Top nAnoCards view** - Accessible via "?view=all" parameter

### Training Module Cards:
4. ✅ **TrainingScreen.tsx** - Training Center module grid (line 766-950)

---

## 🎨 Styling Details

**Pencil Button Styles:**
- Position: `absolute top-2 left-2`
- Z-index: `z-10` (ensures it's above other card elements)
- Padding: `p-1.5` (6px all sides)
- Background on hover: `hover:bg-gray-100`
- Border radius: `rounded-lg`
- Icon size: `w-4 h-4` (16px × 16px)
- Icon color: `text-gray-600`
- Transition: `transition-colors` (smooth color change on hover)

**QR Code Position (no conflict):**
- Position: `absolute top-2 right-2`
- Safe distance from edit pencil ✅

---

## ✅ All Edit Functionality Working

When you click the edit pencil:
1. **nAnoCards**: Opens inline edit modal with:
   - Title editing (40 char limit with counter)
   - Video time editing
   - Stage dropdown
   - All social/resource links editing
   - Save button with loading state

2. **Training Modules**: Opens edit modal with:
   - Module details editing
   - Quiz/survey content editing
   - Save functionality

---

**Last Updated:** March 16, 2026
**Status:** ✅ All edit pencils visible and functional
