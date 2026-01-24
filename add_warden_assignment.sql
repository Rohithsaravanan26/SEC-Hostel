-- Add assigned_warden_id column to leave_requests table
-- This allows students to assign their requests to specific wardens

ALTER TABLE leave_requests 
ADD COLUMN assigned_warden_id uuid REFERENCES users(id);

-- Add comment for documentation
COMMENT ON COLUMN leave_requests.assigned_warden_id IS 'The warden assigned to review this leave request';
