import type { Grade } from "@shared/constants/grades.js";

export interface Guardian {
  name: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface CreateUserStudentInput {
  name: string;
  email: string;
  password: string;
  role: "student";
  currentGrade: Grade;
  guardians: Guardian[];
  dateOfBirth?: string; // ISO date
}

export interface CreateUserTeacherInput {
  name: string;
  email: string;
  password: string;
  role: "teacher";
  categoryIds: string[];
  phone?: string;
  dateOfBirth?: string;
}

export type CreateUserInput = CreateUserStudentInput | CreateUserTeacherInput;

export interface UpdateUserStudentInput {
  name?: string;
  email?: string;
  currentGrade?: Grade;
  guardians?: Guardian[];
  dateOfBirth?: string | null;
}

export interface UpdateUserTeacherInput {
  name?: string;
  email?: string;
  phone?: string | null;
  categoryIds?: string[];
  dateOfBirth?: string | null;
}

export type UpdateUserInput = UpdateUserStudentInput | UpdateUserTeacherInput;

export interface ListUsersFilters {
  role?: "student" | "teacher";
  currentGrade?: string;
  page?: number;
  limit?: number;
}
