import { X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sortBy: "likes" | "newest";
  onSortChange: (value: "likes" | "newest") => void;
  filterMonth: string;
  onMonthChange: (value: string) => void;
  filterUser: string;
  onUserChange: (value: string) => void;
  filterStage: string;
  onStageChange: (value: string) => void;
  availableMonths: string[];
  availableUsers: string[];
  availableStages: string[];
}

/**
 * Filter panel component for card filtering and sorting
 */
export function FilterPanel({
  isOpen,
  onClose,
  sortBy,
  onSortChange,
  filterMonth,
  onMonthChange,
  filterUser,
  onUserChange,
  filterStage,
  onStageChange,
  availableMonths,
  availableUsers,
  availableStages,
}: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filters & Sort</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <Select value={sortBy} onValueChange={(value: "likes" | "newest") => onSortChange(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="likes">Most Liked</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <Select value={filterMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by User */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Creator
            </label>
            <Select value={filterUser} onValueChange={onUserChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {availableUsers.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filter by Stage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <Select value={filterStage} onValueChange={onStageChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {availableStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onSortChange("likes");
              onMonthChange("all");
              onUserChange("all");
              onStageChange("all");
            }}
            className="flex-1"
          >
            Reset Filters
          </Button>
          <Button onClick={onClose} className="flex-1 bg-blue-600 hover:bg-blue-700">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}