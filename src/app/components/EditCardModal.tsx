import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/supabase";
import { supabase } from "@/supabase";

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
    category: initialData.category || 'Business',
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
      
      // Only fetch if there's a valid user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.log('[EditCardModal] No user session, skipping course titles fetch');
        setLoadingCourses(false);
        return;
      }
      
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
  const allCategories = ['Business', 'Training', 'Personal', 'AI Leadership', 'NanoCard Academy'];
  const regularCategories = ['Business', 'Training', 'Personal'];
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
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              id="edit-title"
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
            <label htmlFor="edit-objective" className="block text-sm font-medium text-gray-700 mb-2">Objective</label>
            <textarea
              id="edit-objective"
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
            <label htmlFor="edit-information" className="block text-sm font-medium text-gray-700 mb-2">Information</label>
            <textarea
              id="edit-information"
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
            <label htmlFor="edit-videoUrl" className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
            <input
              id="edit-videoUrl"
              type="url"
              value={editedData.videoUrl || ''}
              onChange={(e) => setEditedData({ ...editedData, videoUrl: e.target.value })}
              placeholder="https://naskxuojfdqcunotdjzi.supabase.co/s..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Video Duration Field */}
          <div>
            <label htmlFor="edit-videoTime" className="block text-sm font-medium text-gray-700 mb-2">Video Duration</label>
            <input
              id="edit-videoTime"
              type="text"
              value={editedData.videoTime || ''}
              onChange={(e) => setEditedData({ ...editedData, videoTime: e.target.value })}
              placeholder="1:45"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Thumbnail URL Field */}
          <div>
            <label htmlFor="edit-thumbnailUrl" className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
            <input
              id="edit-thumbnailUrl"
              type="url"
              value={editedData.thumbnailUrl || ''}
              onChange={(e) => setEditedData({ ...editedData, thumbnailUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          {/* Category Field - Show to all users but with limited options for non-admins */}
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              id="edit-category"
              value={editedData.category || 'Business'}
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
              <label htmlFor="edit-courseTitle" className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
              <div className="relative">
                <input
                  id="edit-courseTitle"
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