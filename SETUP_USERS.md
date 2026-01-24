# Setting Up Test Users for SEC Hostel Portal

This guide will walk you through creating test users in your Supabase database so you can log in and test the SEC Hostel application.

## Prerequisites

- Access to your Supabase dashboard: https://gqgohwvjkasuglrxwrko.supabase.co
- The [seed_users.sql](file:///d:/Project%20SEC%20Hostel/seed_users.sql) script in this repository

## Test Credentials

Once setup is complete, you'll be able to log in with:

### Warden Account
- **Email**: `warden@sec.edu`
- **Password**: `warden123`
- **Role**: Warden (Admin)
- **Access**: Warden dashboard with leave request management

### Student Account
- **Email**: `student1@sec.edu`  
- **Password**: `student123`
- **Role**: Student
- **Access**: Student dashboard with leave request submission

---

## Setup Instructions

### Step 1: Create Auth Users in Supabase

1. Open your Supabase project dashboard: https://gqgohwvjkasuglrxwrko.supabase.co
2. Navigate to **Authentication** → **Users** in the left sidebar
3. Click **Add user** → **Create new user**

**Create Warden User:**
- Email: `warden@sec.edu`
- Password: `warden123`
- Click **Create user**

**Create Student User:**
- Email: `student1@sec.edu`
- Password: `student123`
- Click **Create user**

### Step 2: Get User UUIDs

1. In Supabase dashboard, go to **SQL Editor**
2. Run this query to get the user IDs:

```sql
SELECT id, email FROM auth.users ORDER BY created_at DESC;
```

3. Copy the UUIDs for both users:
   - Note which UUID belongs to `warden@sec.edu`
   - Note which UUID belongs to `student1@sec.edu`

### Step 3: Insert User Profiles

1. Open the [seed_users.sql](file:///d:/Project%20SEC%20Hostel/seed_users.sql) file
2. **Replace** `REPLACE_WITH_WARDEN_UUID` with the warden's actual UUID
3. **Replace** `REPLACE_WITH_STUDENT_UUID` with the student's actual UUID
4. In Supabase **SQL Editor**, paste the modified SQL script
5. Click **Run** to execute

### Step 4: Verify Setup

Run this query to verify the users were created correctly:

```sql
SELECT u.id, u.full_name, u.role, u.register_number, au.email
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.role DESC;
```

You should see:
- Chief Warden (warden@sec.edu)
- John Doe (student1@sec.edu)

---

## Testing the Application

1. Visit your production app: **https://sec-hostel.vercel.app**
2. Try logging in with the warden credentials
3. Log out and try the student credentials
4. Verify that you're redirected to the appropriate dashboard for each role

---

## Troubleshooting

**"Invalid login credentials" error:**
- Double-check you created the auth users with the exact emails and passwords listed above
- Make sure you're using the correct password (warden123 or student123)

**"User profile not found" or similar error:**
- Verify you ran the seed_users.sql script with the correct UUIDs
- Check that the UUIDs in the users table match the auth.users table

**Still having issues?**
- Check the Supabase logs (Logs → Auth) for detailed error messages
- Verify RLS policies are enabled correctly (already set up in schema.sql)

---

## Next Steps

Once test users are set up, you can:
- Create leave requests as a student
- Approve/reject requests as a warden
- Test the digital pass functionality
- Add more test users by following the same process

## Security Note

> [!WARNING]  
> These are test credentials for development/demo purposes only. For production use with real users, implement proper user registration and password management.
