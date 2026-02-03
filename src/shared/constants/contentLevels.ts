/**
 * Content levels: path levels "1", "2", "3"; reinforcement "reforco" (not in path).
 */
export const CONTENT_LEVELS = ["1", "2", "3", "reforco"] as const;

export type ContentLevel = (typeof CONTENT_LEVELS)[number];

export function isContentLevel(value: string): value is ContentLevel {
  return (CONTENT_LEVELS as readonly string[]).includes(value);
}

/** Path levels only (reinforcement excluded). */
export const TRILHA_LEVELS = ["1", "2", "3"] as const;

export type TrilhaLevel = (typeof TRILHA_LEVELS)[number];

export function isTrilhaLevel(value: string): value is TrilhaLevel {
  return (TRILHA_LEVELS as readonly string[]).includes(value);
}
