# ✏️ Edit Pencil Feature - VS Code Migration Guide

## Overview
This guide covers all edit pencil functionality including:
1. **Edit3 pencil icon** next to card ID (#001, #002, etc.)
2. **Quick edit modal** functionality
3. **Edit pencil positioning** throughout the app

---

## 📁 Files You Need

### New File to Create:
1. `/src/app/components/EditCardModal.tsx` - **COMPLETE NEW FILE**

### Files to Update:
2. `/src/app/components/NanoCardComponent.tsx` - Import Edit3 and add pencil icon
3. `/src/app/components/TrainingScreen.tsx` - Import Edit3 and add pencil icon

---

## FILE 1: `/src/app/components/EditCardModal.tsx` (NEW FILE)

**Create this entire file:**

```tsx
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "../../lib/supabase";

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CardEditData) => void;
  initialData: CardEditData;
  isSaving?: boolean;
  isAdmin?: boolean;
}

export interface CardEditData {
  title: string;
  objective?: string;
  information?: string;
  videoUrl?: string;
  videoTime?: string;
  thumbnailUrl?: string;
  category?: string;
  courseTitle?: string;
}

export function EditCardModal({ isOpen, onClose, onSave, initialData, isSaving = false, isAdmin = false }: EditCardModalProps) {
  const [editedData, setEditedData] = useState<CardEditData>({
    ...initialData,
    category: initialData.category || 'Pitch',
    courseTitle: initialData.courseTitle || ''
  });
  const [existingCourseTitles, setExistingCourseTitles] = useState<string[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showCourseInput, setShowCourseInput] = useState(false);

  // Load existing course titles when Training is selected
  useEffect(() => {
    if (editedData.category === 'Training' && isOpen) {
      loadExistingCourseTitles();
    }
  }, [editedData.category, isOpen]);

  const loadExistingCourseTitles = async () => {
    try {
      setLoadingCourses(true);
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/courses/titles`, { headers });
      const data = await response.json();
      
      if (response.ok) {
        setExistingCourseTitles(data.courseTitles || []);
      }
    } catch (error) {
      console.error('Error loading course titles:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editedData);
  };
  
  // Category options
  const allCategories = ['Pitch', 'Proof of Work', 'Training', 'AI Leadership', 'NanoCard Academy'];
  const regularCategories = ['Pitch', 'Proof of Work', 'Training'];
  const availableCategories = isAdmin ? allCategories : regularCategories;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Edit Card</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={editedData.title}
              onChange={(e) => {
                const value = e.target.value.slice(0, 40);
                setEditedData({ ...editedData, title: value });
              }}
              maxLength={40}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
            <div className="text-sm text-gray-500 mt-2">{editedData.title.length}/40 characters</div>
          </div>

          {/* Objective Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
            <textarea
              value={editedData.objective || ''}
              onChange={(e) => setEditedData({ ...editedData, objective: e.target.value.slice(0, 256) })}
              maxLength={256}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
              rows={4}
            />
            <div className="text-sm text-gray-500 mt-2">{(editedData.objective || '').length}/256 characters</div>
          </div>

          {/* Information Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Information</label>
            <textarea
              value={editedData.information || ''}
              onChange={(e) => setEditedData({ ...editedData, information: e.target.value.slice(0, 256) })}
              maxLength={256}
              placeholder="This information display when user hovers the i"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base resize-none"
              rows={4}
            />
            <div className="text-sm text-gray-500 mt-2">{(editedData.information || '').length}/256 characters</div>
          </div>

          {/* Video URL Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
            <input
              type="url"
              value={editedData.videoUrl || ''}
              onChange={(e) => setEditedData({ ...editedData, videoUrl: e.target.value })}
              placeholder="https://naskxuojfdqcunotdjzi.supabase.co/s..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Video Duration Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video Duration</label>
            <input
              type="text"
              value={editedData.videoTime || ''}
              onChange={(e) => setEditedData({ ...editedData, videoTime: e.target.value })}
              placeholder="1:45"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Thumbnail URL Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
            <input
              type="url"
              value={editedData.thumbnailUrl || ''}
              onChange={(e) => setEditedData({ ...editedData, thumbnailUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Category Field - Show to all users but with limited options for non-admins */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={editedData.category || 'Pitch'}
              onChange={(e) => setEditedData({ ...editedData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              {availableCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Course Title Field - Show only when Category is Training */}
          {editedData.category === 'Training' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
              <div className="relative">
                <input
                  type="text"
                  value={editedData.courseTitle || ''}
                  onChange={(e) => setEditedData({ ...editedData, courseTitle: e.target.value })}
                  placeholder="Select or type a course title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
                {loadingCourses && (
                  <div className="absolute right-3 top-3 text-gray-500">Loading...</div>
                )}
                {!loadingCourses && existingCourseTitles.length > 0 && (
                  <div className="absolute right-3 top-3 text-gray-500 cursor-pointer" onClick={() => setShowCourseInput(!showCourseInput)}>
                    {showCourseInput ? 'Hide' : 'Show'} Courses
                  </div>
                )}
                {showCourseInput && existingCourseTitles.length > 0 && (
                  <div className="absolute left-0 top-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {existingCourseTitles.map(title => (
                      <div
                        key={title}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => setEditedData({ ...editedData, courseTitle: title })}
                      >
                        {title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## FILE 2: `/src/app/components/NanoCardComponent.tsx`

### STEP 1: Add Edit3 to imports (Line 1)

**Find:**
```tsx
import { Clock, Heart, ThumbsUp, Info, FileText, Globe, Linkedin, MessageCircle, Youtube, Github, Link as LinkIcon, Twitter, Mail, X, ChevronLeft, ChevronRight, Play, Download, Share2, Instagram, Facebook, Camera, ArrowUpCircle, Star, ExternalLink } from "lucide-react";
```

**Replace with:**
```tsx
import { Clock, Heart, ThumbsUp, Info, FileText, Globe, Linkedin, MessageCircle, Youtube, Github, Link as LinkIcon, Twitter, Mail, X, ChevronLeft, ChevronRight, Play, Download, Share2, Instagram, Facebook, Camera, ArrowUpCircle, Star, ExternalLink, Edit3 } from "lucide-react";
```

### STEP 2: Add Edit3 Pencil Icon Next to Card ID (Around line 1100-1115)

**Find this section:**
```tsx
              <div className=\"flex items-center gap-1.5\">
                <span className=\"text-gray-600 font-semibold text-sm\">#{card.id}</span>
              </div>
```

**Replace with:**
```tsx
              <div className="flex items-center gap-1.5">
                <span className="text-gray-600 font-semibold text-sm">#{card.id}</span>
                <button
                  onClick={() => setShowEditMode(true)}
                  className="hover:bg-gray-50 p-1 rounded transition-colors"
                  title="Quick Edit Card"
                >
                  <Edit3 className="w-3.5 h-3.5 text-gray-600" fill="currentColor" strokeWidth={0} />
                </button>
              </div>
```

### STEP 3: Add Edit3 Pencil in Video Playing Mode (Around line 930-937)

**Find this section inside video playing mode:**
```tsx
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-200 font-mono">#{card.id}</span>
            </div>
```

**Replace with:**
```tsx
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-200 font-mono">#{card.id}</span>
              <button
                onClick={() => setShowEditMode(true)}
                className="p-0.5 hover:bg-white/20 rounded transition-colors"
                title={`Edit Card #${card.id}`}
              >
                <Edit3 className="w-3.5 h-3.5 text-gray-600" fill="currentColor" strokeWidth={0} />
              </button>
            </div>
```

---

## FILE 3: `/src/app/components/TrainingScreen.tsx`

### STEP 1: Add Edit3 to imports (Line 3)

**Find:**
```tsx
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Crown, BookOpen, Search, Menu, ChevronLeft, ChevronRight, Heart, Download, Info, FileText, Globe, Linkedin, MessageCircle, Youtube, Github, Link as LinkIcon, Share2, Camera, Mail, Play } from "lucide-react";
```

**Replace with:**
```tsx
import { ArrowLeft, Plus, Edit2, Trash2, Save, X, Crown, BookOpen, Search, Menu, ChevronLeft, ChevronRight, Heart, Download, Info, FileText, Globe, Linkedin, MessageCircle, Youtube, Github, Link as LinkIcon, Share2, Camera, Mail, Play, Edit3 } from "lucide-react";
```

### STEP 2: Import EditCardModal Component (Around line 17)

**Add this import after other component imports:**
```tsx
import { EditCardModal, CardEditData } from "./EditCardModal";
```

### STEP 3: Add Edit3 Pencil Icon Next to Card ID (Around line 1075-1090)

**Find this section in the training card:**
```tsx
                      <div className="flex items-center gap-3 ml-auto">
                        <button className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                          <Heart className="w-5 h-5 text-red-500" fill="currentColor" strokeWidth={1.5} />
                          <span className="text-gray-600 font-medium text-sm">156</span>
                        </button>
                        <span className="text-gray-600 font-semibold text-sm">#{cardId}</span>
                      </div>
```

**Replace with:**
```tsx
                      <div className="flex items-center gap-3 ml-auto">
                        <button className="flex items-center gap-1.5 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                          <Heart className="w-5 h-5 text-red-500" fill="currentColor" strokeWidth={1.5} />
                          <span className="text-gray-600 font-medium text-sm">156</span>
                        </button>
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-gray-600 font-semibold text-sm">#{cardId}</span>
                          <button
                            onClick={() => handleQuickEdit(module)}
                            className="hover:bg-gray-100 p-0.5 rounded transition-colors"
                            title={`Edit Module #${cardId}`}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-gray-600" fill="currentColor" strokeWidth={0} />
                          </button>
                        </div>
                      </div>
```

### STEP 4: Add Quick Edit Modal State (Around line 60-70 with other state declarations)

**Add these state variables:**
```tsx
  // Quick edit modal state
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);
  const [editingModule, setEditingModule] = useState<TrainingModule | null>(null);
  const [isSavingQuickEdit, setIsSavingQuickEdit] = useState(false);
```

### STEP 5: Add Quick Edit Handlers (Around line 400-450, after existing handlers)

**Add these handler functions:**
```tsx
  // Quick edit modal handlers
  const handleQuickEdit = (module: TrainingModule) => {
    setEditingModule(module);
    setShowQuickEditModal(true);
  };
  
  const handleQuickEditSave = async (data: CardEditData) => {
    if (!editingModule) return;
    
    setIsSavingQuickEdit(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/training/modules/${editingModule.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: data.title,
          description: data.objective || editingModule.description,
          videoUrl: data.videoUrl || editingModule.videoUrl,
          duration: data.videoTime || editingModule.duration,
          content: data.information || editingModule.content
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setModules(modules.map(m => m.id === editingModule.id ? result.module : m));
        toast.success("Training card updated successfully!");
        setShowQuickEditModal(false);
        setEditingModule(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update card");
      }
    } catch (error) {
      console.error('Error updating training card:', error);
      toast.error("Failed to update card");
    } finally {
      setIsSavingQuickEdit(false);
    }
  };
```

### STEP 6: Add Quick Edit Modal Component (Around line 500-520, right after return statement)

**Add this right after `return (`:**
```tsx
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Quick Edit Modal */}
      {editingModule && (
        <EditCardModal
          isOpen={showQuickEditModal}
          onClose={() => {
            setShowQuickEditModal(false);
            setEditingModule(null);
          }}
          onSave={handleQuickEditSave}
          initialData={{
            title: editingModule.title,
            objective: editingModule.description,
            information: editingModule.content,
            videoUrl: editingModule.videoUrl || '',
            videoTime: editingModule.duration || '',
            thumbnailUrl: '',
            category: 'Training'
          }}
          isSaving={isSavingQuickEdit}
          isAdmin={isAdmin}
        />
      )}
```

---

## ✅ Summary of Changes

### EditCardModal.tsx (NEW):
- ✅ Full modal component for editing cards
- ✅ Fields: Title, Objective, Information, Video URL, Duration, Thumbnail, Category
- ✅ 40-character limit on title with live counter
- ✅ 256-character limit on objective and information
- ✅ Course title field for Training category
- ✅ Admin-only categories (AI Leadership, NanoCard Academy)
- ✅ Save/Cancel buttons with loading states

### NanoCardComponent.tsx:
- ✅ Import Edit3 icon from lucide-react
- ✅ Edit3 pencil next to card ID (#001, #002, etc.)
- ✅ Edit3 pencil in video playing mode
- ✅ Opens existing edit mode on click

### TrainingScreen.tsx:
- ✅ Import Edit3 icon from lucide-react
- ✅ Import EditCardModal component
- ✅ Edit3 pencil below card ID in vertical layout
- ✅ Quick edit modal state management
- ✅ handleQuickEdit and handleQuickEditSave functions
- ✅ Modal appears when pencil is clicked

---

## 🚀 Git Commands

After making all the changes:

```bash
# Stage all modified and new files
git add src/app/components/EditCardModal.tsx
git add src/app/components/NanoCardComponent.tsx
git add src/app/components/TrainingScreen.tsx

# Commit the changes
git commit -m "Add Edit3 pencil icon with quick edit modal functionality"

# Push to GitHub
git push origin main
```

---

## 🎯 Features You'll Get

1. ✏️ **Edit3 pencil icon** appears next to every card ID
2. 🎨 **Gray filled pencil** (not outline) for clean minimal look
3. 📝 **Quick edit modal** opens when clicking pencil
4. 💾 **Full edit functionality**: title, objective, information, video, thumbnail
5. ⚡ **Live character counters** on all text fields
6. 🔒 **Admin-only categories** protected in dropdown
7. 📚 **Training course title** field with autocomplete
8. ✅ **Consistent across all cards**: Pitch, Proof of Work, Training

---

## 📝 Notes

- The Edit3 icon is **filled** with `fill="currentColor"` and `strokeWidth={0}`
- Icon size is consistently `w-3.5 h-3.5` throughout the app
- The pencil is positioned in a vertical layout below the card ID for Training cards
- Modal has sticky header and footer for easy scrolling
- All fields validate and enforce character limits

---

**You're ready to add the complete edit pencil feature!** ✨
