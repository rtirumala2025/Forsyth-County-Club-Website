import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../config/firebase';

export type MembershipStatus = 'none' | 'pending' | 'active' | 'rejected';

export const useClubMembership = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Fetch all signatures for the current user
    const { data: signatures = [], isLoading } = useQuery({
        queryKey: ['user-signatures', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const { data, error } = await supabase
                .from('signatures')
                .select('*, id, club_id, user_id, status, created_at')
                .eq('user_id', user.id);

            if (error) throw error;
            return data || [];
        },
        enabled: !!user,
    });

    // Helper to get status for a specific club
    const getMembershipStatus = (clubId: string): MembershipStatus => {
        const sig = signatures.find((s) => s.club_id === clubId);
        if (!sig) return 'none';

        // Map database status to frontend status
        // status can be 'pending_parent', 'signed', 'active', etc.
        // For now, let's treat anything existing as 'pending' unless it's explicitly active/rejected?
        // Actually, the requirement is:
        // 'pending' -> 'pending_parent' or 'signed' (waiting for admin)
        // 'active' -> 'active'

        if (sig.status === 'active') return 'active';
        if (sig.status === 'rejected') return 'rejected';
        return 'pending';
    };

    // Join Club Mutation
    const joinClubMutation = useMutation({
        mutationFn: async ({ clubId, parentEmail }: { clubId: string; parentEmail: string }) => {
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('signatures')
                .insert({
                    user_id: user.id,
                    club_id: clubId,
                    parent_email: parentEmail,
                    status: 'pending_parent',
                })
                .select('id')
                .single();

            if (error) {
                // specific error handling for unique constraint?
                if (error.code === '23505') { // unique violation
                    // Fetch the existing signature ID to return it
                    const { data: existing } = await supabase
                        .from('signatures')
                        .select('id')
                        .eq('user_id', user.id)
                        .eq('club_id', clubId)
                        .single();
                    return { id: existing?.id }; // Return existing ID
                }
                throw error;
            }
            return data; // Returns { id: ... }
        },
        onSuccess: () => {
            // Invalidate query to refresh UI
            queryClient.invalidateQueries({ queryKey: ['user-signatures'] });
            queryClient.invalidateQueries({ queryKey: ['signatures'] });
        },
    });

    return {
        signatures,
        isLoading,
        getMembershipStatus,
        joinClub: joinClubMutation.mutateAsync,
        isJoining: joinClubMutation.isPending,
    };
};
