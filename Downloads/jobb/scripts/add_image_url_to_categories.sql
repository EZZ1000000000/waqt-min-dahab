-- Add image_url column to job_categories table if it doesn't exist
ALTER TABLE job_categories
ADD COLUMN IF NOT EXISTS image_url TEXT;
