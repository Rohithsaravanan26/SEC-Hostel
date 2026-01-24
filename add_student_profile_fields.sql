-- Add missing student profile fields to users table

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS course text,
ADD COLUMN IF NOT EXISTS student_mobile text,
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS address text;

-- Add comment for documentation
COMMENT ON COLUMN users.course IS 'Student course/department (e.g., B.Tech CSE, M.Tech AI)';
COMMENT ON COLUMN users.student_mobile IS 'Student personal mobile number';
COMMENT ON COLUMN users.blood_group IS 'Student blood group (e.g., A+, B-, O+, AB+)';
COMMENT ON COLUMN users.address IS 'Student permanent address';
COMMENT ON COLUMN users.parent_mobile IS 'Parent/Guardian mobile number (managed by admin)';
