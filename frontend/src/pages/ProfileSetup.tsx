import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    GraduationCap,
    Mail,
    Phone,
    Shield,
    CheckCircle,
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
                } else if (user.user_metadata?.full_name) {
                    // Pre-fill name from auth metadata if available
                    setForm(prev => ({ ...prev, full_name: user.user_metadata.full_name }));
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
        if (!/^\d{5,7}$/.test(form.student_id.trim())) return 'Student ID must be 5-7 digits.';
        if (!form.parent_email.trim()) return 'Parent email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parent_email))
            return 'Please enter a valid parent email.';
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
            // Check for duplicate Student ID
            const { data: duplicate } = await supabase
                .from('profiles')
                .select('id')
                .eq('student_id', form.student_id)
                .neq('firebase_uid', user.id) // Allow current user to keep their ID
                .maybeSingle();

            if (duplicate) {
                setError('This Student ID is already registered to another user.');
                setSaving(false);
                return;
            }

            const profileData = {
                firebase_uid: user.id,
                email: user.email, // Ensure email is synced
                ...form,
                updated_at: new Date().toISOString(),
            };

            if (existingProfileId) {
                // Update existing profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update(profileData)
                    .eq('id', existingProfileId);

                if (updateError) throw updateError;
            } else {
                // Insert new profile
                const { error: insertError } = await supabase.from('profiles').insert(profileData);

                if (insertError) throw insertError;
            }

            setSuccess(true);

            // Short delay to show success message before redirect
            setTimeout(() => {
                // If we have a stored redirect path, use it, otherwise go to app
                // For now, defaulting to /app as requested
                navigate('/app', { replace: true });
            }, 1500);

        } catch (err: any) {
            console.error('Error saving profile:', err);
            setError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loadingProfile) {
        return (
            <div className="min-h-screen bg-stone-50 bg-noise flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-fcs-blue animate-spin mx-auto mb-3" />
                    <p className="text-stone-600 font-medium">Loading your profile…</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-stone-50 bg-noise flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl border-t-4 border-fcs-blue p-10 text-center max-w-md w-full animate-fade-in-up">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-stone-900 mb-2">Profile Saved!</h2>
                    <p className="text-stone-600">
                        Redirecting you to the dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 bg-noise flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
                <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-4">
                    <User className="h-8 w-8 text-fcs-blue" />
                </div>
                <h2 className="font-heading text-3xl font-bold text-stone-900">
                    Student Registration
                </h2>
                <p className="mt-2 text-stone-600">
                    Complete your profile to join clubs.
                </p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-[40rem]">
                <div className="bg-white py-8 px-4 shadow-xl rounded-xl border-t-4 border-fcs-blue sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Error Alert */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                                        <div className="mt-1 text-sm text-red-700">{error}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            {/* Full Name */}
                            <div className="sm:col-span-4">
                                <label htmlFor="full_name" className="block text-sm font-semibold text-stone-700">
                                    Full Name
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-4 w-4 text-stone-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="full_name"
                                        id="full_name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        className="focus:ring-fcs-blue focus:border-fcs-blue block w-full pl-10 sm:text-sm border-stone-300 rounded-md py-2.5"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            {/* Grade */}
                            <div className="sm:col-span-2">
                                <label htmlFor="grade" className="block text-sm font-semibold text-stone-700">
                                    Grade
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <GraduationCap className="h-4 w-4 text-stone-400" />
                                    </div>
                                    <select
                                        id="grade"
                                        name="grade"
                                        value={form.grade}
                                        onChange={handleChange}
                                        className="focus:ring-fcs-blue focus:border-fcs-blue block w-full pl-10 sm:text-sm border-stone-300 rounded-md py-2.5 bg-white"
                                    >
                                        <option value="">Select...</option>
                                        {GRADES.map((g) => (
                                            <option key={g} value={g}>
                                                {g}th
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Student ID */}
                            <div className="sm:col-span-3">
                                <label htmlFor="student_id" className="block text-sm font-semibold text-stone-700">
                                    Student ID
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Shield className="h-4 w-4 text-stone-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="student_id"
                                        id="student_id"
                                        value={form.student_id}
                                        onChange={handleChange}
                                        className="focus:ring-fcs-blue focus:border-fcs-blue block w-full pl-10 sm:text-sm border-stone-300 rounded-md py-2.5"
                                        placeholder="123456"
                                    />
                                </div>
                            </div>

                            {/* Emergency Contact */}
                            <div className="sm:col-span-3">
                                <label htmlFor="emergency_contact" className="block text-sm font-semibold text-stone-700">
                                    Emergency Phone
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-stone-400" />
                                    </div>
                                    <input
                                        type="tel"
                                        name="emergency_contact"
                                        id="emergency_contact"
                                        value={form.emergency_contact}
                                        onChange={handleChange}
                                        className="focus:ring-fcs-blue focus:border-fcs-blue block w-full pl-10 sm:text-sm border-stone-300 rounded-md py-2.5"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                            </div>

                            {/* Parent Email */}
                            <div className="sm:col-span-6">
                                <label htmlFor="parent_email" className="block text-sm font-semibold text-stone-700">
                                    Parent / Guardian Email
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-4 w-4 text-stone-400" />
                                    </div>
                                    <input
                                        type="email"
                                        name="parent_email"
                                        id="parent_email"
                                        value={form.parent_email}
                                        onChange={handleChange}
                                        className="focus:ring-fcs-blue focus:border-fcs-blue block w-full pl-10 sm:text-sm border-stone-300 rounded-md py-2.5"
                                        placeholder="parent@example.com"
                                    />
                                    <p className="mt-1 text-xs text-stone-500">
                                        Used for permission slips and official communications.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-fcs-blue hover:bg-fcs-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fcs-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                        Saving Profile...
                                    </>
                                ) : (
                                    'Complete Registration'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileSetup;
