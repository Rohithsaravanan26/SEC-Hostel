-- Fix User Sync Issue
-- This script helps sync authenticated users to the users table

-- Step 1: Check which auth users are missing from the users table
-- Run this query first to see who needs to be added
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE WHEN u.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC;

-- Step 2: Manually add missing users
-- Copy the UUID from the query above and use it here
-- Replace the placeholders with actual values

-- For the current error (user d906fb4dfa325845...)
-- Get the full UUID from the query above, then run:

/*
INSERT INTO public.users (id, register_number, full_name, role, hostel_block, room_number, parent_mobile)
VALUES 
    ('PASTE_FULL_UUID_HERE', 'S101', 'Your Name', 'student', 'Block A', '101', '9876543210');
*/

-- If you have multiple users to add, you can do it in one statement:
/*
INSERT INTO public.users (id, register_number, full_name, role, hostel_block, room_number, parent_mobile)
VALUES 
    ('uuid-1', 'S101', 'Student One', 'student', 'Block A', '101', '9876543210'),
    ('uuid-2', 'S102', 'Student Two', 'student', 'Block B', '202', '9123456780'),
    ('uuid-3', 'W001', 'Chief Warden', 'warden', 'Admin Block', '101', '9999999999');
*/
