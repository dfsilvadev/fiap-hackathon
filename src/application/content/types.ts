import type { Grade } from "@shared/constants/grades.js";
import type { ContentLevel } from "@shared/constants/contentLevels.js";

export interface CreateContentInput {
  title: string;
  contentText: string;
  categoryId: string;
  grade: Grade;
  level: ContentLevel;
  topics?: unknown;
  glossary?: unknown;
  accessibilityMetadata?: unknown;
  tags?: string[];
}

export interface UpdateContentInput {
  title?: string;
  contentText?: string;
  grade?: Grade;
  level?: ContentLevel;
  topics?: unknown;
  glossary?: unknown;
  accessibilityMetadata?: unknown;
  tags?: string[];
}

export interface ListContentsFilters {
  categoryId?: string;
  grade?: string;
  level?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ListContentsForStudentFilters {
  categoryId?: string;
  page?: number;
  limit?: number;
}
