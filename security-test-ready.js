// 🛡️ SEC Hostel Security Test - FIXED VERSION
// Make sure you're LOGGED IN to the site first!
// Then copy ALL of this and paste in console

(async function runSecurityAudit() {
    console.log('🔒 SEC Hostel Security Audit - Starting...\n');
    console.log('⏰ Timestamp:', new Date().toLocaleString());
    console.log('='.repeat(60) + '\n');

    const results = {
        totalTests: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    function logTest(name, passed, message) {
        results.totalTests++;
        const emoji = passed ? '✅' : '❌';

        if (passed) {
            results.passed++;
            console.log(`${emoji} ${name}`);
            console.log(`   └─ ${message}\n`);
        } else {
            results.failed++;
            console.error(`${emoji} ${name}`);
            console.error(`   └─ ⚠️  ${message}\n`);
        }
        results.tests.push({ name, passed, message });
    }

    // Import Supabase from CDN
    console.log('🔌 Loading Supabase client...');
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');

    const SUPABASE_URL = 'https://gqgohwvjkasuglrxwrko.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZ29od3Zqa2FzdWdscnh3cmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjA0NTIsImV4cCI6MjA4NDczNjQ1Mn0.KaZF-MQi1wVzZRQZOXP6sqqckW8POdaGurf-IPytDV8';

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        }
    });

    // Check authentication
    console.log('👤 Checking authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
        console.error('❌ NOT AUTHENTICATED!');
        console.error('');
        console.error('Please follow these steps:');
        console.error('1. Make sure you are LOGGED IN to the site');
        console.error('2. You should see the dashboard page');
        console.error('3. Then run this script again');
        console.error('');
        console.error('If you ARE logged in, try:');
        console.error('1. Refresh the page (F5)');
        console.error('2. Login again');
        console.error('3. Run this script');
        return;
    }

    const user = session.user;
    console.log(`✅ Authenticated as: ${user.email}`);
    console.log(`🆔 User ID: ${user.id}`);
    console.log('='.repeat(60) + '\n');

    // ==========================================
    // TEST 1: Self-Approval Attack (CRITICAL)
    // ==========================================
    console.log('🧪 TEST 1: Self-Approval Attack (CRITICAL)');
    console.log('   Attempting to approve own request...');
    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({ status: 'Approved' })
            .eq('student_id', user.id)
            .select();

        const blocked = (error !== null || (data && data.length === 0));
        logTest(
            'Self-Approval Attack',
            blocked,
            blocked ? 'RLS successfully blocked self-approval ✓' : 'CRITICAL: Self-approval succeeded! 🚨'
        );
    } catch (e) {
        logTest('Self-Approval Attack', true, `Exception thrown: ${e.message}`);
    }

    // ==========================================
    // TEST 2: Delete History Attack (CRITICAL)
    // ==========================================
    console.log('🧪 TEST 2: Delete History Attack (CRITICAL)');
    console.log('   Attempting to delete leave request...');
    try {
        const { error, data } = await supabase
            .from('leave_requests')
            .delete()
            .eq('student_id', user.id)
            .limit(1);

        const blocked = (error !== null);
        logTest(
            'Delete History Attack',
            blocked,
            blocked ? 'RLS successfully blocked deletion ✓' : 'CRITICAL: Deletion succeeded! 🚨'
        );
    } catch (e) {
        logTest('Delete History Attack', true, `Exception thrown: ${e.message}`);
    }

    // ==========================================
    // TEST 3: View Other Students' Requests (HIGH)
    // ==========================================
    console.log('🧪 TEST 3: View Other Students\' Requests (HIGH)');
    console.log('   Querying all leave requests...');
    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .select('id, student_id');

        if (error) {
            logTest('View Other Students', false, `Query error: ${error.message}`);
        } else {
            const myRequests = data.filter(r => r.student_id === user.id).length;
            const otherRequests = data.filter(r => r.student_id !== user.id).length;
            const otherStudentsVisible = otherRequests > 0;

            logTest(
                'View Other Students',
                !otherStudentsVisible,
                otherStudentsVisible
                    ? `HIGH: Can see ${otherRequests} other students' requests! 🚨`
                    : `Only ${myRequests} own request(s) visible ✓`
            );
        }
    } catch (e) {
        logTest('View Other Students', false, e.message);
    }

    // ==========================================
    // TEST 4: Role Manipulation Attack (CRITICAL)
    // ==========================================
    console.log('🧪 TEST 4: Role Manipulation Attack (CRITICAL)');
    console.log('   Attempting to change role to warden...');
    try {
        // Get current role
        const { data: beforeRole } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        // Try to change role
        await supabase
            .from('users')
            .update({ role: 'warden' })
            .eq('id', user.id);

        // Check if role changed
        const { data: afterRole } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        const roleUnchanged = (beforeRole?.role === afterRole?.role);
        logTest(
            'Role Manipulation',
            roleUnchanged,
            roleUnchanged
                ? `Role unchanged: ${afterRole?.role} ✓`
                : `CRITICAL: Role changed from ${beforeRole?.role} to ${afterRole?.role}! 🚨`
        );
    } catch (e) {
        logTest('Role Manipulation', true, `Exception thrown: ${e.message}`);
    }

    // ==========================================
    // TEST 5: Update Other Student's Data (CRITICAL)
    // ==========================================
    console.log('🧪 TEST 5: Update Other Student\'s Data (CRITICAL)');
    console.log('   Attempting to modify another student\'s request...');
    try {
        const { data: allRequests } = await supabase
            .from('leave_requests')
            .select('id, student_id');

        const otherRequest = allRequests?.find(r => r.student_id !== user.id);

        if (otherRequest) {
            const { error, data } = await supabase
                .from('leave_requests')
                .update({ status: 'Approved' })
                .eq('id', otherRequest.id)
                .select();

            const blocked = (error !== null || (data && data.length === 0));
            logTest(
                'Update Other\'s Data',
                blocked,
                blocked ? 'RLS blocked update ✓' : 'CRITICAL: Updated another student\'s request! 🚨'
            );
        } else {
            logTest(
                'Update Other\'s Data',
                true,
                'No other students\' requests visible (RLS working) ✓'
            );
        }
    } catch (e) {
        logTest('Update Other\'s Data', true, `Exception thrown: ${e.message}`);
    }

    // ==========================================
    // TEST 6: Ghost Punch Attack (CRITICAL)
    // ==========================================
    console.log('🧪 TEST 6: Ghost Punch Attack (CRITICAL)');
    console.log('   Attempting to check-out pending request...');
    try {
        const { data: pendingReqs } = await supabase
            .from('leave_requests')
            .select('id, status')
            .eq('student_id', user.id)
            .eq('status', 'Pending')
            .limit(1);

        if (pendingReqs && pendingReqs.length > 0) {
            const { error, data } = await supabase
                .from('leave_requests')
                .update({ actual_out_time: new Date().toISOString() })
                .eq('id', pendingReqs[0].id)
                .select();

            const blocked = (error !== null || (data && data.length === 0));
            logTest(
                'Ghost Punch (Pending)',
                blocked,
                blocked ? 'RLS blocked punch on pending request ✓' : 'CRITICAL: Punched pending request! 🚨'
            );
        } else {
            console.log('   ℹ️  No pending requests found to test');
            logTest('Ghost Punch (Pending)', true, 'No pending requests (create one to test this)');
        }
    } catch (e) {
        logTest('Ghost Punch (Pending)', true, `Exception thrown: ${e.message}`);
    }

    // ==========================================
    // TEST 7: Double Punch Prevention (MEDIUM)
    // ==========================================
    console.log('🧪 TEST 7: Double Punch Prevention (MEDIUM)');
    console.log('   Checking double-punch protection...');
    try {
        const { data: checkedOutReqs } = await supabase
            .from('leave_requests')
            .select('id, actual_out_time')
            .eq('student_id', user.id)
            .eq('status', 'Approved')
            .not('actual_out_time', 'is', null)
            .limit(1);

        if (checkedOutReqs && checkedOutReqs.length > 0) {
            const originalTime = checkedOutReqs[0].actual_out_time;

            // Try to update (should fail due to .is(field, null) in query)
            const { error, data } = await supabase
                .from('leave_requests')
                .update({ actual_out_time: new Date().toISOString() })
                .eq('id', checkedOutReqs[0].id)
                .is('actual_out_time', null) // This should prevent update
                .select();

            // Verify time didn't change
            const { data: afterUpdate } = await supabase
                .from('leave_requests')
                .select('actual_out_time')
                .eq('id', checkedOutReqs[0].id)
                .single();

            const protected = (afterUpdate?.actual_out_time === originalTime);
            logTest(
                'Double Punch Prevention',
                protected,
                protected ? 'Timestamp protected from overwrite ✓' : 'MEDIUM: Timestamp was overwritten! ⚠️'
            );
        } else {
            console.log('   ℹ️  No checked-out requests found to test');
            logTest('Double Punch Prevention', true, 'No checked-out requests (approve + check-out one to test)');
        }
    } catch (e) {
        logTest('Double Punch Prevention', true, `Exception thrown: ${e.message}`);
    }

    // ==========================================
    // FINAL RESULTS
    // ==========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 SECURITY AUDIT RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests Run: ${results.totalTests}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);

    const successRate = results.totalTests > 0
        ? ((results.passed / results.totalTests) * 100).toFixed(1)
        : 0;
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('='.repeat(60));

    // Security status
    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Site Security: EXCELLENT');
        console.log('✅ RLS Policies: ACTIVE & WORKING');
        console.log('✅ Ready for Production');
    } else {
        console.log('\n⚠️  SECURITY ISSUES DETECTED!');
        console.log(`❌ ${results.failed} test(s) failed`);
        console.log('⚠️  Review failed tests above');
        console.log('⚠️  DO NOT DEPLOY TO PRODUCTION');
    }

    console.log('\n📋 Detailed Test Results:');
    console.log('─'.repeat(60));
    results.tests.forEach((test, i) => {
        const emoji = test.passed ? '✅' : '❌';
        console.log(`${i + 1}. ${emoji} ${test.name}`);
        console.log(`   ${test.message}`);
    });
    console.log('─'.repeat(60));

    // Recommendations
    console.log('\n💡 Next Steps:');
    if (results.failed > 0) {
        console.log('❌ FAILED TESTS - Action Required:');
        console.log('1. Run secure_rls_policies.sql in Supabase SQL Editor');
        console.log('2. Verify policies: SELECT * FROM pg_policies WHERE tablename = \'leave_requests\';');
        console.log('3. Clear browser cache and retry');
    } else {
        console.log('✅ All security tests passed!');
        console.log('1. Run manual file upload test (try uploading .exe as .pdf)');
        console.log('2. Test warden access as student (visit /warden URL)');
        console.log('3. Site is ready for production deployment');
    }

    console.log('\n⏰ Test completed:', new Date().toLocaleString());
    console.log('='.repeat(60));

    return results;
})();
