-- Add rejection reason column to leave_requests table

ALTER TABLE leave_requests 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add comment for documentation
COMMENT ON COLUMN leave_requests.rejection_reason IS 'Reason provided by warden when rejecting a request';
