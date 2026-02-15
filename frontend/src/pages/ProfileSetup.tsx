import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    GraduationCap,
    Mail,
    Phone,
    Shield,
    CheckCircle,
    ArrowLeft,
    Loader2,
    AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../config/firebase';
import { supabase } from '../lib/supabase';

interface ProfileData {
    full_name: string;
    grade: string;
    student_id: string;
    parent_email: string;
    emergency_contact: string;
}

const GRADES = ['9', '10', '11', '12'];

const ProfileSetup = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState<ProfileData>({
        full_name: '',
        grade: '',
        student_id: '',
        parent_email: '',
        emergency_contact: '',
    });

    const [saving, setSaving] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [existingProfileId, setExistingProfileId] = useState<string | null>(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login', { replace: true });
        }
    }, [user, authLoading, navigate]);

    // Load existing profile
    useEffect(() => {
        if (!user) return;

        const loadProfile = async () => {
            try {
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('firebase_uid', user.id)
                    .maybeSingle();

                if (fetchError) throw fetchError;

                if (data) {
                    setExistingProfileId(data.id);
                    setForm({
                        full_name: data.full_name || '',
                        grade: data.grade || '',
                        student_id: data.student_id || '',
                        parent_email: data.parent_email || '',
                        emergency_contact: data.emergency_contact || '',
                    });
                }
            } catch (err: any) {
                console.error('Error loading profile:', err);
            } finally {
                setLoadingProfile(false);
            }
        };

        loadProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError(null);
    };

    const validate = (): string | null => {
        if (!form.full_name.trim()) return 'Full name is required.';
        if (!form.grade) return 'Please select your grade.';
        if (!form.student_id.trim()) return 'Student ID is required.';
        if (!form.parent_email.trim()) return 'Parent email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parent_email))
            return 'Please enter a valid parent email.';
        if (!form.emergency_contact.trim()) return 'Emergency contact is required.';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!user) return;
        setSaving(true);
        setError(null);

        try {
            if (existingProfileId) {
                // Update existing profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        ...form,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingProfileId);

                if (updateError) throw updateError;
            } else {
                // Insert new profile
                const { error: insertError } = await supabase.from('profiles').insert({
                    firebase_uid: user.id,
                    ...form,
                });

                if (insertError) throw insertError;
            }

            setSuccess(true);
            setTimeout(() => navigate('/home'), 2000);
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loadingProfile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600">Loading your profile…</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md mx-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Saved!</h2>
                    <p className="text-gray-600">
                        Your student profile is complete. You can now join clubs with one click.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 py-10 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate('/home')}
                    className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    <span className="font-medium">Back to Clubs</span>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Profile</h1>
                    <p className="text-gray-600">
                        {existingProfileId
                            ? 'Update your information below.'
                            : 'Complete your profile to join clubs with one click.'}
                    </p>
                </div>

                {/* Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                    <div className="p-8 space-y-6">
                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                                <AlertTriangle size={18} />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <User size={15} className="mr-2 text-blue-500" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                placeholder="John Smith"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Grade */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <GraduationCap size={15} className="mr-2 text-indigo-500" />
                                Grade
                            </label>
                            <select
                                name="grade"
                                value={form.grade}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">Select grade…</option>
                                {GRADES.map((g) => (
                                    <option key={g} value={g}>
                                        Grade {g}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Student ID */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Shield size={15} className="mr-2 text-green-500" />
                                Student ID
                            </label>
                            <input
                                type="text"
                                name="student_id"
                                value={form.student_id}
                                onChange={handleChange}
                                placeholder="e.g. 123456"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Parent Email */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Mail size={15} className="mr-2 text-orange-500" />
                                Parent / Guardian Email
                            </label>
                            <input
                                type="email"
                                name="parent_email"
                                value={form.parent_email}
                                onChange={handleChange}
                                placeholder="parent@email.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Emergency Contact */}
                        <div>
                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                <Phone size={15} className="mr-2 text-red-500" />
                                Emergency Contact (Phone)
                            </label>
                            <input
                                type="tel"
                                name="emergency_contact"
                                value={form.emergency_contact}
                                onChange={handleChange}
                                placeholder="(770) 555-0123"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="bg-gray-50 border-t border-gray-100 px-8 py-5">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving…
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={18} />
                                    {existingProfileId ? 'Update Profile' : 'Save Profile'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSetup;
