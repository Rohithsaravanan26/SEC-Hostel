-- Add Bio-Metric and additional student fields to users table
-- Run this in Supabase SQL Editor BEFORE running the import script

ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio_metric_number text,
ADD COLUMN IF NOT EXISTS department text,
ADD COLUMN IF NOT EXISTS year text,
ADD COLUMN IF NOT EXISTS floor_incharge text;

-- Add comments for documentation
COMMENT ON COLUMN users.bio_metric_number IS 'Student biometric number (used as password for login)';
COMMENT ON COLUMN users.department IS 'Student department (e.g., Civil Engineering, B.Tech CSE)';
COMMENT ON COLUMN users.year IS 'Student year (I, II, III, IV)';
COMMENT ON COLUMN users.floor_incharge IS 'Floor incharge name for the student room';

-- Create index on student_mobile for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_student_mobile ON users(student_mobile);
CREATE INDEX IF NOT EXISTS idx_users_bio_metric_number ON users(bio_metric_number);
