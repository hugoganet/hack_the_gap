export const MATCH_THRESHOLDS = {
  HIGH: 0.8,
  MEDIUM: 0.6,
} as const;

export const MATCH_SHORTLIST_TOP_K = 5;

export const BLEND_WEIGHTS = {
  SIM_WEIGHT: 0.6,
  LLM_WEIGHT: 0.4,
} as const;

export const MATCH_CONCURRENCY = 3;

export type MatchType = "exact" | "related" | "example-of";
