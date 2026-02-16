import React, { useState } from 'react';
import { X, Copy, Check, FileText, ArrowRight } from 'lucide-react';

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
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const permissionLink = `${window.location.origin}/parent-verify?id=${signatureId}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(permissionLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
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
                        <FileText className="h-5 w-5 text-fcs-blue" />
                        <h3 className="font-bold font-serif text-lg">Permission Slip Generated</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-stone-400 hover:text-stone-600 transition-colors bg-white rounded-full p-1 hover:bg-stone-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* content */}
                <div className="p-6 space-y-6">
                    <p className="text-stone-600 leading-relaxed text-sm">
                        To finalize your membership, your parent or guardian must sign the digital permission slip. Please share this secure link with them:
                    </p>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                            Shareable Link
                        </label>
                        <div className="flex shadow-sm rounded-md">
                            <input
                                type="text"
                                readOnly
                                value={permissionLink}
                                className="flex-1 block w-full rounded-l-md border-stone-300 bg-stone-50 text-stone-600 text-sm focus:border-fcs-blue focus:ring-fcs-blue px-3 py-2 border-r-0"
                                onClick={(e) => e.currentTarget.select()}
                            />
                            <button
                                onClick={handleCopy}
                                className={`inline-flex items-center px-4 py-2 border border-l-0 border-stone-300 rounded-r-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fcs-blue w-[100px] justify-center transition-all duration-200
                  ${copied
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-white text-stone-700 hover:bg-stone-50'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <Check size={16} className="mr-2" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy size={16} className="mr-2" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start space-x-3">
                        <div className="bg-blue-100 rounded-full p-1 mt-0.5 shrink-0">
                            <ArrowRight size={14} className="text-blue-600" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">What happens next?</h4>
                            <p className="text-xs text-blue-700 mt-1">
                                Once signed, the club sponsor will review your application. You can check your status on your dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-bold hover:bg-stone-900 transition-colors shadow-sm"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
