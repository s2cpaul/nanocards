import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { HamburgerMenu } from "./HamburgerMenu";
import { supabase } from "../../lib/supabase";

type QuestionType = "multiple-choice" | "true-false";

interface SurveyQuestion {
  type: QuestionType;
  question: string;
  options: string[];
}

export function SurveySetup() {
  const navigate = useNavigate();
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  
  // Default survey questions with 3 options each
  const defaultQuestions: SurveyQuestion[] = [
    {
      type: "multiple-choice",
      question: "Was this content helpful?",
      options: ["Yes", "No", "Somewhat"],
    },
    {
      type: "multiple-choice",
      question: "How likely are you to apply what you learned?",
      options: ["Very likely", "Somewhat likely", "Not likely"],
    },
    {
      type: "multiple-choice",
      question: "Would you recommend this to others?",
      options: ["Definitely", "Maybe", "No"],
    },
  ];

  const [questions, setQuestions] = useState<SurveyQuestion[]>(defaultQuestions);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email);
        setIsGuestMode(false);
        const points = parseInt(localStorage.getItem('userPoints') || '0');
        setUserPoints(points);
      } else {
        setIsGuestMode(true);
      }
    };
    checkAuth();

    // Load existing survey data if available
    const existingSurvey = localStorage.getItem('userSurvey');
    if (existingSurvey) {
      try {
        const surveyData = JSON.parse(existingSurvey);
        if (surveyData.questions && surveyData.questions.length > 0) {
          setQuestions(surveyData.questions);
        }
      } catch (e) {
        console.error('Error loading survey data:', e);
      }
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleTypeChange = (index: number, type: QuestionType) => {
    const newQuestions = [...questions];
    newQuestions[index].type = type;
    
    // Update options based on type
    if (type === "true-false") {
      newQuestions[index].options = ["True", "False"];
    } else {
      // Multiple choice - default to 3 options
      newQuestions[index].options = ["", "", ""];
    }
    
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    if (questions.length < 5) {
      setQuestions([
        ...questions,
        {
          type: "multiple-choice",
          question: "",
          options: ["", "", ""],
        },
      ]);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    // Validate all questions have content
    for (const q of questions) {
      if (!q.question.trim()) {
        alert("Please fill in all questions");
        return;
      }
      for (const option of q.options) {
        if (!option.trim()) {
          alert("Please fill in all answer options");
          return;
        }
      }
    }

    const surveyData = {
      questions: questions.map(q => ({
        type: q.type,
        question: q.question,
        options: q.options,
      })),
    };

    // Save to localStorage
    localStorage.setItem('userSurvey', JSON.stringify(surveyData));
    
    // Mark as added
    const savedLinks = JSON.parse(localStorage.getItem('userSocialLinks') || '{}');
    savedLinks.survey = true;
    localStorage.setItem('userSocialLinks', JSON.stringify(savedLinks));

    navigate('/settings');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Add Survey</h1>
          </div>
          <HamburgerMenu
            currentUserEmail={currentUserEmail}
            isGuestMode={isGuestMode}
            userPoints={userPoints}
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            Create a survey for your nAnoCard to gather feedback from viewers. Choose between multiple choice (3 options) or true/false questions. Default questions are provided but can be edited.
          </p>
        </div>

        {/* Survey Questions */}
        <div className="space-y-6 mb-6">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Question Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <Input
                  value={q.question}
                  onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                  placeholder="Enter your question"
                  className="h-12 text-base"
                  maxLength={256}
                />
                <p className="text-xs text-gray-500 mt-2">
                  {q.question.length}/256 characters
                </p>
              </div>

              {/* Question Type */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Question Type
                </label>
                <Select
                  value={q.type}
                  onValueChange={(value) => handleTypeChange(qIndex, value as QuestionType)}
                >
                  <SelectTrigger className="h-14 text-base bg-gray-50 border-gray-200">
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Answer Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer Options
                </label>
                
                {q.type === "true-false" ? (
                  // Pill buttons for True/False
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 py-3 px-6 rounded-full bg-gray-100 text-gray-700 font-medium border-2 border-gray-300 cursor-default"
                    >
                      True
                    </button>
                    <button
                      type="button"
                      className="flex-1 py-3 px-6 rounded-full bg-gray-100 text-gray-700 font-medium border-2 border-gray-300 cursor-default"
                    >
                      False
                    </button>
                  </div>
                ) : (
                  // Input fields for Multiple Choice
                  <div className="space-y-3">
                    {q.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 w-8">
                          {oIndex + 1}.
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          placeholder={`Option ${oIndex + 1}`}
                          className="flex-1"
                          maxLength={64}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  {q.type === "true-false" 
                    ? "True/False questions have 2 fixed options" 
                    : "Multiple choice questions have 3 customizable options"}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        {questions.length < 5 && (
          <button
            onClick={handleAddQuestion}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-colors mb-6 flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600 font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Question (Max 5)
          </button>
        )}

        {/* Info about limits */}
        <div className="bg-gray-100 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Survey Guidelines:</strong>
          </p>
          <ul className="text-sm text-gray-600 mt-2 space-y-1 ml-4 list-disc">
            <li>Maximum 5 questions per survey</li>
            <li>Multiple Choice: 3 customizable answer options</li>
            <li>True/False: 2 fixed options (True, False)</li>
            <li>Questions can be up to 256 characters</li>
            <li>Answer options can be up to 64 characters</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/settings')}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
          >
            Save Survey
          </Button>
        </div>
      </div>
    </div>
  );
}