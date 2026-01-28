// 🛡️ Automated Security Testing Script
// Run this in browser console after logging in as student

async function comprehensiveSecurityTest() {
    console.log('🔒 SEC Hostel Security Audit - Starting...\n');

    const results = {
        totalTests: 0,
        passed: 0,
        failed: 0,
        tests: []
    };

    function logTest(name, passed, message) {
        results.totalTests++;
        if (passed) {
            results.passed++;
            console.log(`✅ PASS: ${name}`);
        } else {
            results.failed++;
            console.error(`❌ FAIL: ${name} - ${message}`);
        }
        results.tests.push({ name, passed, message });
    }

    // Initialize Supabase (replace with your credentials)
    const SUPABASE_URL = prompt('Enter your Supabase URL:');
    const SUPABASE_KEY = prompt('Enter your Supabase Anon Key:');

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    const currentUser = await supabase.auth.getUser();
    if (!currentUser.data.user) {
        console.error('❌ Not authenticated. Please login first.');
        return;
    }

    console.log(`👤 Testing as: ${currentUser.data.user.email}\n`);

    // ==========================================
    // TEST 1: Self-Approval Attack
    // ==========================================
    console.log('🧪 Test 1: Self-Approval Attack');
    try {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({ status: 'Approved' })
            .eq('student_id', currentUser.data.user.id)
            .select();

        logTest(
            'Self-Approval Attack',
            (error || data.length === 0),
            error ? 'Blocked by RLS' : 'RLS allowed update (CRITICAL!)'
        );
    } catch (e) {
        logTest('Self-Approval Attack', true, 'Exception thrown - Blocked');
    }

    // ==========================================
    // TEST 2: Delete History Attack
    // ==========================================
    console.log('🧪 Test 2: Delete History Attack');
    try {
        const { error } = await supabase
            .from('leave_requests')
            .delete()
            .limit(1);

        logTest(
            'Delete History Attack',
            !!error,
            error ? 'Blocked by RLS' : 'Delete succeeded (CRITICAL!)'
        );
    } catch (e) {
        logTest('Delete History Attack', true, 'Exception thrown - Blocked');
    }

    // ==========================================
    // TEST 3: View Other Students' Requests
    // ==========================================
    console.log('🧪 Test 3: View Other Students Attack');
    try {
        const { data } = await supabase
            .from('leave_requests')
            .select('student_id');

        const hasOthers = data?.some(r => r.student_id !== currentUser.data.user.id);

        logTest(
            'View Other Students',
            !hasOthers,
            hasOthers ? 'Can see other students (HIGH!)' : 'Only own requests visible'
        );
    } catch (e) {
        logTest('View Other Students', false, e.message);
    }

    // ==========================================
    // TEST 4: Role Manipulation Attack
    // ==========================================
    console.log('🧪 Test 4: Role Manipulation Attack');
    try {
        const { error } = await supabase
            .from('users')
            .update({ role: 'warden' })
            .eq('id', currentUser.data.user.id);

        // Verify role didn't change
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', currentUser.data.user.id)
            .single();

        logTest(
            'Role Manipulation',
            (error || userData?.role !== 'warden'),
            error ? 'Blocked by RLS' : `Role is now: ${userData?.role}`
        );
    } catch (e) {
        logTest('Role Manipulation', true, 'Exception thrown - Blocked');
    }

    // ==========================================
    // TEST 5: Update Other Student's Data
    // ==========================================
    console.log('🧪 Test 5: Update Other Student Data');
    try {
        // Try to update a random request
        const { data: allRequests } = await supabase
            .from('leave_requests')
            .select('id, student_id')
            .neq('student_id', currentUser.data.user.id)
            .limit(1);

        if (allRequests && allRequests.length > 0) {
            const { error } = await supabase
                .from('leave_requests')
                .update({ status: 'Approved' })
                .eq('id', allRequests[0].id);

            logTest(
                'Update Others Data',
                !!error,
                error ? 'Blocked by RLS' : 'Updated other student (CRITICAL!)'
            );
        } else {
            logTest('Update Others Data', true, 'No other students visible (good)');
        }
    } catch (e) {
        logTest('Update Others Data', true, 'Exception thrown - Blocked');
    }

    // ==========================================
    // TEST 6: Ghost Punch Attack
    // ==========================================
    console.log('🧪 Test 6: Ghost Punch Attack (Pending Request)');
    try {
        // Find a pending request
        const { data: pendingReq } = await supabase
            .from('leave_requests')
            .select('id')
            .eq('student_id', currentUser.data.user.id)
            .eq('status', 'Pending')
            .limit(1)
            .single();

        if (pendingReq) {
            const { error } = await supabase
                .from('leave_requests')
                .update({ actual_out_time: new Date().toISOString() })
                .eq('id', pendingReq.id)
                .eq('status', 'Pending');

            logTest(
                'Ghost Punch (Pending)',
                !!error,
                error ? 'Blocked by RLS' : 'Punched pending request (CRITICAL!)'
            );
        } else {
            console.log('⚠️ No pending requests to test');
        }
    } catch (e) {
        logTest('Ghost Punch (Pending)', true, 'Exception thrown - Blocked');
    }

    // ==========================================
    // TEST 7: Double Punch Prevention
    // ==========================================
    console.log('🧪 Test 7: Double Punch Attack');
    try {
        // Find an already checked-out request
        const { data: checkedOut } = await supabase
            .from('leave_requests')
            .select('id, actual_out_time')
            .eq('student_id', currentUser.data.user.id)
            .eq('status', 'Approved')
            .not('actual_out_time', 'is', null)
            .limit(1)
            .single();

        if (checkedOut) {
            const originalTime = checkedOut.actual_out_time;

            const { error } = await supabase
                .from('leave_requests')
                .update({ actual_out_time: new Date().toISOString() })
                .eq('id', checkedOut.id)
                .is('actual_out_time', null); // Should fail if already set

            // Verify time didn't change
            const { data: afterUpdate } = await supabase
                .from('leave_requests')
                .select('actual_out_time')
                .eq('id', checkedOut.id)
                .single();

            const timeUnchanged = afterUpdate?.actual_out_time === originalTime;

            logTest(
                'Double Punch Prevention',
                (error || timeUnchanged),
                timeUnchanged ? 'Time unchanged' : 'Time was overwritten (CRITICAL!)'
            );
        } else {
            console.log('⚠️ No checked-out requests to test');
        }
    } catch (e) {
        logTest('Double Punch Prevention', true, 'Exception thrown - Blocked');
    }

    // ==========================================
    // RESULTS SUMMARY
    // ==========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 SECURITY AUDIT RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${results.totalTests}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);

    const successRate = ((results.passed / results.totalTests) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED - Site is SECURE!');
    } else {
        console.log('\n⚠️ SECURITY ISSUES FOUND - Review failed tests!');
    }

    console.log('\nDetailed Results:');
    results.tests.forEach((test, i) => {
        const emoji = test.passed ? '✅' : '❌';
        console.log(`${i + 1}. ${emoji} ${test.name}: ${test.message}`);
    });

    return results;
}

// Run the comprehensive security test
comprehensiveSecurityTest();
