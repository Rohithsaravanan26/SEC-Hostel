# Student Profile Setup Guide

## Overview
This guide explains how to set up and use the new student profile system with extended fields.

## Step 1: Run Database Migration

Execute the following SQL in your Supabase SQL Editor:

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS course text,
ADD COLUMN IF NOT EXISTS student_mobile text,
ADD COLUMN IF NOT EXISTS blood_group text,
ADD COLUMN IF NOT EXISTS address text;
```

Or simply run the provided migration file: `add_student_profile_fields.sql`

## Step 2: Update Existing Student Records

You can update student profiles through the Supabase dashboard or create an admin interface. Example SQL:

```sql
UPDATE users 
SET 
  course = 'B.Tech Computer Science',
  student_mobile = '+91 9876543210',
  blood_group = 'O+',
  address = '123 Main Street, City, State - 123456'
WHERE id = 'student-uuid-here';
```

## New Profile Fields

### Required Fields (Already Exist)
- **Name**: `full_name`
- **Register Number**: `register_number`
- **Room Number**: `room_number`
- **Hostel Block**: `hostel_block`

### New Fields  (Just Added)
- **Course**: `course` - Student's course/department (e.g., "B.Tech CSE", "M.Tech AI")
- **Student Mobile**: `student_mobile` - Student's personal mobile number
- **Blood Group**: `blood_group` - Student's blood group (e.g., "A+", "B-", "O+", "AB+")
- **Address**: `address` - Student's permanent address

### Emergency Contact (Admin-Managed)
- **Parent Mobile**: `parent_mobile` - Parent/Guardian mobile number
  - ⚠️ **Important**: This field should be managed by administrators only
  - Displayed to wardens in emergency situations
  - Not editable by students

## Accessing the Profile Page

Students can access their profile by:
1. Logging into the student dashboard
2. Clicking the **profile icon** (UserCircle) in the top-right header
3. Or visiting: `/profile`

## Profile Page Features

### 📋 Personal Information Section
- Register Number
- Course
- Student Mobile (clickable to call)
- Blood Group

### 🏠 Hostel Information Section
- Hostel Block
- Room Number

### 📞 Emergency Contact Section
- Parent/Guardian Mobile (clickable to call)
- Permanent Address

## Example Student Data

```json
{
  "full_name": "John Doe",
  "register_number": "S101",
  "course": "B.Tech Computer Science",
  "hostel_block": "Block A",
  "room_number": "101",
  "student_mobile": "+91 9876543210",
  "parent_mobile": "+91 9988776655",
  "blood_group": "O+",
  "address": "123 Main Street, Chennai, Tamil Nadu - 600001"
}
```

## Seed Data Script Template

```sql
-- Update specific student profile
UPDATE users 
SET 
  course = 'B.Tech Computer Science',
  student_mobile = '+91 9876543210',
  blood_group = 'O+',
  address = '123 Main Street, Chennai, TN - 600001'
WHERE register_number = 'S101';

-- Bulk update for multiple students
UPDATE users 
SET course = 'B.Tech Computer Science'
WHERE hostel_block = 'Block A' AND role = 'student';
```

## Admin Features (Future Enhancement)

Consider adding an admin panel to:
- ✏️ Edit student profiles
- 📝 Bulk update parent mobile numbers
- 📊 Export student data
- 🔐 Manage emergency contacts

## Security Note

The `parent_mobile` field is particularly sensitive. Ensure:
- Only admins can update this field
- Students can view but not edit it
- It's displayed to wardens for emergency purposes

## Testing

1. Run the migration
2. Update a test student record
3. Log in as the student
4. Click the profile icon
5. Verify all fields display correctly
6. Test clickable phone numbers

---

**All changes are live in commit:** `f1f7fb2` 🎉
