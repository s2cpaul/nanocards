/**
 * The 6 Stages of Innovation for nAnoCards
 * 
 * This represents the standard innovation lifecycle from ideation to market maturity.
 */
export const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "validation", label: "Validation" },
  { value: "planning", label: "Planning" },
  { value: "execution", label: "Execution" },
  { value: "growth", label: "Growth" },
  { value: "reinvention", label: "Reinvention" },
] as const;

export type Stage = typeof STAGES[number];