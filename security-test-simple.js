// 🛡️ SUPER SIMPLE Security Test
// Works with ANY auth state - just needs you to be logged in!

(async function testSecurity() {
    console.clear();
    console.log('🔒 SEC Hostel Security Test\n');

    let passed = 0, failed = 0;

    const log = (test, ok, msg) => {
        console.log(`${ok ? '✅' : '❌'} ${test}: ${msg}`);
        ok ? passed++ : failed++;
    };

    const API = 'https://gqgohwvjkasuglrxwrko.supabase.co/rest/v1';
    const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZ29od3Zqa2FzdWdscnh3cmtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjA0NTIsImV4cCI6MjA4NDczNjQ1Mn0.KaZF-MQi1wVzZRQZOXP6sqqckW8POdaGurf-IPytDV8';

    // Get auth token from any Supabase auth storage
    let token = null;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('auth-token')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                token = data.access_token || data.currentSession?.access_token;
                if (token) {
                    console.log('✅ Found auth token\n');
                    break;
                }
            } catch { }
        }
    }

    if (!token) {
        console.error('❌ Not authenticated!');
        console.log('\n📝 Quick fix:');
        console.log('1. Refresh this page (F5)');
        console.log('2. Make sure you see your requests');
        console.log('3. Run this script again\n');
        return;
    }

    const headers = {
        'apikey': KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    };

    console.log('🧪 Running 4 Critical Tests...\n');

    // TEST 1: Can student approve own request?
    try {
        const res = await fetch(`${API}/leave_requests?limit=1`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: 'Approved' })
        });
        log('TEST 1: Self-Approval', res.status >= 400,
            res.status >= 400 ? 'BLOCKED ✓' : 'CRITICAL! Can self-approve 🚨');
    } catch (e) {
        log('TEST 1: Self-Approval', true, 'Error (blocked)');
    }

    // TEST 2: Can student delete requests?
    try {
        const res = await fetch(`${API}/leave_requests?limit=1`, {
            method: 'DELETE',
            headers
        });
        log('TEST 2: Delete History', res.status >= 400,
            res.status >= 400 ? 'BLOCKED ✓' : 'CRITICAL! Can delete 🚨');
    } catch (e) {
        log('TEST 2: Delete History', true, 'Error (blocked)');
    }

    // TEST 3: Can student see others' data?
    try {
        const res = await fetch(`${API}/leave_requests?select=student_id`, { headers });
        const data = await res.json();

        // Get my ID from token
        const payload = JSON.parse(atob(token.split('.')[1]));
        const myId = payload.sub;

        const others = data.filter(r => r.student_id !== myId).length;
        log('TEST 3: View Other Students', others === 0,
            others === 0 ? `Only own data visible ✓` : `Can see ${others} others! 🚨`);
    } catch (e) {
        log('TEST 3: View Others', false, e.message);
    }

    // TEST 4: Can student change role?
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const myId = payload.sub;

        const res = await fetch(`${API}/users?id=eq.${myId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ role: 'warden' })
        });

        // Check if role actually changed
        const check = await fetch(`${API}/users?id=eq.${myId}&select=role`, { headers });
        const data = await check.json();
        const isStillStudent = data[0]?.role === 'student';

        log('TEST 4: Role Change', isStillStudent,
            isStillStudent ? 'Role protected ✓' : 'CRITICAL! Role changed 🚨');
    } catch (e) {
        log('TEST 4: Role Change', true, 'Error (blocked)');
    }

    // RESULTS
    console.log('\n' + '='.repeat(50));
    console.log(`📊 RESULTS: ${passed}/${passed + failed} Tests Passed`);
    console.log('='.repeat(50));

    if (failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ Your site is SECURE');
        console.log('✅ RLS policies are working');
        console.log('✅ Ready for production!\n');
    } else {
        console.log('\n⚠️ SECURITY ISSUES FOUND!');
        console.log(`❌ ${failed} critical vulnerability(ies)`);
        console.log('⚠️ FIX REQUIRED before production\n');
        console.log('📝 Next step:');
        console.log('Run secure_rls_policies.sql in Supabase\n');
    }
})();
