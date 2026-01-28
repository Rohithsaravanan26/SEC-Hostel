# 🚀 Quick Security Test - Instructions

## Step 1: Open Production Site
Visit: https://sec-hostel.vercel.app

## Step 2: Login as Student
- Email: `student1@sec.edu`
- Password: `student123`

## Step 3: Open Browser Console
- Press `F12` (or Ctrl+Shift+I)
- Click "Console" tab

## Step 4: Run Security Test
1. Open file: `security-test-ready.js`
2. Copy ENTIRE script (Ctrl+A, Ctrl+C)
3. Paste in browser console (Ctrl+V)
4. Press Enter

## Step 5: Review Results
You should see:
```
🎉 ALL TESTS PASSED!
✅ Site Security: EXCELLENT
✅ RLS Policies: ACTIVE & WORKING
✅ Ready for Production
```

## Expected Test Results:

| Test | Expected |
|------|----------|
| 1. Self-Approval | ✅ PASS (Blocked) |
| 2. Delete History | ✅ PASS (Blocked) |
| 3. View Others' Requests | ✅ PASS (Own only) |
| 4. Role Manipulation | ✅ PASS (Unchanged) |
| 5. Update Others' Data | ✅ PASS (Blocked) |
| 6. Ghost Punch | ✅ PASS (Blocked) |
| 7. Double Punch | ✅ PASS (Protected) |

**Success Rate:** 100%

## ⚠️ If Tests Fail:

1. **Check RLS Policies:**
   ```sql
   -- Run in Supabase SQL Editor:
   SELECT * FROM pg_policies WHERE tablename = 'leave_requests';
   ```

2. **Run the SQL Migration:**
   - Open `secure_rls_policies.sql`
   - Copy entire content
   - Paste in Supabase SQL Editor
   - Execute

3. **Verify Deployment:**
   - Check Vercel for latest build
   - Confirm commit `0f842e2` is live

4. **Retry Test:**
   - Clear browser cache (Ctrl+Shift+Delete)
   - Hard refresh (Ctrl+Shift+R)
   - Run test again

## 📝 Additional Manual Tests:

### File Upload Security:
1. Try to upload `.exe` file renamed as `.pdf`
2. Expected: ❌ "File content does not match PDF format"

### Warden Access:
1. As student, visit: `/warden`
2. Expected: ✅ Redirect to `/dashboard`

### Middleware Check:
1. Logout
2. Try to visit `/dashboard`
3. Expected: ✅ Redirect to `/login`

---

**All tests passing = Site is SECURE! 🔒**
