-- Seed Additional Wardens
-- This script adds the floor wardens/in-charge to the system
-- Run this in Supabase SQL Editor AFTER creating auth users for each warden

-- Instructions:
-- 1. For each warden below, create an auth user in Supabase Dashboard
--    (Authentication → Users → Add user)
--    Email format: firstname.lastname@sec.edu (or use their actual email)
--    Password: Use a secure password (e.g., warden123 for testing)
--
-- 2. After creating each auth user, get their UUID from auth.users
--    Run: SELECT id, email FROM auth.users ORDER BY created_at DESC;
--
-- 3. Replace the UUIDs below with actual UUIDs from step 2
--
-- 4. Run this modified script to create warden profiles

-- Warden List:
-- 1. Dr. Arul Dalton
-- 2. Mr. Somanathan M A
-- 3. Dr. Dolli H
-- 4. Dr. Jeffin Gracewell J
-- 5. Dr. Sathiyamurthi K
-- 6. Dr. Venkatesan G
-- 7. Mr. Pavithrakannan A
-- 8. Dr. Sivakumar T
-- 9. Dr. Thirumalai
-- 10. Mr. David Raja V
-- 11. Mr. Rajkumar E
-- 12. Mr. Paranthaman K
-- 13. Mr. Raguraman
-- 14. Mr. Jekan Linkesh

INSERT INTO public.users (id, register_number, full_name, role, hostel_block, room_number, parent_mobile)
VALUES 
    -- Replace UUIDs with actual auth.users IDs
    ('REPLACE_UUID_1', 'W002', 'Dr. Arul Dalton', 'warden', 'Block A', '201', '9999999991'),
    ('REPLACE_UUID_2', 'W003', 'Mr. Somanathan M A', 'warden', 'Block A', '202', '9999999992'),
    ('REPLACE_UUID_3', 'W004', 'Dr. Dolli H', 'warden', 'Block B', '201', '9999999993'),
    ('REPLACE_UUID_4', 'W005', 'Dr. Jeffin Gracewell J', 'warden', 'Block B', '202', '9999999994'),
    ('REPLACE_UUID_5', 'W006', 'Dr. Sathiyamurthi K', 'warden', 'Block C', '201', '9999999995'),
    ('REPLACE_UUID_6', 'W007', 'Dr. Venkatesan G', 'warden', 'Block C', '202', '9999999996'),
    ('REPLACE_UUID_7', 'W008', 'Mr. Pavithrakannan A', 'warden', 'Block D', '201', '9999999997'),
    ('REPLACE_UUID_8', 'W009', 'Dr. Sivakumar T', 'warden', 'Block D', '202', '9999999998'),
    ('REPLACE_UUID_9', 'W010', 'Dr. Thirumalai', 'warden', 'Block E', '201', '9999999999'),
    ('REPLACE_UUID_10', 'W011', 'Mr. David Raja V', 'warden', 'Block E', '202', '9999999990'),
    ('REPLACE_UUID_11', 'W012', 'Mr. Rajkumar E', 'warden', 'Block F', '201', '9999999989'),
    ('REPLACE_UUID_12', 'W013', 'Mr. Paranthaman K', 'warden', 'Block F', '202', '9999999988'),
    ('REPLACE_UUID_13', 'W014', 'Mr. Raguraman', 'warden', 'Block G', '201', '9999999987'),
    ('REPLACE_UUID_14', 'W015', 'Mr. Jekan Linkesh', 'warden', 'Block G', '202', '9999999986');

-- After running this, verify with:
-- SELECT register_number, full_name, role, hostel_block FROM users WHERE role = 'warden' ORDER BY register_number;
