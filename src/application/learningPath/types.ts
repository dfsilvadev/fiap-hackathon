export interface CreateLearningPathInput {
  name: string;
  categoryId: string;
  grade: string;
  isDefault?: boolean;
  description?: string;
}

export interface UpdateLearningPathInput {
  name?: string;
  isDefault?: boolean;
  description?: string;
}

export interface ListLearningPathsFilters {
  categoryId?: string;
  grade?: string;
  page?: number;
  limit?: number;
}

export interface AddContentToPathInput {
  contentId: string;
  orderNumber: number;
}

export interface ReorderPathContentsInput {
  items: Array<{ contentId: string; orderNumber: number }>;
}
