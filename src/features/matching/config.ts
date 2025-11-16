export const MATCH_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.5,  // Lowered from 0.6 to accept more matches
} as const;

export const MATCH_SHORTLIST_TOP_K = 10;  // Increased from 5 to check more candidates

export const BLEND_WEIGHTS = {
  SIM_WEIGHT: 0.6,
  LLM_WEIGHT: 0.4,
} as const;

export const MATCH_CONCURRENCY = 3;

export type MatchType = "exact" | "related" | "example-of";
