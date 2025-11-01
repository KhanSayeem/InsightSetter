-- Add CASE_STUDY to ArticleCategory enum without affecting existing values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'ArticleCategory' AND e.enumlabel = 'CASE_STUDY'
  ) THEN
    ALTER TYPE "ArticleCategory" ADD VALUE 'CASE_STUDY';
  END IF;
END$$;