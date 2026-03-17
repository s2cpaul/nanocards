import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { HamburgerMenu } from "./HamburgerMenu";
import { supabase } from "../../lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type QuizType = "multiple-choice" | "true-false" | "open-ended";

interface QuizAnswer {
  text: string;
  isCorrect?: boolean;
}

export function QuizSetup() {
  const navigate = useNavigate();
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  
  const [quizType, setQuizType] = useState<QuizType>("multiple-choice");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<QuizAnswer[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [keywords, setKeywords] = useState<string[]>([""]);
  const [singleLineAnswer, setSingleLineAnswer] = useState("");

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
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/');
  };

  const handleAddAnswer = () => {
    if (answers.length < 6) {
      setAnswers([...answers, { text: "", isCorrect: false }]);
    }
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length > 2) {
      setAnswers(answers.filter((_, i) => i !== index));
    }
  };

  const handleAnswerChange = (index: number, text: string) => {
    const newAnswers = [...answers];
    newAnswers[index].text = text;
    setAnswers(newAnswers);
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newAnswers = answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index,
    }));
    setAnswers(newAnswers);
  };

  const handleAddKeyword = () => {
    if (keywords.length < 10) {
      setKeywords([...keywords, ""]);
    }
  };

  const handleRemoveKeyword = (index: number) => {
    if (keywords.length > 1) {
      setKeywords(keywords.filter((_, i) => i !== index));
    }
  };

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handleSave = () => {
    let quizData: any = {
      type: quizType,
      question,
    };

    if (quizType === "multiple-choice") {
      const correctIndex = answers.findIndex(a => a.isCorrect);
      if (!question.trim() || answers.some(a => !a.text.trim()) || correctIndex === -1) {
        alert("Please fill in all fields and select the correct answer");
        return;
      }
      quizData.answers = answers.map(a => a.text);
      quizData.correctAnswer = correctIndex;
    } else if (quizType === "true-false") {
      const correctIndex = answers.findIndex(a => a.isCorrect);
      if (!question.trim() || correctIndex === -1) {
        alert("Please fill in the question and select the correct answer");
        return;
      }
      quizData.answers = ["True", "False"];
      quizData.correctAnswer = correctIndex;
    } else if (quizType === "open-ended") {
      const validKeywords = keywords.filter(k => k.trim());
      if (!question.trim() || (validKeywords.length === 0 && !singleLineAnswer.trim())) {
        alert("Please fill in the question and provide at least one keyword or expected answer");
        return;
      }
      quizData.acceptableKeywords = validKeywords;
      quizData.expectedAnswer = singleLineAnswer;
    }

    // Save to localStorage
    const existingQuizzes = JSON.parse(localStorage.getItem('userQuizzes') || '[]');
    existingQuizzes.push(quizData);
    localStorage.setItem('userQuizzes', JSON.stringify(existingQuizzes));
    
    // Mark as added
    const savedLinks = JSON.parse(localStorage.getItem('userSocialLinks') || '{}');
    savedLinks.quiz = true;
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
            <h1 className="text-xl font-semibold text-gray-900">Add Quiz</h1>
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
            Create an interactive quiz for your nAnoCard. Choose between multiple choice, true/false, or open-ended questions. Users earn 10 points for correct answers.
          </p>
        </div>

        {/* Quiz Type Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <label className="block font-semibold text-gray-900 mb-3">
            Quiz Type
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setQuizType("multiple-choice");
                setAnswers([
                  { text: "", isCorrect: false },
                  { text: "", isCorrect: false },
                ]);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                quizType === "multiple-choice"
                  ? "bg-[#1e3a8a] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Choice
            </button>
            <button
              onClick={() => {
                setQuizType("true-false");
                setAnswers([
                  { text: "True", isCorrect: false },
                  { text: "False", isCorrect: false },
                ]);
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                quizType === "true-false"
                  ? "bg-[#1e3a8a] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              True or False
            </button>
            <button
              onClick={() => {
                setQuizType("open-ended");
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                quizType === "open-ended"
                  ? "bg-[#1e3a8a] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Text
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <label htmlFor="question" className="block font-semibold text-gray-900 mb-3">
            Question
          </label>
          <Input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            className="h-12 text-base"
            maxLength={256}
          />
          <p className="text-xs text-gray-500 mt-2">
            {question.length}/256 characters
          </p>
        </div>

        {/* Multiple Choice Answers */}
        {quizType === "multiple-choice" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block font-semibold text-gray-900">
                Answer Options
              </label>
              {answers.length < 6 && (
                <button
                  onClick={handleAddAnswer}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              )}
            </div>
            <div className="space-y-3">
              {answers.map((answer, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={answer.isCorrect}
                    onChange={() => handleCorrectAnswerChange(index)}
                    className="w-4 h-4 text-blue-600 flex-shrink-0"
                  />
                  <Input
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                    maxLength={128}
                  />
                  {answers.length > 2 && (
                    <button
                      onClick={() => handleRemoveAnswer(index)}
                      className="text-red-500 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Select the correct answer by clicking the radio button
            </p>
          </div>
        )}

        {/* True/False Answers */}
        {quizType === "true-false" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <label className="block font-semibold text-gray-900 mb-4">
              Correct Answer
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="trueFalse"
                  checked={answers[0].isCorrect}
                  onChange={() => handleCorrectAnswerChange(0)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">True</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="trueFalse"
                  checked={answers[1].isCorrect}
                  onChange={() => handleCorrectAnswerChange(1)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-900">False</span>
              </div>
            </div>
          </div>
        )}

        {/* Open-Ended Answer */}
        {quizType === "open-ended" && (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <label htmlFor="singleLine" className="block font-semibold text-gray-900 mb-3">
                Expected Answer (Optional)
              </label>
              <Input
                id="singleLine"
                value={singleLineAnswer}
                onChange={(e) => setSingleLineAnswer(e.target.value)}
                placeholder="Enter the expected answer"
                className="h-12 text-base"
                maxLength={256}
              />
              <p className="text-xs text-gray-500 mt-2">
                A single line answer that would be considered correct
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block font-semibold text-gray-900">
                  Acceptable Keywords (Optional)
                </label>
                {keywords.length < 10 && (
                  <button
                    onClick={handleAddKeyword}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Keyword
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {keywords.map((keyword, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      value={keyword}
                      onChange={(e) => handleKeywordChange(index, e.target.value)}
                      placeholder={`Keyword ${index + 1}`}
                      className="flex-1"
                      maxLength={64}
                    />
                    {keywords.length > 1 && (
                      <button
                        onClick={() => handleRemoveKeyword(index)}
                        className="text-red-500 hover:text-red-600 flex-shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                User responses containing any of these keywords will be considered correct
              </p>
            </div>
          </>
        )}

        {/* Save Button */}
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
            Save Quiz
          </Button>
        </div>
      </div>
    </div>
  );
}