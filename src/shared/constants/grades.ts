/**
 * Standard grades: middle school "6","7","8","9"; high school "1EM","2EM","3EM".
 */
export const GRADES = ["6", "7", "8", "9", "1EM", "2EM", "3EM"] as const;

export type Grade = (typeof GRADES)[number];

export function isGrade(value: string): value is Grade {
  return GRADES.includes(value as Grade);
}
