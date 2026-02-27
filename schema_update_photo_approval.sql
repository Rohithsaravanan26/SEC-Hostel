-- Update users table to include photo approval status
ALTER TABLE public.users ADD COLUMN photo_status text check (photo_status in ('pending', 'approved', 'rejected'));
