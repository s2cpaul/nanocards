# 🎯 Thought Bubble - Exact Fix for Your Current Code

## Problem
The migration guide didn't work because your file structure is different. Here's the EXACT fix for your current code.

---

## FILE: `/src/app/components/NanoCardComponent.tsx`

### STEP 1: Find this section (around line 950-998):

```tsx
              {/* Video duration badge */}
              {card.videoTime && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {card.videoTime}
                </div>
              )}
            </div>
          )}
```

### STEP 2: Replace with this code (adds thought bubble):

```tsx
              {/* Video duration badge */}
              {card.videoTime && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {card.videoTime}
                </div>
              )}
              
              {/* Information Thought Bubble - Appears on hover over video area */}
              {showInfoPopup && (card.information || card.insights?.information) && (
                <div 
                  className="absolute bottom-2 left-2 z-10 pointer-events-none"
                  style={{
                    maxWidth: 'calc(100% - 16px)'
                  }}
                >
                  <div className="relative px-4 py-3 bg-white text-gray-800 text-xs rounded-2xl shadow-2xl border-2 border-gray-200 max-w-xs"
                    style={{
                      filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                    }}
                  >
                    <div className="text-gray-900 leading-relaxed break-words whitespace-pre-wrap">
                      {card.information || card.insights?.information || 'This is the intent or mission and target audience and problem to solve.'}
                    </div>
                    {/* Thought bubble tail - bottom left */}
                    <div className="absolute top-full left-4">
                      <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 10C10 10 3 3 0 0H20C17 3 10 10 10 10Z" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
```

---

## FILE: `/src/app/components/TrainingScreen.tsx`

### STEP 1: Add information field to interface (around line 18)

Find:
```tsx
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration?: string;
  order: number;
  category: "Applied AI Leadership" | "Customer Service Training" | "nAnoCards Academy";
  createdAt: string;
  createdBy: string;
  isPlaceholder?: boolean;
```

Add this line:
```tsx
  information?: string;
```

So it becomes:
```tsx
interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string;
  duration?: string;
  order: number;
  category: "Applied AI Leadership" | "Customer Service Training" | "nAnoCards Academy";
  createdAt: string;
  createdBy: string;
  isPlaceholder?: boolean;
  information?: string;  // ← ADD THIS
  quiz?: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  };
}
```

### STEP 2: Find the video thumbnail section (search for "Time Overlay (Bottom Right)")

Look for:
```tsx
                    {/* Time Overlay (Bottom Right) */}
                    {module.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
                        {module.duration}
                      </div>
                    )}

                    {/* QR Code (Top Right) */}
```

### STEP 3: Add thought bubble code BETWEEN time overlay and QR code:

```tsx
                    {/* Time Overlay (Bottom Right) */}
                    {module.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-sm font-bold">
                        {module.duration}
                      </div>
                    )}
                    
                    {/* Information Thought Bubble - Appears over time display when hovering info icon */}
                    {showInfoPopup === module.id && (module.information || module.content) && (
                      <div 
                        className="absolute bottom-2 left-2 z-10 pointer-events-none"
                        style={{
                          maxWidth: 'calc(100% - 100px)'
                        }}
                      >
                        <div className="relative px-4 py-3 bg-white text-gray-800 text-xs rounded-2xl shadow-2xl border-2 border-gray-200 max-w-xs"
                          style={{
                            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))'
                          }}
                        >
                          <div className="text-gray-900 leading-relaxed break-words whitespace-pre-wrap">
                            {module.information || module.content.slice(0, 256) || 'This is the intent or mission and target audience and problem to solve.'}
                          </div>
                          {/* Thought bubble tail - bottom left */}
                          <div className="absolute top-full left-4">
                            <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 10C10 10 3 3 0 0H20C17 3 10 10 10 10Z" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QR Code (Top Right) */}
```

### STEP 4: Fix the Info icon to trigger thought bubble

Search for "Information Icon with Thought Bubble" - you should find a large block of code.

**REMOVE** the entire centered thought bubble section and replace it with this simple version:

```tsx
                    {/* Information Icon - Triggers thought bubble in video area */}
                    {(module.information || module.content) && (
                      <button 
                        onMouseEnter={() => setShowInfoPopup(module.id)}
                        onMouseLeave={() => setShowInfoPopup(null)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Info className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
                      </button>
                    )}
```

---

## ✅ Quick Checklist

After making these changes, verify:

- [ ] NanoCardComponent.tsx has the thought bubble code after the video time badge
- [ ] TrainingScreen.tsx interface has `information?: string;`
- [ ] TrainingScreen.tsx has thought bubble code between time overlay and QR code
- [ ] TrainingScreen.tsx has simple info icon button (not the complex centered version)
- [ ] Save all files
- [ ] Check the browser - hover over the blue ⓘ icon

---

## 🚀 If It Still Doesn't Work

1. **Check the browser console** for errors (F12 → Console tab)
2. **Make sure the app reloaded** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
3. **Verify the info icon exists** on your cards
4. **Check that `showInfoPopup` state exists** in both components

---

## 💡 Pro Tip

If you're getting syntax errors:
- Make sure you copied the COMPLETE code blocks including opening/closing tags
- Check that all `{` have matching `}`
- Make sure JSX comments use `{/* */}` not `//`

---

Let me know if you need help with any specific error messages!
