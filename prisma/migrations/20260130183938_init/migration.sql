-- CreateTable
CREATE TABLE "tb_user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "role_id" TEXT NOT NULL,
    "date_of_birth" DATE,
    "current_grade" TEXT,
    "guardians" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_refresh_token" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_refresh_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tb_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "tb_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_teacher_subject" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_teacher_subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content_text" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "topics" JSONB,
    "glossary" JSONB,
    "accessibility_metadata" JSONB,
    "tags" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_learning_path" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_learning_path_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_learning_path_content" (
    "id" TEXT NOT NULL,
    "learning_path_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "order_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_learning_path_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_student_learning_level" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_student_learning_level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_assessment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "content_id" TEXT,
    "teacher_id" TEXT NOT NULL,
    "min_score" DECIMAL(65,30) NOT NULL DEFAULT 70,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_question" (
    "id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" TEXT NOT NULL,
    "options" JSONB,
    "correct_answer" TEXT NOT NULL,
    "points" DECIMAL(65,30) NOT NULL DEFAULT 1,
    "tags" JSONB,
    "order_number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_student_answer" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "answer_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "points_earned" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_student_answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_assessment_result" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "total_score" DECIMAL(65,30) NOT NULL,
    "max_score" DECIMAL(65,30) NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "level_updated" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_assessment_result_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_recommendation" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_student_progress" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "content_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "time_spent" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_student_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tb_user_email_key" ON "tb_user"("email");

-- CreateIndex
CREATE INDEX "tb_refresh_token_token_hash_idx" ON "tb_refresh_token"("token_hash");

-- CreateIndex
CREATE INDEX "tb_refresh_token_user_id_idx" ON "tb_refresh_token"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_teacher_subject_teacher_id_category_id_key" ON "tb_teacher_subject"("teacher_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_learning_path_content_learning_path_id_order_number_key" ON "tb_learning_path_content"("learning_path_id", "order_number");

-- CreateIndex
CREATE UNIQUE INDEX "tb_student_learning_level_student_id_category_id_key" ON "tb_student_learning_level"("student_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_student_answer_student_id_question_id_key" ON "tb_student_answer"("student_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_assessment_result_student_id_assessment_id_key" ON "tb_assessment_result"("student_id", "assessment_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_student_progress_student_id_content_id_key" ON "tb_student_progress"("student_id", "content_id");

-- AddForeignKey
ALTER TABLE "tb_user" ADD CONSTRAINT "tb_user_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "tb_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_refresh_token" ADD CONSTRAINT "tb_refresh_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_teacher_subject" ADD CONSTRAINT "tb_teacher_subject_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_teacher_subject" ADD CONSTRAINT "tb_teacher_subject_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tb_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_content" ADD CONSTRAINT "tb_content_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tb_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_content" ADD CONSTRAINT "tb_content_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_learning_path" ADD CONSTRAINT "tb_learning_path_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tb_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_learning_path" ADD CONSTRAINT "tb_learning_path_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_learning_path_content" ADD CONSTRAINT "tb_learning_path_content_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "tb_learning_path"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_learning_path_content" ADD CONSTRAINT "tb_learning_path_content_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "tb_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_student_learning_level" ADD CONSTRAINT "tb_student_learning_level_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_student_learning_level" ADD CONSTRAINT "tb_student_learning_level_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tb_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_assessment" ADD CONSTRAINT "tb_assessment_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "tb_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_assessment" ADD CONSTRAINT "tb_assessment_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_question" ADD CONSTRAINT "tb_question_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "tb_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_student_answer" ADD CONSTRAINT "tb_student_answer_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_student_answer" ADD CONSTRAINT "tb_student_answer_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "tb_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_student_answer" ADD CONSTRAINT "tb_student_answer_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "tb_question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_assessment_result" ADD CONSTRAINT "tb_assessment_result_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_assessment_result" ADD CONSTRAINT "tb_assessment_result_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "tb_assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recommendation" ADD CONSTRAINT "tb_recommendation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_recommendation" ADD CONSTRAINT "tb_recommendation_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "tb_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_student_progress" ADD CONSTRAINT "tb_student_progress_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "tb_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_student_progress" ADD CONSTRAINT "tb_student_progress_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "tb_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
