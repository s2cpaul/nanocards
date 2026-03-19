import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, 
  Search,
  Presentation,
  ClipboardCheck,
  BarChart3,
  GripVertical,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Github,
  MessageSquare,
  FileText,
  DollarSign,
  CreditCard,
  Wallet,
  Heart,
  Coffee,
  Gift,
  CalendarDays,
  HardDrive,
  Mail,
  Globe
} from "lucide-react";
import { Input } from "./ui/input";
import { HamburgerMenu } from "./HamburgerMenu";
import { supabase, API_BASE_URL, getAuthHeaders } from "@/supabase";
import { SurveySetup } from "./SurveySetup";

interface ContentType {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
}

export function AddContentScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [userTier, setUserTier] = useState("Free");

  // Minimal quiz builder state (used when user taps 'Quiz' in Add Content)
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const addQuestion = (type: 'mc' | 'tf') => {
    // type 'mc' -> multiple choice with 4 empty options; 'tf' -> true/false
    const newQuestion = type === 'tf'
      ? { type: 'true-false', question: '', options: ['True', 'False'] }
      : { type: 'multiple-choice', question: '', options: ['', '', ''] };
    setQuizQuestions(prev => [...prev, newQuestion]);
  };

  const resetQuizBuilder = () => {
    setQuizQuestions([]);
    setShowQuizBuilder(false);
  };

  // Drag & Drop builder state
  const [showDragDropBuilder, setShowDragDropBuilder] = useState(false);
  const [dragItems, setDragItems] = useState<{ label: string; definition: string }[]>([
    { label: '', definition: '' },
  ]);
  const [showSurveyInline, setShowSurveyInline] = useState(false);

  const addDragItem = () => {
    if (dragItems.length >= 5) return;
    setDragItems(prev => [...prev, { label: '', definition: '' }]);
  };

  const removeDragItem = (index: number) => {
    if (dragItems.length <= 1) return;
    setDragItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateDragLabel = (index: number, value: string) => {
    setDragItems(prev => prev.map((it, i) => i === index ? { ...it, label: value } : it));
  };

  const updateDragDefinition = (index: number, value: string) => {
    setDragItems(prev => prev.map((it, i) => i === index ? { ...it, definition: value } : it));
  };

  const resetDragBuilder = () => {
    setDragItems([{ label: '', definition: '' }]);
    setShowDragDropBuilder(false);
  };

  const saveDragBuilder = () => {
    // Basic validation: ensure labels are filled
    for (const it of dragItems) {
      if (!it.label.trim()) {
        alert('Please fill in all answer labels');
        return;
      }
    }
    // Persist to localStorage for the create flow to pick up
    localStorage.setItem('dragDropData', JSON.stringify({ items: dragItems }));
    // Navigate to the create card flow
    navigate('/create');
  };

  // Fetch user info on mount
  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode') === 'true';
    setIsGuestMode(guestMode);

    if (!guestMode) {
      const getUserInfo = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setCurrentUserEmail(session.user.email || '');
          
          // Get user subscription info
          try {
            const headers = await getAuthHeaders();
            const response = await fetch(`${API_BASE_URL}/subscription/status`, { headers });
            if (response.ok) {
              const data = await response.json();
              setUserPoints(data.points || 0);
              setUserTier(data.tier || 'Free');
            }
          } catch (error) {
            console.error('Error fetching user subscription:', error);
          }
        }
      };
      getUserInfo();
    }
  }, []);

  const contentTypes: ContentType[] = [
    // Featured
    { id: "featured-presentation", name: "Featured Presentation", icon: <Presentation className="w-5 h-5 text-gray-700" />, category: "Featured" },
    
    // Interactive Tools
    { id: "quiz", name: "Quiz", icon: <ClipboardCheck className="w-5 h-5 text-gray-700" />, category: "Interactive Tools" },
    { id: "survey", name: "Survey", icon: <BarChart3 className="w-5 h-5 text-gray-700" />, category: "Interactive Tools" },
    { id: "drag-drop", name: "Drag and Drop", icon: <GripVertical className="w-5 h-5 text-gray-700" />, category: "Interactive Tools" },
    
    // Social Media
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "instagram", name: "Instagram", icon: <Instagram className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "x", name: "X", icon: <Twitter className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "facebook", name: "Facebook", icon: <Facebook className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "youtube", name: "YouTube", icon: <Youtube className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "github", name: "GitHub", icon: <Github className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "discord", name: "Discord", icon: <MessageSquare className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    { id: "notion", name: "Notion", icon: <FileText className="w-5 h-5 text-gray-700" />, category: "Social Media" },
    
    // Payment Links
    { id: "venmo", name: "Venmo", icon: <DollarSign className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "paypal", name: "PayPal", icon: <CreditCard className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "cashapp", name: "Cash App", icon: <Wallet className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "gofundme", name: "GoFundMe", icon: <Heart className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "patreon", name: "Patreon", icon: <Heart className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "kofi", name: "Ko-fi", icon: <Coffee className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    { id: "buymeacoffee", name: "Buy Me a Coffee", icon: <Gift className="w-5 h-5 text-gray-700" />, category: "Payment Links" },
    
    // Productivity Tools
    { id: "calendly", name: "Calendly", icon: <CalendarDays className="w-5 h-5 text-gray-700" />, category: "Productivity Tools" },
    { id: "googledrive", name: "Google Drive", icon: <HardDrive className="w-5 h-5 text-gray-700" />, category: "Productivity Tools" },
    
    // Other
    { id: "email", name: "Email", icon: <Mail className="w-5 h-5 text-gray-700" />, category: "Other" },
    { id: "official-url", name: "Official URL", icon: <Globe className="w-5 h-5 text-gray-700" />, category: "Other" },
  ];

  // Filter content types based on search query
  const filteredContent = contentTypes.filter(content =>
    content.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group content by category
  const groupedContent: { [key: string]: ContentType[] } = {};
  filteredContent.forEach(content => {
    if (!groupedContent[content.category]) {
      groupedContent[content.category] = [];
    }
    groupedContent[content.category].push(content);
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  };

  const handleAddContent = (contentId: string) => {
    console.log('[AddContentScreen] handleAddContent called with', contentId);
    if (contentId === 'quiz') {
      // Open inline quiz builder
      console.log('[AddContentScreen] opening quiz builder');
      setShowQuizBuilder(true);
      // seed with one question if empty
      if (quizQuestions.length === 0) addQuestion('mc');
      return;
    }

    if (contentId === 'survey') {
      console.log('[AddContentScreen] opening survey inline');
      // Open the Survey Setup inline panel
      setShowSurveyInline(true);
      return;
    }

    if (contentId === 'drag-drop') {
      console.log('[AddContentScreen] opening drag & drop builder');
      // Open inline drag & drop builder and seed with two items if empty
      setShowDragDropBuilder(true);
      if (dragItems.length === 1 && !dragItems.some(i => i.label || i.definition)) {
        setDragItems([
          { label: 'Answer 1', definition: '' },
          { label: 'Answer 2', definition: '' },
        ]);
      }
      return;
    }

    // Navigate to create card page for other content types
    console.log('[AddContentScreen] navigating to create for', contentId);
    navigate('/create');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Add Content</h1>
          </div>
          <HamburgerMenu
            currentUserEmail={currentUserEmail}
            isGuestMode={isGuestMode}
            userPoints={userPoints}
            userTier={userTier}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search content types"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 border-gray-200 h-12"
          />
        </div>

        {/* Content Types */}
        <div className="space-y-6">
          {Object.entries(groupedContent).map(([category, items]) => (
            <div key={category}>
              {/* Category Header */}
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                {category}
              </h2>
              
              {/* Category Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors ${
                      index !== items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                    <button
                      onClick={() => handleAddContent(item.id)}
                      type="button"
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No content types found</p>
            <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
          </div>
        )}

        {/* Quiz Builder Inline */}
        {showQuizBuilder && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Create Quiz</h3>
              <div className="flex gap-2">
                <button
                  className="text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => { resetQuizBuilder(); }}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Save quiz to localStorage and navigate to create flow
                    // Validate
                    for (const q of quizQuestions) {
                      if (!q.question || !q.question.trim()) {
                        alert('Please fill in all quiz questions');
                        return;
                      }
                      if (q.type === 'multiple-choice') {
                        if (!q.options || q.options.length < 2) {
                          alert('Multiple choice questions need at least 2 options');
                          return;
                        }
                        for (const opt of q.options) {
                          if (!opt || !opt.trim()) {
                            alert('Please fill in all answer options');
                            return;
                          }
                        }
                      }
                    }

                    localStorage.setItem('userQuiz', JSON.stringify({ questions: quizQuestions }));
                    // close builder and go to create flow to attach quiz to card
                    setShowQuizBuilder(false);
                    navigate('/create');
                  }}
                >
                  Save Quiz
                </button>
              </div>
            </div>

            {/* Quiz Questions List */}
            <div className="space-y-4">
              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Question {qIndex + 1}</h4>
                      <p className="text-xs text-gray-500">{q.type === 'multiple-choice' ? 'Multiple choice (3 options recommended)' : 'True / False'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {quizQuestions.length > 1 && (
                        <button onClick={() => {
                          // remove question
                          setQuizQuestions(prev => prev.filter((_, i) => i !== qIndex));
                        }} className="text-red-500 hover:text-red-600 text-sm" aria-label={`Remove question ${qIndex + 1}`}>
                          Remove
                        </button>
                      )}
                      <select
                        value={q.type}
                        onChange={(e) => {
                          const newType = e.target.value === 'true-false' ? 'true-false' : 'multiple-choice';
                          setQuizQuestions(prev => prev.map((item, i) => {
                            if (i !== qIndex) return item;
                            if (newType === 'true-false') return { ...item, type: 'true-false', options: ['True', 'False'] };
                            return { ...item, type: 'multiple-choice', options: ['', '', ''] };
                          }));
                        }}
                        className="h-10 bg-white border border-gray-200 rounded-md px-3 text-sm"
                        aria-label={`Select question type for question ${qIndex + 1}`}
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True / False</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                    <Input
                      value={q.question}
                      onChange={(e) => setQuizQuestions(prev => prev.map((item, i) => i === qIndex ? { ...item, question: e.target.value.slice(0, 256) } : item))}
                      placeholder="Enter question"
                      className="h-12"
                      maxLength={256}
                    />
                  </div>

                  {q.type === 'true-false' ? (
                    <div className="flex gap-3">
                      <button type="button" className="flex-1 py-3 px-6 rounded-full bg-gray-100 text-gray-700 font-medium border-2 border-gray-300 cursor-default">True</button>
                      <button type="button" className="flex-1 py-3 px-6 rounded-full bg-gray-100 text-gray-700 font-medium border-2 border-gray-300 cursor-default">False</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(q.options || []).map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 w-8">{oIndex + 1}.</span>
                          <Input
                            value={opt}
                            onChange={(e) => setQuizQuestions(prev => prev.map((item, i) => {
                              if (i !== qIndex) return item;
                              const newOpts = [...(item.options || [])];
                              newOpts[oIndex] = e.target.value.slice(0, 64);
                              return { ...item, options: newOpts };
                            }))}
                            placeholder={`Option ${oIndex + 1}`}
                            className="flex-1"
                            maxLength={64}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add Question Button */}
            <div className="mt-4">
              {quizQuestions.length < 5 && (
                <button onClick={() => addQuestion('mc')} className="w-full bg-white rounded-2xl p-3 shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors mb-2 text-gray-600 hover:text-blue-600 font-medium">
                  + Add Question (Max 5)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Drag & Drop Builder Inline */}
        {showDragDropBuilder && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Create Drag & Drop</h3>
              <div className="flex gap-2">
                <button
                  className="text-sm text-gray-600 hover:text-gray-800"
                  onClick={() => { resetDragBuilder(); }}
                >
                  Cancel
                </button>
                <button
                  className="bg-blue-600 text-white text-sm font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
                  onClick={() => { saveDragBuilder(); }}
                >
                  Save Drag & Drop
                </button>
              </div>
            </div>

            {/* Pills Preview */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer Choices (drag order preserved)</label>
              <div className="flex flex-wrap gap-2">
                {dragItems.map((it, i) => (
                  <button key={i} type="button" className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-sm font-medium" title={`Choice ${i + 1}`}>
                    {it.label || `Choice ${i + 1}`}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">You can have up to 5 answers. Enter their definitions below in the same order.</p>
            </div>

            {/* Definition Inputs - entered in correct order */}
            <div className="space-y-3">
              {dragItems.map((it, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-800">Answer {i + 1}</span>
                    <div className="flex items-center gap-2">
                      {dragItems.length > 1 && (
                        <button onClick={() => removeDragItem(i)} className="text-red-500 hover:text-red-600 text-sm" aria-label={`Remove answer ${i + 1}`}>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <Input
                    value={it.label}
                    onChange={(e) => updateDragLabel(i, e.target.value.slice(0, 40))}
                    placeholder={`Answer ${i + 1} label (e.g. Agree)`}
                    className="mb-2"
                    maxLength={40}
                  />
                  <textarea
                    value={it.definition}
                    onChange={(e) => updateDragDefinition(i, e.target.value.slice(0, 256))}
                    placeholder={`Definition for Answer ${i + 1} (enter correct order)`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    maxLength={256}
                  />
                </div>
              ))}

              {dragItems.length < 5 && (
                <div className="pt-2">
                  <button onClick={addDragItem} className="w-full bg-white rounded-2xl p-3 shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors mb-2 text-gray-600 hover:text-blue-600 font-medium">
                    + Add Answer (Max 5)
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Survey Inline */}
        {showSurveyInline && (
          <div className="mt-6">
            <SurveySetup onClose={() => setShowSurveyInline(false)} />
          </div>
        )}
      </div>
    </div>
  );
}