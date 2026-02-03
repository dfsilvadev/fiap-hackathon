/** Recommendation statuses: pending, completed, dismissed. */
export const RECOMMENDATION_STATUSES = ["pending", "completed", "dismissed"] as const;
export type RecommendationStatus = (typeof RECOMMENDATION_STATUSES)[number];

export const RECOMMENDATION_SOURCE_TYPES = ["assessment", "manual", "system"] as const;
export type RecommendationSourceType = (typeof RECOMMENDATION_SOURCE_TYPES)[number];

export interface ListRecommendationsFilters {
  status?: RecommendationStatus;
}

export interface UpdateRecommendationStatusInput {
  status: "completed" | "dismissed";
}
