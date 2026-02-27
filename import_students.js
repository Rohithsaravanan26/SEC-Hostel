/**
 * SEC Hostel - Bulk Student Import Script
 * 
 * Reads the Excel database and creates Supabase auth users + profile rows.
 * 
 * Usage:
 *   1. Set environment variable: SUPABASE_SERVICE_ROLE_KEY=<your_key>
 *   2. Run: node import_students.js
 *   3. For dry-run (no writes): node import_students.js --dry-run
 * 
 * Prerequisites:
 *   - Run add_biometric_fields.sql in Supabase SQL Editor first
 *   - Run auto_user_sync_trigger.sql in Supabase SQL Editor first
 *   - npm install xlsx @supabase/supabase-js (already installed or install with --no-save)
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://gqgohwvjkasuglrxwrko.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EXCEL_FILE = path.join(__dirname, 'SEC Hostel 2025-2026 Data base (1).xlsx');
const DRY_RUN = process.argv.includes('--dry-run');
const EMAIL_DOMAIN = 'sec-hostel.local';

if (!SUPABASE_SERVICE_ROLE_KEY && !DRY_RUN) {
    console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
    console.error('   Set it with: $env:SUPABASE_SERVICE_ROLE_KEY="your_key_here"');
    console.error('   Find it in: Supabase Dashboard → Settings → API → service_role key');
    console.error('   Or run with --dry-run to test without writing.');
    process.exit(1);
}

// Create Supabase admin client
const supabase = DRY_RUN ? null : createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Excel Parsing ────────────────────────────────────────────────────

function parseExcel() {
    const wb = XLSX.readFile(EXCEL_FILE);
    const students = [];

    // Parse OVERALL BOYS sheet
    const boysSheet = wb.Sheets['OVERALL BOYS '];
    if (boysSheet) {
        const boysData = XLSX.utils.sheet_to_json(boysSheet, { header: 1 });
        console.log(`📊 OVERALL BOYS: ${boysData.length - 1} rows`);
        for (let i = 1; i < boysData.length; i++) {
            const row = boysData[i];
            if (!row || row.length < 6) continue;
            const student = extractStudent(row, 'boys');
            if (student) students.push(student);
        }
    }

    // Parse OVERALL GIRLS sheet
    const girlsSheet = wb.Sheets['OVERALL GIRLS '];
    if (girlsSheet) {
        const girlsData = XLSX.utils.sheet_to_json(girlsSheet, { header: 1 });
        console.log(`📊 OVERALL GIRLS: ${girlsData.length - 1} rows`);
        for (let i = 1; i < girlsData.length; i++) {
            const row = girlsData[i];
            if (!row || row.length < 6) continue;
            const student = extractStudent(row, 'girls');
            if (student) students.push(student);
        }
    }

    return students;
}

function extractStudent(row, gender) {
    // Columns: [0] room_no, [1] register_number, [2] student_name, [3] dept, 
    //           [4] year, [5] student_mobile, [6] parent_mobile, [7] bio_metric_number, [8] floor_incharge
    const roomNo = clean(row[0]);
    const registerNumber = clean(row[1]);
    const studentName = clean(row[2]);
    const dept = clean(row[3]);
    const year = clean(row[4]);
    const studentMobile = cleanPhone(row[5]);
    const parentMobile = cleanPhone(row[6]);
    const bioMetricNumber = clean(row[7]);
    const floorIncharge = gender === 'boys' ? clean(row[8]) : null;

    // Skip rows without essential data
    if (!studentName || !studentMobile || !bioMetricNumber) {
        return null;
    }

    return {
        room_number: roomNo,
        register_number: registerNumber,
        full_name: studentName,
        department: dept,
        year: year,
        student_mobile: studentMobile,
        parent_mobile: parentMobile,
        bio_metric_number: String(bioMetricNumber),
        floor_incharge: floorIncharge,
        gender: gender,
    };
}

function clean(val) {
    if (val === null || val === undefined) return null;
    const s = String(val).trim();
    return s === '' ? null : s;
}

function cleanPhone(val) {
    if (val === null || val === undefined) return null;
    // Take only the first phone number if multiple are provided (separated by comma)
    let s = String(val).trim().split(',')[0].trim().split('.')[0].trim();
    // Remove non-digit characters 
    s = s.replace(/\D/g, '');
    // If it starts with 91 and is 12 digits, remove country code
    if (s.length === 12 && s.startsWith('91')) {
        s = s.substring(2);
    }
    return s.length >= 10 ? s.substring(s.length - 10) : (s || null);
}

// ─── Import Logic ─────────────────────────────────────────────────────

async function importStudents() {
    console.log('\n🚀 SEC Hostel - Bulk Student Import');
    console.log(`   Mode: ${DRY_RUN ? '🔍 DRY RUN (no writes)' : '✏️  LIVE IMPORT'}`);
    console.log('─'.repeat(60));

    const students = parseExcel();
    console.log(`\n✅ Parsed ${students.length} valid student records from Excel`);

    if (DRY_RUN) {
        console.log('\n📋 Sample records (first 5):');
        students.slice(0, 5).forEach((s, i) => {
            console.log(`   ${i + 1}. ${s.full_name} | Mobile: ${s.student_mobile} | Bio: ${s.bio_metric_number} | Dept: ${s.department}`);
        });

        // Check for duplicate mobiles
        const mobileMap = new Map();
        students.forEach(s => {
            if (s.student_mobile) {
                const existing = mobileMap.get(s.student_mobile) || [];
                existing.push(s.full_name);
                mobileMap.set(s.student_mobile, existing);
            }
        });
        const dupes = [...mobileMap.entries()].filter(([_, names]) => names.length > 1);
        if (dupes.length > 0) {
            console.log(`\n⚠️  Found ${dupes.length} duplicate mobile numbers:`);
            dupes.slice(0, 10).forEach(([mobile, names]) => {
                console.log(`   📱 ${mobile}: ${names.join(', ')}`);
            });
            if (dupes.length > 10) console.log(`   ... and ${dupes.length - 10} more`);
        }

        console.log(`\n📊 Summary:`);
        console.log(`   Total students: ${students.length}`);
        console.log(`   Boys: ${students.filter(s => s.gender === 'boys').length}`);
        console.log(`   Girls: ${students.filter(s => s.gender === 'girls').length}`);
        console.log(`   Unique mobiles: ${mobileMap.size}`);
        console.log(`   Duplicate mobiles: ${dupes.length}`);
        console.log('\n✅ Dry run complete. Run without --dry-run to import.');
        return;
    }

    // ── Live Import ──
    let created = 0, skipped = 0, errors = 0;
    const seenMobiles = new Set();

    for (let i = 0; i < students.length; i++) {
        const s = students[i];
        const progress = `[${i + 1}/${students.length}]`;

        // Skip duplicate mobile numbers (keep first occurrence)
        if (seenMobiles.has(s.student_mobile)) {
            console.log(`${progress} ⏭️  Skipping duplicate mobile ${s.student_mobile}: ${s.full_name}`);
            skipped++;
            continue;
        }
        seenMobiles.add(s.student_mobile);

        const syntheticEmail = `${s.student_mobile}@${EMAIL_DOMAIN}`;

        try {
            // Create auth user
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email: syntheticEmail,
                password: s.bio_metric_number,
                email_confirm: true, // Auto-confirm so they can log in immediately
                user_metadata: {
                    full_name: s.full_name,
                    role: 'student',
                    register_number: s.register_number,
                    student_mobile: s.student_mobile,
                    parent_mobile: s.parent_mobile,
                    bio_metric_number: s.bio_metric_number,
                    department: s.department,
                    year: s.year,
                    floor_incharge: s.floor_incharge,
                    room_number: s.room_number,
                },
            });

            if (authError) {
                if (authError.message?.includes('already been registered') ||
                    authError.message?.includes('already exists')) {
                    console.log(`${progress} ⏭️  Already exists: ${s.full_name} (${s.student_mobile})`);
                    skipped++;
                } else {
                    console.error(`${progress} ❌ Auth error for ${s.full_name}: ${authError.message}`);
                    errors++;
                }
                continue;
            }

            // The trigger should auto-create the users row, but let's also upsert to be safe
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: authUser.user.id,
                    register_number: s.register_number,
                    full_name: s.full_name,
                    role: 'student',
                    room_number: s.room_number,
                    student_mobile: s.student_mobile,
                    parent_mobile: s.parent_mobile,
                    bio_metric_number: s.bio_metric_number,
                    department: s.department,
                    year: s.year,
                    floor_incharge: s.floor_incharge,
                    course: s.department, // Use department as course
                }, { onConflict: 'id' });

            if (profileError) {
                console.error(`${progress} ⚠️  Profile error for ${s.full_name}: ${profileError.message}`);
                // Don't count as full error since auth user was created
            }

            created++;
            if (created % 50 === 0 || created <= 5) {
                console.log(`${progress} ✅ Created: ${s.full_name} (${s.student_mobile})`);
            }

        } catch (err) {
            console.error(`${progress} ❌ Unexpected error for ${s.full_name}:`, err.message);
            errors++;
        }

        // Small delay to avoid rate limits
        if (i % 100 === 0 && i > 0) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log('\n' + '─'.repeat(60));
    console.log('📊 Import Complete!');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors:  ${errors}`);
    console.log(`   📱 Total processed: ${students.length}`);
}

// ─── Run ──────────────────────────────────────────────────────────────
importStudents().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
