/**
 * Supabase Data Migration Script
 * 
 * Parses hardcoded club data from clubData.ts, deduplicates,
 * and upserts into Supabase tables: schools, clubs, school_clubs.
 *
 * Usage: npm run data:migrate
 */

import 'dotenv/config';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');

// -------------------------------------------------------------------
// Env Setup
// -------------------------------------------------------------------
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------
interface ClubEntry {
    id: string;
    name: string;
    description: string;
    sponsor: string;
    category: string;
    meetingFrequency: string;
    meetingDay: string;
    requirements: string;
    activities: string[];
    commitment: string;
    benefits: string[];
}

interface SchoolEntry {
    school: string;
    clubs: ClubEntry[];
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/** Batch an array into chunks of `size` */
function chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
    }
    return chunks;
}

/** Small delay to respect rate limits */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// -------------------------------------------------------------------
// Main Migration
// -------------------------------------------------------------------
async function migrate() {
    // Dynamically import the club data (ESM-compatible)
    const { allClubData } = await import('../src/shared/data/clubData') as { allClubData: SchoolEntry[] };

    console.log(`\n📦 Loaded ${allClubData.length} schools from clubData.ts\n`);

    // ---------------------------------------------------------------
    // STEP A: Extract & upsert unique schools
    // ---------------------------------------------------------------
    const schoolNames = Array.from(new Set(allClubData.map(s => s.school)));
    const schoolMap = new Map<string, string>(); // name -> uuid

    console.log(`🏫 Migrating ${schoolNames.length} schools...`);

    const schoolRows = schoolNames.map(name => ({ name }));

    for (const batch of chunk(schoolRows, 50)) {
        const { data, error } = await supabase
            .from('schools')
            .upsert(batch, { onConflict: 'name' })
            .select('id, name');

        if (error) {
            console.error(`❌ Failed to upsert schools batch:`, error.message);
            continue;
        }

        for (const row of data ?? []) {
            schoolMap.set(row.name, row.id);
            console.log(`  ✅ School: ${row.name}`);
        }

        await sleep(200);
    }

    // ---------------------------------------------------------------
    // STEP B: Extract & upsert unique clubs (deduplicated by name)
    // ---------------------------------------------------------------
    const clubRegistry = new Map<string, { name: string; slug: string; description: string; category: string }>();

    for (const school of allClubData) {
        for (const club of school.clubs) {
            const normalizedName = club.name.trim();
            if (!clubRegistry.has(normalizedName)) {
                clubRegistry.set(normalizedName, {
                    name: normalizedName,
                    slug: slugify(normalizedName),
                    description: club.description,
                    category: club.category,
                });
            }
        }
    }

    const clubRows = Array.from(clubRegistry.values());
    const clubMap = new Map<string, string>(); // name -> uuid

    console.log(`\n🎯 Migrating ${clubRows.length} unique clubs...`);

    for (const batch of chunk(clubRows, 50)) {
        const { data, error } = await supabase
            .from('clubs')
            .upsert(batch, { onConflict: 'slug' })
            .select('id, name');

        if (error) {
            console.error(`❌ Failed to upsert clubs batch:`, error.message);
            continue;
        }

        for (const row of data ?? []) {
            clubMap.set(row.name, row.id);
        }

        console.log(`  ✅ Batch of ${batch.length} clubs upserted`);
        await sleep(200);
    }

    console.log(`  📊 Total unique clubs: ${clubMap.size}`);

    // ---------------------------------------------------------------
    // STEP C: Build & upsert school_clubs junction rows
    // ---------------------------------------------------------------
    console.log(`\n🔗 Migrating school–club junction rows...`);

    const junctionRows: {
        school_id: string;
        club_id: string;
        meeting_details: string;
        sponsor_name: string;
        application_required: boolean;
    }[] = [];

    for (const school of allClubData) {
        const schoolId = schoolMap.get(school.school);
        if (!schoolId) {
            console.warn(`  ⚠️  No school ID found for "${school.school}", skipping`);
            continue;
        }

        for (const club of school.clubs) {
            const clubId = clubMap.get(club.name.trim());
            if (!clubId) {
                console.warn(`  ⚠️  No club ID found for "${club.name}", skipping`);
                continue;
            }

            // Build meeting details string from available fields
            const meetingParts: string[] = [];
            if (club.meetingFrequency) meetingParts.push(club.meetingFrequency);
            if (club.meetingDay) meetingParts.push(club.meetingDay);
            const meetingDetails = meetingParts.join(' — ') || null;

            // Detect if application/tryout required from the requirements text
            const requiresApp = /tryout|audition|application|gpa|nomination/i.test(
                club.requirements || ''
            );

            junctionRows.push({
                school_id: schoolId,
                club_id: clubId,
                meeting_details: meetingDetails ?? '',
                sponsor_name: club.sponsor || '',
                application_required: requiresApp,
            });
        }
    }

    console.log(`  📊 Total junction rows to insert: ${junctionRows.length}`);

    let successCount = 0;
    let errorCount = 0;

    for (const batch of chunk(junctionRows, 50)) {
        const { error } = await supabase
            .from('school_clubs')
            .upsert(batch, { onConflict: 'school_id,club_id' });

        if (error) {
            console.error(`  ❌ Junction batch error:`, error.message);
            errorCount += batch.length;
        } else {
            successCount += batch.length;
        }

        await sleep(200);
    }

    // ---------------------------------------------------------------
    // Summary
    // ---------------------------------------------------------------
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`✅ Migration complete!`);
    console.log(`   🏫 Schools:       ${schoolMap.size}`);
    console.log(`   🎯 Clubs:         ${clubMap.size}`);
    console.log(`   🔗 Junctions:     ${successCount} inserted, ${errorCount} failed`);
    console.log(`${'═'.repeat(50)}\n`);
}

// Run
migrate().catch(err => {
    console.error('💥 Migration failed:', err);
    process.exit(1);
});
