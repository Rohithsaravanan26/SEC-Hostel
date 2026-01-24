# Storage Bucket Setup Instructions

## Issue
If you see the error "Failed to upload document. Please check if the storage bucket 'leave_docs' exists", you need to create the storage bucket in Supabase.

## Steps to Create Storage Bucket

### 1. Go to Supabase Dashboard
1. Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: **gqgohwvjkasuglrxwrko**

### 2. Create Storage Bucket
1. Navigate to **Storage** in the left sidebar
2. Click **New bucket**
3. Enter the following details:
   - **Name**: `leave_docs`
   - **Public**: ✅ **Checked** (Enable public access)
   - **File size limit**: 5MB (optional)
   - **Allowed MIME types**: Leave empty to allow all file types

4. Click **Create bucket**

### 3. Set Storage Policies

After creating the bucket, you need to set up policies to allow authenticated users to upload files:

#### Option A: Using SQL Editor (Recommended)

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Allow public read access to files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'leave_docs');

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'leave_docs' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own files (optional)
CREATE POLICY "Authenticated Update Own Files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'leave_docs' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own files (optional)
CREATE POLICY "Authenticated Delete Own Files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'leave_docs' 
  AND auth.role() = 'authenticated'
);
```

#### Option B: Using Dashboard UI

1. Click on the **leave_docs** bucket
2. Go to the **Policies** tab
3. Click **New Policy**
4. Create the following policies:

**Policy 1: Public Read**
- Operation: SELECT
- Name: "Public Access"
- Policy: `bucket_id = 'leave_docs'`

**Policy 2: Authenticated Upload**
- Operation: INSERT
- Name: "Authenticated Upload"  
- Policy: `bucket_id = 'leave_docs' AND auth.role() = 'authenticated'`

### 4. Verify Setup

1. Go back to your application
2. Try submitting a new request with a file
3. Check the browser console for detailed logs
4. If successful, you should see:
   - "Starting file upload..."
   - "File uploaded successfully: [URL]"
   - "Request created successfully"

## Troubleshooting

### Error: "Permission denied for bucket"
- Make sure the bucket is marked as **Public**
- Check that storage policies are created correctly
- Verify user is authenticated

### Error: "File size exceeds 5MB limit"
- Choose a smaller file (must be under 5MB)

### Error: "Storage upload failed"
- Check Supabase dashboard for any service outages
- Verify your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct in `.env.local`

### Database Insert Errors

If file uploads successfully but request creation fails:

**Error code 23503**: User validation failed
- The `student_id` doesn't exist in the `users` table
- Solution: Make sure you've run the `seed_users.sql` script

**Error code 42501**: Permission denied
- RLS policy is blocking the insert
- Solution: Check that the "Create leave requests" policy exists:
  ```sql
  create policy "Create leave requests" 
  on leave_requests for insert 
  with check (auth.uid() = student_id);
  ```

## Checking Browser Console

To see detailed error logs:
1. Press `F12` to open Developer Tools
2. Go to the **Console** tab
3. Submit a request
4. Look for log messages that show exactly where it's failing
