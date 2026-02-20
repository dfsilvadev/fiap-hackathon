ALTER TABLE "tb_assessment"
ADD COLUMN IF NOT EXISTS "grade" TEXT;

CREATE INDEX IF NOT EXISTS "tb_assessment_grade_idx"
ON "tb_assessment" ("grade");
