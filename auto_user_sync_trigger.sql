-- Automatic User Profile Creation Trigger
-- This prevents the sync issue by automatically creating a user profile 
-- whenever someone signs up via Supabase Auth

-- Step 1: Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new row in public.users for every new auth.users row
    INSERT INTO public.users (id, register_number, full_name, role, hostel_block, room_number, parent_mobile)
    VALUES (
        NEW.id,
        NULL, -- Register number can be updated later
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'), -- Get from signup metadata if provided
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'), -- Default to student
        NULL, -- Hostel block can be updated later
        NULL, -- Room number can be updated later
        NEW.raw_user_meta_data->>'parent_mobile' -- Get from signup metadata if provided
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Test the trigger (optional)
-- When a new user signs up, they should automatically get a row in public.users

-- Note: For existing users who are already in auth.users but not in public.users,
-- you'll still need to run the fix_user_sync.sql script once to backfill them.
