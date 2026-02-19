export const ASSESSMENT_LEVELS = ["1", "2", "3"] as const;
export type AssessmentLevel = (typeof ASSESSMENT_LEVELS)[number];

export const QUESTION_TYPES = ["multiple_choice", "true_false", "text"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface CreateAssessmentInput {
  title: string;
  description?: string;
  categoryId: string;
  grade: string;
  level: AssessmentLevel;
  contentId?: string;
  minScore?: number;
  startDate: string;
  endDate?: string;
  isActive?: boolean;
}

export interface UpdateAssessmentInput {
  title?: string;
  description?: string;
  minScore?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export interface ListAssessmentsFilters {
  categoryId?: string;
  grade?: string;
  level?: string;
  page?: number;
  limit?: number;
}

export interface CreateQuestionInput {
  questionText: string;
  questionType: QuestionType;
  options?: unknown;
  correctAnswer: string;
  points?: number;
  tags?: unknown;
  orderNumber: number;
}

export interface UpdateQuestionInput {
  questionText?: string;
  questionType?: QuestionType;
  options?: unknown;
  correctAnswer?: string;
  points?: number;
  tags?: unknown;
  orderNumber?: number;
}

export interface SubmitAnswerInput {
  questionId: string;
  answerText: string;
}

export interface SubmitAssessmentInput {
  answers: SubmitAnswerInput[];
}
