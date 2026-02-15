/**
 * useSupabaseClubs — React Query hooks for fetching club data from Supabase
 *
 * Fetches from the `school_clubs` junction table with joined
 * `clubs` and `schools` data. These hooks can be used alongside
 * the existing useClubs.ts hooks during the migration period.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
export interface ClubRecord {
    id: string;
    meeting_details: string | null;
    sponsor_name: string | null;
    application_required: boolean;
    club: {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        category: string | null;
    };
    school: {
        id: string;
        name: string;
    };
}

export interface SchoolWithClubs {
    school: string;
    clubs: ClubRecord[];
}

// ----------------------------------------------------------------
// Query function
// ----------------------------------------------------------------
async function fetchClubsFromSupabase(): Promise<ClubRecord[]> {
    const { data, error } = await supabase
        .from('school_clubs')
        .select(`
      id,
      meeting_details,
      sponsor_name,
      application_required,
      club:clubs ( id, name, slug, description, category ),
      school:schools ( id, name )
    `)
        .order('id');

    if (error) {
        throw new Error(`Supabase fetch failed: ${error.message}`);
    }

    return (data ?? []) as unknown as ClubRecord[];
}

// ----------------------------------------------------------------
// Hook: useSupabaseClubs
// ----------------------------------------------------------------
/**
 * Returns all school–club records with joined club + school data.
 *
 * @example
 * const { data: clubs, isLoading, error } = useSupabaseClubs();
 */
export function useSupabaseClubs() {
    return useQuery<ClubRecord[], Error>({
        queryKey: ['supabase-clubs'],
        queryFn: fetchClubsFromSupabase,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 2,
    });
}

// ----------------------------------------------------------------
// Hook: useSupabaseClubsBySchool
// ----------------------------------------------------------------
/**
 * Groups club records by school name for easy rendering.
 *
 * @example
 * const { data: grouped, isLoading } = useSupabaseClubsBySchool();
 * // grouped = [{ school: "West Forsyth High School", clubs: [...] }, ...]
 */
export function useSupabaseClubsBySchool() {
    return useQuery<SchoolWithClubs[], Error>({
        queryKey: ['supabase-clubs', 'bySchool'],
        queryFn: async () => {
            const clubs = await fetchClubsFromSupabase();

            const grouped = new Map<string, ClubRecord[]>();
            for (const record of clubs) {
                const schoolName = record.school?.name ?? 'Unknown';
                if (!grouped.has(schoolName)) {
                    grouped.set(schoolName, []);
                }
                grouped.get(schoolName)!.push(record);
            }

            return Array.from(grouped.entries()).map(([school, clubList]) => ({
                school,
                clubs: clubList,
            }));
        },
        staleTime: 5 * 60 * 1000,
        retry: 2,
    });
}
