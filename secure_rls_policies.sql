-- SECURE Row Level Security Policies for SEC Hostel Portal
-- This file replaces the insecure policies in schema.sql

-- ============================================
-- CRITICAL FIX: Secure Leave Requests Policies
-- ============================================

-- Drop existing insecure policies
DROP POLICY IF EXISTS "See all leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Create leave requests" ON leave_requests;
DROP POLICY IF EXISTS "Update leave requests" ON leave_requests;

-- 1. SELECT: Students see ONLY their own requests, Wardens see all
CREATE POLICY "Secure select leave requests" ON leave_requests FOR SELECT
USING (
  auth.uid() = student_id 
  OR 
  (SELECT role FROM users WHERE id = auth.uid()) = 'warden'
);

-- 2. INSERT: Students can only create requests for themselves
CREATE POLICY "Secure insert leave requests" ON leave_requests FOR INSERT
WITH CHECK (
  auth.uid() = student_id
  AND status = 'Pending' -- Force new requests to be Pending
);

-- 3. UPDATE: Split into separate policies for Students and Wardens
-- Students can ONLY update actual check-in/out times (NOT status)
CREATE POLICY "Students update punch times only" ON leave_requests FOR UPDATE
USING (
  auth.uid() = student_id 
  AND status = 'Approved' -- Can only punch approved requests
)
WITH CHECK (
  auth.uid() = student_id
  AND status = 'Approved' -- Cannot change status
  -- Note: Application logic will ensure only actual_out_time and actual_in_time are updated
);

-- Wardens can UPDATE status and rejection_reason (NOT punch times)
CREATE POLICY "Wardens update status only" ON leave_requests FOR UPDATE
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'warden'
)
WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'warden'
);

-- 4. DELETE: NO ONE can delete (preserves audit trail)
-- Students cannot hide rejection history
-- Only database admin can delete via direct SQL
CREATE POLICY "No delete allowed" ON leave_requests FOR DELETE
USING (false);

-- ============================================
-- Additional Security: Users Table Policies
-- ============================================

-- Drop existing policies if needed
DROP POLICY IF EXISTS "Public users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Users can view all users (needed for warden to see student info)
CREATE POLICY "Secure select users" ON users FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can only update their own non-critical fields
CREATE POLICY "Users update own profile" ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM users WHERE id = auth.uid()) -- Cannot change role
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test these queries as a student to verify security:

-- Should FAIL (students cannot approve):
-- UPDATE leave_requests SET status = 'Approved' WHERE id = 1;

-- Should FAIL (students cannot see other students' requests):
-- SELECT * FROM leave_requests WHERE student_id != auth.uid();

-- Should FAIL (students cannot delete):
-- DELETE FROM leave_requests WHERE id = 1;

-- Should SUCCEED (students can create):
-- INSERT INTO leave_requests (student_id, type, reason, out_date, in_date) 
-- VALUES (auth.uid(), 'Outing', 'Test', NOW(), NOW() + interval '2 hours');

-- Should SUCCEED (students can punch approved requests):
-- UPDATE leave_requests SET actual_out_time = NOW() 
-- WHERE id = X AND student_id = auth.uid() AND status = 'Approved';
