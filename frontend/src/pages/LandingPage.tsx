import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FileSignature, Calendar, ArrowRight, Users, MapPin, BookOpen, Trophy } from 'lucide-react';
import { useAuth } from '../config/firebase';

/* ── Animation Orchestration ─────────────────────────────── */

const stagger = {
    hidden: {},
    show: {
        transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const snapIn = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

/* ── Component ───────────────────────────────────────────── */

const LandingPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) navigate('/app', { replace: true });
    }, [user, loading, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-fcs-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 bg-noise font-body">

            {/* ── Navbar ──────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 bg-stone-50/90 backdrop-blur-md border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 no-underline">
                        <div className="w-7 h-7 bg-fcs-blue rounded-md flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-heading font-bold text-fcs-blue text-[15px] tracking-tight">
                            FCS&nbsp;ClubConnect
                        </span>
                    </Link>

                    <Link
                        to="/login"
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-fcs-blue rounded-md hover:bg-fcs-blue-600 transition-colors no-underline tracking-wide uppercase"
                    >
                        Student Login
                    </Link>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────── */}
            <motion.section
                variants={stagger}
                initial="hidden"
                animate="show"
                className="max-w-7xl mx-auto px-6 pt-20 pb-12"
            >
                <motion.div variants={fadeUp} className="mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-fcs-blue/5 border border-fcs-blue/10 rounded-md text-[11px] font-semibold text-fcs-blue uppercase tracking-widest">
                        <MapPin className="w-3 h-3" />
                        Forsyth County Schools District
                    </span>
                </motion.div>

                <motion.h1
                    variants={fadeUp}
                    className="font-heading font-extrabold text-fcs-blue text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight max-w-4xl"
                >
                    Find your people.
                    <br />
                    <span className="text-fcs-gold">Join your club.</span>
                </motion.h1>

                <motion.p
                    variants={fadeUp}
                    className="mt-5 text-stone-500 text-base sm:text-lg max-w-xl leading-relaxed"
                >
                    The central hub for 300+ clubs, student organizations, and leadership
                    opportunities across all eight Forsyth County high schools.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                    <Link
                        to="/login"
                        className="group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-fcs-blue rounded-md shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all no-underline"
                    >
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <Link
                        to="/about"
                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-fcs-blue bg-transparent border border-fcs-blue/20 rounded-md hover:bg-fcs-blue/5 transition-all no-underline"
                    >
                        Learn More
                    </Link>
                </motion.div>
            </motion.section>

            {/* ── Bento Grid ─────────────────────────────────── */}
            <motion.section
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                className="max-w-7xl mx-auto px-6 pb-20"
            >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3">

                    {/* ─ Stats Card (spans 2 cols) ─ */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-2 bg-fcs-blue text-white p-7 rounded-md border border-fcs-blue"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Trophy className="w-4 h-4 text-fcs-gold" />
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-fcs-gold">
                                By the Numbers
                            </span>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <p className="font-heading font-extrabold text-4xl leading-none">300+</p>
                                <p className="text-[13px] text-white/60 mt-1">Active Clubs</p>
                            </div>
                            <div className="w-full h-px bg-white/10" />
                            <div className="flex gap-8">
                                <div>
                                    <p className="font-heading font-bold text-2xl leading-none">8</p>
                                    <p className="text-[13px] text-white/60 mt-1">Schools</p>
                                </div>
                                <div>
                                    <p className="font-heading font-bold text-2xl leading-none">12</p>
                                    <p className="text-[13px] text-white/60 mt-1">Categories</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ─ Smart Discovery (spans 4 cols) ─ */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-4 bg-stone-50 p-7 rounded-md border border-stone-200 flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-10 h-10 bg-fcs-blue/5 border border-fcs-blue/10 rounded-md flex items-center justify-center mb-4">
                                <Search className="w-5 h-5 text-fcs-blue" />
                            </div>
                            <h3 className="font-heading font-bold text-fcs-blue text-xl mb-2">
                                Smart Discovery
                            </h3>
                            <p className="text-stone-500 text-sm leading-relaxed max-w-md">
                                Filter across all 300+ clubs by interest, category, or school.
                                Our recommendation engine matches you with clubs that fit — instantly.
                            </p>
                        </div>
                        <div className="mt-6 flex flex-wrap gap-2">
                            {['Academic', 'STEM', 'Arts', 'Service', 'Sports', 'Leadership'].map((tag) => (
                                <span key={tag} className="px-3 py-1 text-[11px] font-semibold text-fcs-blue bg-fcs-blue/5 border border-fcs-blue/10 rounded-md uppercase tracking-wide">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* ─ Digital Permissions (spans 3 cols) ─ */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-3 bg-stone-50 p-7 rounded-md border border-stone-200"
                    >
                        <div className="w-10 h-10 bg-fcs-gold/10 border border-fcs-gold/20 rounded-md flex items-center justify-center mb-4">
                            <FileSignature className="w-5 h-5 text-fcs-gold-700" />
                        </div>
                        <h3 className="font-heading font-bold text-fcs-blue text-xl mb-2">
                            Digital Permissions
                        </h3>
                        <p className="text-stone-500 text-sm leading-relaxed">
                            No more paper forms. Students apply, parents verify,
                            and club sponsors approve — all electronically with a single workflow.
                        </p>
                        <div className="mt-5 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-7 h-7 bg-fcs-blue/10 border border-stone-200 rounded-md flex items-center justify-center text-[10px] font-bold text-fcs-blue">S</div>
                                <div className="w-7 h-7 bg-fcs-gold/10 border border-stone-200 rounded-md flex items-center justify-center text-[10px] font-bold text-fcs-gold-700">P</div>
                                <div className="w-7 h-7 bg-teal-50 border border-stone-200 rounded-md flex items-center justify-center text-[10px] font-bold text-teal">A</div>
                            </div>
                            <span className="text-[11px] text-stone-400 font-medium">
                                Student → Parent → Advisor
                            </span>
                        </div>
                    </motion.div>

                    {/* ─ Live Schedules (spans 3 cols) ─ */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-3 bg-stone-50 p-7 rounded-md border border-stone-200"
                    >
                        <div className="w-10 h-10 bg-teal-50 border border-teal-200 rounded-md flex items-center justify-center mb-4">
                            <Calendar className="w-5 h-5 text-teal" />
                        </div>
                        <h3 className="font-heading font-bold text-fcs-blue text-xl mb-2">
                            Live Schedules
                        </h3>
                        <p className="text-stone-500 text-sm leading-relaxed">
                            Never miss a meeting. Sync club events to your calendar,
                            get reminders, and stay on top of deadlines and competitions.
                        </p>
                        <div className="mt-5 flex gap-2">
                            {['Mon 3:30', 'Wed 4:00', 'Fri 3:15'].map((t) => (
                                <span key={t} className="px-2.5 py-1 text-[11px] font-mono font-medium text-teal bg-teal-50 border border-teal-200 rounded-md">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* ─ CTA Card (full width) ─ */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-6 bg-fcs-blue p-8 rounded-md border border-fcs-blue flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                        <div>
                            <h3 className="font-heading font-bold text-white text-xl mb-1.5">
                                Ready to get involved?
                            </h3>
                            <p className="text-white/50 text-sm">
                                Create a free student account and join your first club in minutes.
                            </p>
                        </div>
                        <Link
                            to="/create-account"
                            className="group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-fcs-blue bg-fcs-gold rounded-md shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all no-underline whitespace-nowrap"
                        >
                            Create Account
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </motion.div>

                </div>
            </motion.section>

            {/* ── Footer ─────────────────────────────────────── */}
            <footer className="border-t border-stone-200 bg-stone-50">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-stone-400">
                    <p>&copy; {new Date().getFullYear()} ClubConnect &mdash; Forsyth County Schools</p>
                    <div className="flex gap-5">
                        <Link to="/about" className="hover:text-fcs-blue transition-colors no-underline text-stone-400">About</Link>
                        <Link to="/login" className="hover:text-fcs-blue transition-colors no-underline text-stone-400">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
