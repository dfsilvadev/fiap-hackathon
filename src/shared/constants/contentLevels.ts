/**
 * Níveis de conteúdo pedagógico (CHECKLIST Parte 4).
 * Trilha: "1", "2", "3". Reforço: "reforco" (não entra na trilha).
 */
export const CONTENT_LEVELS = ["1", "2", "3", "reforco"] as const;

export type ContentLevel = (typeof CONTENT_LEVELS)[number];

export function isContentLevel(value: string): value is ContentLevel {
  return (CONTENT_LEVELS as readonly string[]).includes(value);
}

/** Níveis permitidos na trilha (reforço não entra). Parte 5. */
export const TRILHA_LEVELS = ["1", "2", "3"] as const;

export type TrilhaLevel = (typeof TRILHA_LEVELS)[number];

export function isTrilhaLevel(value: string): value is TrilhaLevel {
  return (TRILHA_LEVELS as readonly string[]).includes(value);
}
