import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { API_BASE_URL, getAuthHeaders } from "../../lib/supabase";

/**
 * AdminRestoreCards - Owner-only page to restore the 3 original cards
 * Only accessible by carapaulson1@gmail.com
 */

const ORIGINAL_CARDS = [
  {
    title: "nAnoCards Platform",
    videoTime: "0:00",
    videoUrl: "", // To be filled in
    insights: {
      information: "AI-powered platform for sharing mini cards",
    },
  },
  {
    title: "U+Bar Innovation",
    videoTime: "0:00",
    videoUrl: "https://lompxaggrcfmmsjkbgyt.supabase.co/storage/v1/object/public/nanocard/WorkforcePromo.mp4",
    insights: {
      information: "Innovative bar concept",
    },
  },
  {
    title: "Workforce Development",
    videoTime: "0:00",
    videoUrl: "", // To be filled in
    insights: {
      information: "Workforce development and training",
    },
  },
];

export function AdminRestoreCards() {
  const navigate = useNavigate();
  const [restoring, setRestoring] = useState(false);
  const [cards, setCards] = useState(ORIGINAL_CARDS);
  const [restored, setRestored] = useState<boolean[]>([false, false, false]);

  const handleUpdateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    if (field === "information") {
      newCards[index].insights.information = value;
    } else {
      newCards[index][field as keyof typeof newCards[0]] = value;
    }
    setCards(newCards);
  };

  const handleRestoreCard = async (index: number) => {
    setRestoring(true);
    try {
      const card = cards[index];
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/cards`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: card.title,
          videoTime: card.videoTime,
          videoUrl: card.videoUrl,
          insights: card.insights,
          country: "",
          category: "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Card "${card.title}" restored!`, {
          description: `Card ID: ${data.card.id}`,
        });
        const newRestored = [...restored];
        newRestored[index] = true;
        setRestored(newRestored);
      } else {
        const error = await response.json();
        toast.error(`Failed to restore "${card.title}"`, {
          description: error.error || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error restoring card:", error);
      toast.error("Error restoring card");
    } finally {
      setRestoring(false);
    }
  };

  const handleRestoreAll = async () => {
    for (let i = 0; i < cards.length; i++) {
      if (!restored[i]) {
        await handleRestoreCard(i);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Restore Cards</h1>
              <p className="text-xs text-gray-600">Owner Admin Tool</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-900">
            <strong>Restore your 3 original cards.</strong> Edit the details below, then click "Restore" for each card.
          </p>
        </div>

        {/* Restore All Button */}
        <Button
          onClick={handleRestoreAll}
          disabled={restoring || restored.every(r => r)}
          className="w-full mb-6 bg-blue-900 hover:bg-blue-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Restore All Cards
        </Button>

        {/* Cards List */}
        <div className="space-y-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Card {index + 1}</h3>
                {restored[index] && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Restored</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`title-${index}`}>Title</Label>
                  <Input
                    id={`title-${index}`}
                    value={card.title}
                    onChange={(e) => handleUpdateCard(index, "title", e.target.value)}
                    maxLength={40}
                    placeholder="Card title (max 40 chars)"
                  />
                </div>

                <div>
                  <Label htmlFor={`videoUrl-${index}`}>Video URL</Label>
                  <Input
                    id={`videoUrl-${index}`}
                    value={card.videoUrl}
                    onChange={(e) => handleUpdateCard(index, "videoUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor={`videoTime-${index}`}>Video Time</Label>
                  <Input
                    id={`videoTime-${index}`}
                    value={card.videoTime}
                    onChange={(e) => handleUpdateCard(index, "videoTime", e.target.value)}
                    placeholder="0:00"
                  />
                </div>

                <div>
                  <Label htmlFor={`info-${index}`}>Information</Label>
                  <Input
                    id={`info-${index}`}
                    value={card.insights.information}
                    onChange={(e) => handleUpdateCard(index, "information", e.target.value)}
                    placeholder="Card description"
                  />
                </div>

                <Button
                  onClick={() => handleRestoreCard(index)}
                  disabled={restoring || restored[index]}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {restored[index] ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Restored
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Restore This Card
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Done Button */}
        {restored.every(r => r) && (
          <Button
            onClick={() => navigate("/app")}
            className="w-full mt-6 bg-blue-900 hover:bg-blue-800 text-white"
          >
            Done - View My Cards
          </Button>
        )}
      </div>
    </div>
  );
}