import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertTriangle, FileSignature, Shield } from 'lucide-react';

interface SignatureDetails {
    id: string;
    status: string;
    parent_email: string;
    student_name: string; // Joined from profiles
    club_name: string;    // Joined from clubs
    created_at: string;
}

const ParentVerify = () => {
    const [searchParams] = useSearchParams();
    const signatureId = searchParams.get('id');

    const [details, setDetails] = useState<SignatureDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [signing, setSigning] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isAgreed, setIsAgreed] = useState(false);

    useEffect(() => {
        const fetchSignature = async () => {
            if (!signatureId) {
                setError('Invalid or missing permission slip ID.');
                setLoading(false);
                return;
            }

            try {
                // Fetch signature with joins
                // Note: deeply nested joins can be tricky in Supabase depending on foreign keys.
                // Assuming reliable FKs: signatures.user_id -> profiles.id, signatures.club_id -> clubs.id
                // profiles is keyed by id (auth.uid).

                // Define interface for the join query result
                interface SignatureJoinResult {
                    id: string;
                    status: string;
                    parent_email: string;
                    created_at: string;
                    profiles: { full_name: string } | { full_name: string }[] | null;
                    clubs: { name: string } | { name: string }[] | null;
                }

                const { data, error } = await supabase
                    .from('signatures')
                    .select(`
                        id,
                        status,
                        parent_email,
                        created_at,
                        profiles:user_id (full_name),
                        clubs:club_id (name)
                    `)
                    .eq('id', signatureId)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Permission slip not found.');

                const result = data as unknown as SignatureJoinResult;

                // Reshape data safely
                const studentName = Array.isArray(result.profiles)
                    ? result.profiles[0]?.full_name
                    : result.profiles?.full_name || 'Student';

                const clubName = Array.isArray(result.clubs)
                    ? result.clubs[0]?.name
                    : result.clubs?.name || 'Club';

                setDetails({
                    id: result.id,
                    status: result.status,
                    parent_email: result.parent_email,
                    student_name: studentName,
                    club_name: clubName,
                    created_at: result.created_at
                });

                if (result.status === 'approved' || result.status === 'active') {
                    setSuccess(true);
                }

            } catch (err: any) {
                console.error('Error fetching signature:', err);
                setError('We could not locate this permission slip. It may have been deleted or the link is invalid.');
            } finally {
                setLoading(false);
            }
        };

        fetchSignature();
    }, [signatureId]);

    const handleSign = async () => {
        if (!details || !isAgreed) return;
        setSigning(true);
        setError(null);

        try {
            const { error } = await supabase
                .from('signatures')
                .update({
                    status: 'approved',
                    signed_at: new Date().toISOString(),
                    // ip_address: '...' // Schema might not have this column yet, skipping for now unless error tells me otherwise.
                })
                .eq('id', details.id);

            if (error) throw error;

            setSuccess(true);
        } catch (err: any) {
            console.error('Error signing:', err);
            setError('Failed to record signature. Please try again.');
        } finally {
            setSigning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-lg w-full p-8 rounded-xl shadow-lg border border-red-100 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="font-serif text-2xl text-stone-900 mb-2">Document Unavailable</h1>
                    <p className="text-stone-600">{error}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-lg w-full p-10 rounded-xl shadow-xl border-t-8 border-green-600 text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-stone-900 mb-4">Permission Granted</h1>
                    <p className="text-lg text-stone-700 mb-8 leading-relaxed">
                        Thank you. Your permission for <strong>{details?.student_name}</strong> to join <strong>{details?.club_name}</strong> has been securely recorded.
                    </p>
                    <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-500">
                        Confirmation ID: <span className="font-mono text-stone-700">{details?.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 py-12 px-4 sm:px-6 lg:px-8 font-serif leading-relaxed">
            <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-none sm:rounded-sm border border-stone-200 overflow-hidden min-h-[800px] flex flex-col">
                {/* Header */}
                <div className="bg-stone-900 text-white p-8 text-center border-b-4 border-fcs-blue">
                    <div className="flex justify-center mb-4">
                        <Shield className="h-12 w-12 text-fcs-blue" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase">Forsyth County Schools</h1>
                    <p className="text-fcs-blue font-sans font-semibold mt-2 tracking-wider">Parental Permission Form</p>
                </div>

                {/* Content */}
                <div className="p-8 sm:p-12 flex-1 relative">
                    {/* Watermark/Bg Decoration */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                        <FileSignature strokeWidth={0.5} size={400} />
                    </div>

                    <div className="mb-8">
                        <p className="text-right text-stone-500 font-sans text-sm">
                            Date: {new Date(details?.created_at || '').toLocaleDateString()}
                        </p>
                    </div>

                    <div className="space-y-8 text-lg text-stone-800">
                        <p>
                            I, the undersigned parent/guardian, hereby grant permission for my student,
                            <span className="font-bold border-b-2 border-stone-800 px-2 mx-1 inline-block min-w-[150px] text-center bg-stone-50">
                                {details?.student_name}
                            </span>,
                            to participate in the
                            <span className="font-bold border-b-2 border-stone-800 px-2 mx-1 inline-block min-w-[150px] text-center bg-stone-50">
                                {details?.club_name}
                            </span>
                            activities.
                        </p>

                        <p>
                            By signing this document, I acknowledge that:
                        </p>

                        <ul className="list-disc pl-6 space-y-2 text-stone-700 text-base">
                            <li>I am the legal guardian of the student named above.</li>
                            <li>I have reviewed the club's purpose and activities.</li>
                            <li>I understand this permission is valid for the current academic year.</li>
                            <li>I authorize the faculty sponsor to supervise my student during club meetings.</li>
                        </ul>
                    </div>

                    <div className="mt-12 p-6 bg-stone-50 border border-stone-200 rounded-lg">
                        <h3 className="font-sans font-bold text-stone-900 mb-4 uppercase text-sm tracking-wide">
                            Digital Signature
                        </h3>

                        <div className="flex items-start gap-4 mb-6">
                            <div className="pt-1">
                                <input
                                    id="consent"
                                    type="checkbox"
                                    checked={isAgreed}
                                    onChange={(e) => setIsAgreed(e.target.checked)}
                                    className="h-5 w-5 text-fcs-blue border-stone-300 rounded focus:ring-fcs-blue cursor-pointer"
                                />
                            </div>
                            <label htmlFor="consent" className="text-base text-stone-800 cursor-pointer select-none">
                                I, <span className="font-semibold underline decoration-dotted">{details?.parent_email}</span>, accept these terms and electronically sign this permission slip.
                            </label>
                        </div>

                        <button
                            onClick={handleSign}
                            disabled={!isAgreed || signing}
                            className={`w-full sm:w-auto px-8 py-3 rounded-md font-sans font-bold text-white shadow-md transition-all
                                ${isAgreed && !signing
                                    ? 'bg-green-700 hover:bg-green-800 shadow-lg transform hover:-translate-y-0.5'
                                    : 'bg-stone-400 cursor-not-allowed opacity-70'}`}
                        >
                            {signing ? 'Signing...' : 'Sign & Approve'}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-stone-50 p-6 text-center text-xs text-stone-400 font-sans border-t border-stone-200">
                    <p>&copy; {new Date().getFullYear()} Forsyth County Schools. All rights reserved.</p>
                    <p className="mt-1">Official Document ID: {details?.id}</p>
                </div>
            </div>
        </div>
    );
};

export default ParentVerify;
