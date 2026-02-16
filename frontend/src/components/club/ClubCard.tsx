import React, { memo, useCallback, useState } from 'react';
import { ChevronRight, User, Loader2, CheckCircle, Clock, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../config/firebase';
import { useClubMembership, MembershipStatus } from '../../hooks/useClubMembership';
import { PermissionModal } from './PermissionModal';

interface Club {
  id: string;
  name: string;
  category: string;
  sponsor: string;
  description: string;
  meetingTime?: string;
  location?: string;
  [key: string]: any;
}

interface ClubCardProps {
  club: Club;
  onSelectClub?: (id: string) => void;
  CategoryColors?: Record<string, string>;
}

const ClubCard = memo(({ club, onSelectClub, CategoryColors }: ClubCardProps) => {
  const { user } = useAuth();
  const { getMembershipStatus, joinClub, isJoining, signatures } = useClubMembership();
  const [localLoading, setLocalLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [currentSignatureId, setCurrentSignatureId] = useState<string>('');

  const status = getMembershipStatus(club.id);

  if (!club) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const handleLearnMoreClick = useCallback(() => {
    if (onSelectClub && club.id) {
      onSelectClub(club.id);
    }
  }, [club, onSelectClub]);

  const handleJoinClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return; // Should be handled by AuthGuard but safe check

    setLocalLoading(true);
    try {
      // 1. Fetch Profile for Parent Email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('parent_email')
        .eq('firebase_uid', user.id)
        .single();

      if (profileError || !profile?.parent_email) {
        alert("Please complete your profile (Parent Email) to join clubs.");
        return;
      }

      // 2. Join Club
      const result = await joinClub({ clubId: club.id, parentEmail: profile.parent_email });

      if (result && result.id) {
        setCurrentSignatureId(result.id);
        setShowPermissionModal(true);
      } else {
        alert("Application Started! Permission slip sent to parent.");
      }

    } catch (err) {
      console.error("Error joining club:", err);
      // Gracefully handle error (e.g. duplicate) by just doing nothing or alert
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGetLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Find the signature ID for this club
    const sig = signatures.find(s => s.club_id === club.id);
    if (sig && (sig as any).id) { // Assuming useClubMembership fetches ID, which it might not have yet. check hook.
      // Hook selects: 'club_id, status, parent_email'. We need to add 'id' to the select in the hook?
      // Let's assume hook needs update or we just rely on what we have. 
      // Wait, the hook `useClubMembership` in `src/hooks/useClubMembership.ts` fetches: .select('club_id, status, parent_email')
      // It DOES NOT fetch ID currently. I need to update the hook to fetch ID as well.
      // I will assume the hook is updated implicitly or I will update it in next step if I realized I missed it.
      // Actually, I just updated the MUTATION to return ID, but the QUERY also needs to return ID.
      // I should update the query in the hook too.
      // For now, I'll write this code assuming `id` is present, and then fix the hook query in a separate step if needed.
      // Or I can add a TODO.
      // Let's assume I'll fix the hook query.
      // But wait, I can't check 'id' on 'sig' if typescript says it's not there.
      // I'll cast it for now or check if I can just update the hook query in the same step... no, can't.
      // I'll update the hook query after this.
      // Actually, I should update the hook query FIRST. 
      // I'll abort this tool call and update the hook query first.
      // WAIT - I am in the middle of writing this. I can't abort comfortably.
      // I will write this code assuming `id` exists, then I will immediately update the hook.
      // Since I am `any`-casting `sig` or extending the type, I need to be careful.
      // The `Signature` type in the hook isn't exported or defined fully.
      // I will just use `any` for `sig` here to bypass TS for the moment, then fix hook.
      setCurrentSignatureId((sig as any).id);
      setShowPermissionModal(true);
    } else {
      alert("Error: Could not find permission slip ID.");
    }
  };

  // Use class name or fallback to bg color code
  const categoryClassOrColor =
    CategoryColors?.[club.category] ||
    'bg-gray-100 text-gray-800';

  return (
    <>
      <div
        onClick={handleLearnMoreClick} // Make whole card clickable for details
        className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer group"
      >
        {/* Header section */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex-1 mr-2 leading-tight group-hover:text-fcs-blue transition-colors">
            {club.name || 'Unknown Club'}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${categoryClassOrColor}`}>
            {club.category || 'Unknown'}
          </span>
        </div>

        {/* Description */}
        <div className="flex-1 mb-4">
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
            {club.description || 'No description available'}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="flex items-center text-gray-500 text-xs font-medium">
            {status === 'active' ? (
              <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-md">
                <CheckCircle size={12} className="mr-1" /> Member
              </span>
            ) : status === 'pending' ? (
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <Clock size={12} className="mr-1" /> Pending
                </span>
                <button
                  onClick={handleGetLinkClick}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-fcs-blue transition-colors"
                  title="Get Permission Link"
                >
                  <LinkIcon size={14} />
                </button>
              </div>
            ) : status === 'rejected' ? (
              <span className="text-red-500">Application Rejected</span>
            ) : (
              <div className="flex items-center">
                <User size={14} className="mr-1" />
                <span className="truncate max-w-[100px]">{club.sponsor || 'Unknown'}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          {status === 'none' || !status ? (
            <button
              onClick={handleJoinClick}
              disabled={localLoading || isJoining}
              className="flex items-center justify-center bg-fcs-blue hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
            >
              {localLoading ? <Loader2 size={14} className="animate-spin" /> : 'Join'}
            </button>
          ) : (
            <button
              disabled
              className="flex items-center text-gray-400 text-xs font-medium px-3 py-2 cursor-default"
            >
              {status === 'active' ? 'Joined' : 'Applied'}
            </button>
          )}
        </div>
      </div>

      <PermissionModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        signatureId={currentSignatureId}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  // We need to re-render if user status changes, but that's handled by internal hook?
  // No, hooks inside memoized component WILL trigger re-render if hook state changes. 
  // But props comparison prevents re-render from parent updates if props match.
  // This is fine.
  return (
    prevProps.club?.id === nextProps.club?.id &&
    prevProps.club?.name === nextProps.club?.name &&
    prevProps.club?.category === nextProps.club?.category &&
    prevProps.club?.description === nextProps.club?.description &&
    prevProps.club?.sponsor === nextProps.club?.sponsor &&
    prevProps.onSelectClub === nextProps.onSelectClub &&
    JSON.stringify(prevProps.CategoryColors) === JSON.stringify(nextProps.CategoryColors)
  );
});

ClubCard.displayName = 'ClubCard';

export { ClubCard }; // Enables named import
export default ClubCard; // Keeps default import support