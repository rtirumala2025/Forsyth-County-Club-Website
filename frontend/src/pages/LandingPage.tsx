import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, FileSignature, Calendar, ArrowRight, Users } from 'lucide-react';
import { useAuth } from '../config/firebase';

const LandingPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // Auto-redirect logged-in users to the app dashboard
    useEffect(() => {
        if (!loading && user) {
            navigate('/app', { replace: true });
        }
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* ── Simplified Navbar ────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 no-underline">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-bold text-gray-900 tracking-tight">
                            ClubConnect
                        </span>
                    </Link>

                    <Link
                        to="/login"
                        className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm no-underline"
                    >
                        Student Login
                    </Link>
                </div>
            </nav>

            {/* ── Hero Section ─────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-50/60 to-white pointer-events-none" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

                <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold tracking-wide uppercase border border-blue-100">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Forsyth County&apos;s Student Hub
                    </div>

                    <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
                        Discover Your Community
                        <br />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            at Forsyth County.
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        The central hub for all 300+ clubs, student organizations, and leadership
                        opportunities across every Forsyth County high school.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/app"
                            className="group inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 no-underline"
                        >
                            Browse Clubs
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-all duration-200 no-underline"
                        >
                            Student Login
                        </Link>
                    </div>

                    {/* Stats row */}
                    <div className="mt-16 flex items-center justify-center gap-12 text-center">
                        <div>
                            <p className="text-4xl font-bold text-gray-900">300+</p>
                            <p className="text-sm text-gray-400 mt-1">Active Clubs</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div>
                            <p className="text-4xl font-bold text-gray-900">8</p>
                            <p className="text-sm text-gray-400 mt-1">High Schools</p>
                        </div>
                        <div className="w-px h-10 bg-gray-200" />
                        <div>
                            <p className="text-4xl font-bold text-gray-900">100%</p>
                            <p className="text-sm text-gray-400 mt-1">Paperless</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Feature Grid ─────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                        Everything in One Place
                    </h2>
                    <p className="text-gray-500 max-w-lg mx-auto">
                        Built for students, by students — making school involvement effortless.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1 — Smart Discovery */}
                    <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <Search className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Discovery</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Search and filter across 300+ clubs by interest, category, or school.
                            Find the perfect fit in seconds.
                        </p>
                    </div>

                    {/* Card 2 — Digital Permissions */}
                    <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <FileSignature className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Permissions</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            No more paper forms. Parents verify and sign electronically
                            with a single click.
                        </p>
                    </div>

                    {/* Card 3 — Live Schedules */}
                    <div className="group p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Schedules</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Stay up to date with meeting times, events, and deadlines.
                            Never miss a moment.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── CTA Footer ───────────────────────────────────────── */}
            <section className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Ready to get involved?
                    </h2>
                    <p className="text-blue-100 mb-8 max-w-lg mx-auto">
                        Join thousands of Forsyth County students already using ClubConnect
                        to find their community.
                    </p>
                    <Link
                        to="/app"
                        className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-blue-600 bg-white rounded-xl hover:shadow-lg transition-all duration-200 no-underline"
                    >
                        Explore All Clubs
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* ── Footer ───────────────────────────────────────────── */}
            <footer className="bg-gray-50 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} ClubConnect &mdash; Forsyth County Schools</p>
                    <div className="flex gap-6">
                        <Link to="/about" className="hover:text-gray-600 transition-colors no-underline text-gray-400">About</Link>
                        <Link to="/login" className="hover:text-gray-600 transition-colors no-underline text-gray-400">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
