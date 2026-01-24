-- SEC Hostel - Test User Seed Data
-- 
-- IMPORTANT: Run this AFTER creating the auth users in Supabase Auth
-- Replace the UUIDs with the actual UUIDs from your auth.users table

-- Step 1: Create auth users first in Supabase Dashboard (Authentication > Users)
-- warden@sec.edu with password: warden123
-- student1@sec.edu with password: student123

-- Step 2: Get the UUIDs by running this query:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC;

-- Step 3: Replace the placeholder UUIDs below with the actual ones

-- Insert user profiles (replace UUIDs with actual values from auth.users)
INSERT INTO public.users (id, register_number, full_name, role, hostel_block, room_number, parent_mobile)
VALUES 
    -- Warden User
    (
        'd6aeab91-b482-4d0a-a169-4a2a00b3dabd', 
        'W001', 
        'Chief Warden', 
        'warden', 
        'Admin Block', 
        '101', 
        '9999999999'
    ),
    -- Student User
    (
        'f4497692-3d7d-464a-a351-14f40dcdde11', 
        'S101', 
        'John Doe', 
        'student', 
        'Block A', 
        '101', 
        '9876543210'
    )
ON CONFLICT (id) DO NOTHING;

-- Verify the data was inserted
SELECT u.id, u.full_name, u.role, u.register_number, au.email
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.role DESC;
