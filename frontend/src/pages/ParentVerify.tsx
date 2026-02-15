import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    ShieldCheck,
    User,
    BookOpen,
    School,
    Calendar,
    CheckCircle,
    Loader2,
    AlertTriangle,
    FileSignature,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignatureRow {
    id: string;
    student_name: string;
    club_name: string;
    school_name: string;
    status: string;
    parent_ip: string | null;
    parent_signed_at: string | null;
    created_at: string;
}

const ParentVerify = () => {
    const { signatureId } = useParams<{ signatureId: string }>();

    const [signature, setSignature] = useState<SignatureRow | null>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [signed, setSigned] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!signatureId) return;

        const fetchSignature = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('signatures')
                    .select('*')
                    .eq('id', signatureId)
                    .maybeSingle();

                if (fetchError) throw fetchError;
                if (!data) {
                    setError('This verification link is invalid or has expired.');
                    return;
                }

                setSignature(data as SignatureRow);

                if (data.status === 'APPROVED') {
                    setSigned(true);
                }
            } catch (err: any) {
                console.error('Error fetching signature:', err);
                setError('Unable to load verification details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSignature();
    }, [signatureId]);

    const handleSign = async () => {
        if (!signatureId || !signature) return;
        setSigning(true);
        setError(null);

        try {
            // Capture parent IP address
            let parentIp = 'unknown';
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                parentIp = ipData.ip;
            } catch {
                // Fallback if IP service is unavailable
                parentIp = 'unavailable';
            }

            const { error: updateError } = await supabase
                .from('signatures')
                .update({
                    status: 'APPROVED',
                    parent_ip: parentIp,
                    parent_signed_at: new Date().toISOString(),
                })
                .eq('id', signatureId);

            if (updateError) throw updateError;

            setSigned(true);
            setSignature((prev) =>
                prev ? { ...prev, status: 'APPROVED', parent_ip: parentIp, parent_signed_at: new Date().toISOString() } : prev
            );
        } catch (err: any) {
            console.error('Error signing:', err);
            setError('Failed to submit signature. Please try again.');
        } finally {
            setSigning(false);
        }
    };

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return iso;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600">Loading verification…</p>
                </div>
            </div>
        );
    }

    if (error && !signature) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!signature) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 py-10 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileSignature className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Verification</h1>
                    <p className="text-gray-600">
                        Please review and approve your student's club membership application.
                    </p>
                </div>

                {/* Details Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                        <h2 className="text-xl font-bold mb-1">Club Membership Request</h2>
                        <p className="text-blue-200 text-sm">Submitted {formatDate(signature.created_at)}</p>
                    </div>

                    <div className="p-6 space-y-5">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Student</p>
                                <p className="text-gray-900 font-semibold">{signature.student_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <BookOpen size={20} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Club</p>
                                <p className="text-gray-900 font-semibold">{signature.club_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <School size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">School</p>
                                <p className="text-gray-900 font-semibold">{signature.school_name}</p>
                            </div>
                        </div>

                        {/* Status */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className={`w-10 h-10 ${signed ? 'bg-green-100' : 'bg-yellow-100'} rounded-lg flex items-center justify-center`}>
                                {signed ? (
                                    <CheckCircle size={20} className="text-green-600" />
                                ) : (
                                    <Calendar size={20} className="text-yellow-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</p>
                                <span
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${signed
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                >
                                    {signed ? '✓ Approved' : '⏳ Pending Parent Signature'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error banner */}
                {error && (
                    <div className="flex items-center gap-3 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <AlertTriangle size={18} />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

                {/* Action */}
                {signed ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                        <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                        <h3 className="text-lg font-bold text-green-800 mb-1">
                            Application Approved!
                        </h3>
                        <p className="text-green-700 text-sm">
                            Your signature has been recorded. The school administrator has been notified.
                        </p>
                        {signature.parent_signed_at && (
                            <p className="text-green-600 text-xs mt-2">
                                Signed on {formatDate(signature.parent_signed_at)}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-gray-500 text-center">
                            By clicking "Sign & Approve," you confirm that you authorize your student to participate in this club.
                            Your IP address and timestamp will be recorded for audit purposes.
                        </p>
                        <button
                            onClick={handleSign}
                            disabled={signing}
                            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                        >
                            {signing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Signing…
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={20} />
                                    Sign & Approve
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentVerify;
