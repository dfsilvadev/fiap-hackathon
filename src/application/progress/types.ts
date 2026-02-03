export const PROGRESS_STATUSES = ["not_started", "in_progress", "completed"] as const;

export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];

export interface UpsertProgressInput {
  contentId: string;
  status: ProgressStatus;
  timeSpent?: number;
}
