# Warden Assignment Feature - Setup Guide

## Database Setup (Required First!)

### Step 1: Add the `assigned_warden_id` Column

In **Supabase Dashboard** → **SQL Editor**, run [`add_warden_assignment.sql`](file:///d:/Project%20SEC%20Hostel/add_warden_assignment.sql):

```sql
ALTER TABLE leave_requests 
ADD COLUMN assigned_warden_id uuid REFERENCES users(id);
```

This adds the warden assignment capability to the database.

---

### Step 2: Create Storage Bucket (If Not Already Done)

Follow [`STORAGE_SETUP.md`](file:///d:/Project%20SEC%20Hostel/STORAGE_SETUP.md) to create the `leave_docs` storage bucket if you haven't already.

---

### Step 3: Ensure Users Are Synced

Run [`fix_user_sync.sql`](file:///d:/Project%20SEC%20Hostel/fix_user_sync.sql) to check if your existing auth users are in the public.users table:

```sql
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE WHEN u.id IS NULL THEN 'MISSING' ELSE 'EXISTS' END as status
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC;
```

If any users are MISSING, add them using the INSERT statements provided in the earlier guides.

---

## Optional: Add Additional Wardens

If you want to populate the 14 wardens from your list, follow these steps:

### Option A: Quick Test (Use Existing Warden)

You already have one warden account (`warden@sec.edu`). You can test the feature immediately with just this one warden without adding more.

### Option B: Add All 14 Wardens (Production Setup)

1. **Create Auth Users** in Supabase Dashboard (Authentication → Users):
   - Create accounts for each warden (e.g., `arul.dalton@sec.edu`, `somanathan@sec.edu`, etc.)
   - Use password `warden123` for testing

2. **Get Their UUIDs**:
   ```sql
   SELECT id, email FROM auth.users WHERE email LIKE '%@sec.edu' ORDER BY created_at DESC;
   ```

3. **Update [`seed_wardens.sql`](file:///d:/Project%20SEC%20Hostel/seed_wardens.sql)** with the actual UUIDs

4. **Run the modified script** in SQL Editor

---

## Testing the Features

### ✅ Feature 1: Warden Selection in Request Form

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000` and log in as student: `student1@sec.edu` / `student123`
3. Click **New Request**
4. Notice the new **"Assign to Warden"** dropdown (required field with red asterisk)
5. Select a warden from the dropdown
6. Fill in other fields and upload a document
7. Submit the request
8. **Expected**: Request is created successfully with the assigned warden

### ✅ Feature 2: Document Viewing in Warden Dashboard

1. Log out and log in as warden: `warden@sec.edu` / `warden123`
2. Go to warden dashboard
3. Notice two new columns:
   - **Assigned Warden**: Shows which warden was assigned to each request
   - **Document**: Shows a clickable "View" link
4. Click the **"View"** link for any request
5. **Expected**: Supporting document opens in a new tab

### ✅ Feature 3: Close Button on Digital Pass

1. Log in as student: `student1@sec.edu` / `student123`
2. Click on an **Approved** request to view the digital pass
3. Scroll to the bottom of the pass
4. Notice the **"Close"** button
5. Click it
6. **Expected**: Navigate back to the student dashboard

---

## Verification Queries

### Check Warden Assignments

```sql
SELECT 
  lr.id,
  lr.reason,
  u1.full_name as student_name,
  u2.full_name as assigned_warden_name,
  u2.hostel_block as warden_block,
  lr.document_url
FROM leave_requests lr
LEFT JOIN users u1 ON lr.student_id = u1.id
LEFT JOIN users u2 ON lr.assigned_warden_id = u2.id
ORDER BY lr.created_at DESC
LIMIT 10;
```

### List All Wardens

```sql
SELECT 
  full_name, 
  hostel_block, 
  register_number 
FROM users 
WHERE role = 'warden' 
ORDER BY full_name;
```

---

## Important Notes

> [!WARNING]
> **Storage Bucket Required**
> The `leave_docs` storage bucket must exist before submitting requests. If you haven't created it yet, follow [`STORAGE_SETUP.md`](file:///d:/Project%20SEC%20Hostel/STORAGE_SETUP.md).

> [!NOTE]
> **Existing Requests**
> Old requests created before this update will have `assigned_warden_id = NULL` and will show "Not assigned" in the warden dashboard. This is normal and won't cause any issues.

---

## Files Reference

- [`add_warden_assignment.sql`](file:///d:/Project%20SEC%20Hostel/add_warden_assignment.sql) - Database migration
- [`seed_wardens.sql`](file:///d:/Project%20SEC%20Hostel/seed_wardens.sql) - Optional warden seed data
- [`NewRequestModal.tsx`](file:///d:/Project%20SEC%20Hostel/components/NewRequestModal.tsx) - Updated request form
- [`app/warden/page.tsx`](file:///d:/Project%20SEC%20Hostel/app/warden/page.tsx) - Updated warden dashboard
- [`app/pass/[id]/page.tsx`](file:///d:/Project%20SEC%20Hostel/app/pass/[id]/page.tsx) - Updated digital pass
