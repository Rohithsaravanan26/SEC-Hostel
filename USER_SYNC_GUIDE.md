# User Sync Guide - Fix "Student ID Not Found" Error

## Problem

When trying to create a leave request, you see:
```
Error creating request: {code: "23503", details: "Key (student_id)=(...) is not present in table "users"}
```

This happens because your authenticated user exists in `auth.users` but not in `public.users`.

---

## Quick Fix (For Current User)

### Step 1: Find Your User ID

Go to **Supabase Dashboard** → **SQL Editor** and run:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC;
```

Copy your UUID (the one matching your email).

### Step 2: Add Yourself to Users Table

Run this SQL (replace the placeholders):

```sql
INSERT INTO public.users (id, register_number, full_name, role, hostel_block, room_number, parent_mobile)
VALUES 
    ('PASTE_YOUR_UUID_HERE', 'S101', 'Your Full Name', 'student', 'Block A', '101', '9876543210');
```

### Step 3: Try Again

Return to the app and submit your request - it should work now! ✅

---

## Automated Fix (Recommended)

To prevent this issue for all future users, set up automatic user profile creation:

### 1. Run the Auto-Sync Trigger Script

In **Supabase Dashboard** → **SQL Editor**, run the entire [`auto_user_sync_trigger.sql`](file:///d:/Project%20SEC%20Hostel/auto_user_sync_trigger.sql) file.

This creates a database trigger that automatically adds a user profile whenever someone signs up.

### 2. Backfill Existing Users

For users who already signed up but aren't in the `users` table:

1. Run [`fix_user_sync.sql`](file:///d:/Project%20SEC%20Hostel/fix_user_sync.sql) - Step 1 query to see missing users
2. Copy the UUIDs
3. Use the INSERT statement in Step 2 to add them

---

## Alternative: Use the Helper Script

Open [`fix_user_sync.sql`](file:///d:/Project%20SEC%20Hostel/fix_user_sync.sql) in the SQL Editor and:

1. **Run the SELECT query** (Step 1) to see all users and their sync status
2. **Copy any UUIDs** marked as "MISSING"  
3. **Run the INSERT statement** (Step 2) with the copied UUIDs and user details

---

## How It Works

### Before (Manual Process)
1. User signs up → Gets added to `auth.users`
2. Admin manually adds them to `public.users`
3. ❌ If step 2 is forgotten, user can't create requests

### After (Automatic)
1. User signs up → Gets added to `auth.users`
2. ✅ Trigger automatically creates profile in `public.users`
3. User can immediately create requests

---

## Verification

After setting up the trigger, test it:

1. Create a new test user via Supabase Auth
2. Run this query:
```sql
SELECT * FROM public.users WHERE id = 'NEW_USER_UUID';
```
3. You should see the user automatically created with default values

---

## Files Reference

- [`fix_user_sync.sql`](file:///d:/Project%20SEC%20Hostel/fix_user_sync.sql) - One-time fix for existing users
- [`auto_user_sync_trigger.sql`](file:///d:/Project%20SEC%20Hostel/auto_user_sync_trigger.sql) - Prevents future issues
- [`seed_users.sql`](file:///d:/Project%20SEC%20Hostel/seed_users.sql) - Original seed data script

---

## Troubleshooting

**Q: I ran the trigger script but still get the error**  
A: The trigger only works for NEW signups. You still need to backfill existing users using `fix_user_sync.sql`.

**Q: Can I customize the default values?**  
A: Yes! Edit `auto_user_sync_trigger.sql` and change the default role, full_name format, etc.

**Q: What if I want users to choose their role during signup?**  
A: Pass metadata during signup:
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'student',
      parent_mobile: '9876543210'
    }
  }
})
```

The trigger will automatically use this metadata when creating the profile.
