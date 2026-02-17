import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../config/firebase';

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    signatureId: string;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
    isOpen,
    onClose,
    signatureId
}) => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!email) return;
        setError(null);

        // 1. Validate Email Format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        // 2. Anti-fraud: Check against current user
        if (user?.email && email.toLowerCase() === user.email.toLowerCase()) {
            setError("You cannot send the slip to yourself.");
            return;
        }

        // 3. Anti-fraud: Check name overlap
        const fullName = user?.user_metadata?.full_name || '';
        if (fullName) {
            const nameParts = fullName.toLowerCase().split(' ').filter((p: string) => p.length > 2);
            const emailLower = email.toLowerCase();
            const hasNameMatch = nameParts.some((part: string) => emailLower.includes(part));

            if (hasNameMatch) {
                setError("Please enter your parent's email, not your own.");
                return;
            }
        }

        setSending(true);

        // Simulate API call
        setTimeout(() => {
            const link = `${window.location.origin}/parent-verify?id=${signatureId}`;
            console.log("PARENT LINK (HIDDEN):", link);

            setSuccess(true);
            setSending(false);
            // In a real app with toast library: toast.success(`Link sent to ${email}`);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border-t-4 border-fcs-blue"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-stone-50 px-6 py-4 border-b border-stone-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-stone-800">
                        <ShieldCheck className="h-5 w-5 text-fcs-blue" />
                        <h3 className="font-bold font-serif text-lg">Parent Permission</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition-colors bg-white rounded-full p-1 hover:bg-stone-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {!success ? (
                        <>
                            <p className="text-stone-600 leading-relaxed text-sm">
                                To finalize your membership, we need to send a digital permission slip to your parent or guardian. Please enter their email below.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                                        Parent/Guardian Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setError(null);
                                            }}
                                            placeholder="parent@example.com"
                                            className={`block w-full pl-9 pr-3 py-2.5 border rounded-md text-sm focus:ring-2 focus:ring-fcs-blue focus:border-fcs-blue outline-none transition-all ${error ? 'border-red-300 bg-red-50 text-red-900 placeholder:text-red-300' : 'border-stone-300 bg-white text-stone-900 placeholder:text-stone-400'
                                                }`}
                                        />
                                    </div>
                                    {error && (
                                        <div className="flex items-center gap-1.5 mt-2 text-red-600 text-xs font-medium animate-in slide-in-from-top-1">
                                            <AlertTriangle size={12} />
                                            {error}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleSend}
                                    disabled={sending || !email}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-fcs-blue text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Sending Verification...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Send Permission Slip
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-stone-900 mb-2">Email Sent!</h3>
                            <p className="text-sm text-stone-600 mb-4">
                                We've sent a secure link to <span className="font-semibold text-stone-800">{email}</span>.
                            </p>
                            <p className="text-xs text-stone-400">
                                Ask them to check their inbox to approve your membership.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg text-sm font-semibold hover:bg-stone-50 hover:text-stone-900 transition-colors"
                    >
                        {success ? 'Close' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    );
};
