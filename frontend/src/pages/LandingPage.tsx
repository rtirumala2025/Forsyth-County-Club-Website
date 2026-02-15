import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FileSignature, Calendar, ArrowRight, MapPin, BookOpen, Trophy } from 'lucide-react';
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
                className="max-w-7xl mx-auto px-6 pt-20 pb-14"
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
                    className="mt-5 text-stone-700 text-base sm:text-lg font-medium max-w-xl leading-relaxed"
                >
                    The central hub for 300+ clubs, student organizations, and leadership
                    opportunities across all eight Forsyth County high schools.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                    <Link
                        to="/login"
                        className="group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-fcs-blue bg-fcs-gold rounded-md shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all no-underline"
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
                viewport={{ once: true, amount: 0.1 }}
                className="max-w-7xl mx-auto px-6 pb-20"
            >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    {/* ─────────────────────────────────────────────
              ROW 1: Stats (4 cols) + Smart Discovery (8 cols)
          ───────────────────────────────────────────── */}

                    {/* Stats Card */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-4 bg-fcs-blue text-white p-7 rounded-md border border-fcs-blue hover:scale-[1.02] transition-transform"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Trophy className="w-4 h-4 text-fcs-gold" />
                            <span className="text-[11px] font-semibold uppercase tracking-widest text-fcs-gold">
                                By the Numbers
                            </span>
                        </div>
                        <div className="space-y-5">
                            <div>
                                <p className="font-heading font-extrabold text-5xl leading-none">300+</p>
                                <p className="text-sm text-white/60 mt-1.5">Active Clubs</p>
                            </div>
                            <div className="w-full h-px bg-white/10" />
                            <div className="flex gap-10">
                                <div>
                                    <p className="font-heading font-extrabold text-3xl leading-none">8</p>
                                    <p className="text-sm text-white/60 mt-1">Schools</p>
                                </div>
                                <div>
                                    <p className="font-heading font-extrabold text-3xl leading-none">12</p>
                                    <p className="text-sm text-white/60 mt-1">Categories</p>
                                </div>
                                <div>
                                    <p className="font-heading font-extrabold text-3xl leading-none">5k+</p>
                                    <p className="text-sm text-white/60 mt-1">Students</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Smart Discovery Card */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-8 bg-stone-50 p-7 rounded-md border border-stone-200 flex flex-col justify-between hover:scale-[1.02] transition-transform"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-fcs-blue/5 border border-fcs-blue/10 rounded-md flex items-center justify-center">
                                    <Search className="w-4 h-4 text-fcs-blue" />
                                </div>
                                <h3 className="font-heading font-bold text-fcs-blue text-xl">
                                    Smart Discovery
                                </h3>
                            </div>
                            <p className="text-stone-600 text-sm leading-relaxed max-w-lg mb-5">
                                Filter across all 300+ clubs by interest, category, or school.
                                Our recommendation engine matches you with clubs that fit — instantly.
                            </p>

                            {/* Mock Search Bar */}
                            <div className="relative mb-5">
                                <div className="flex items-center bg-white border border-stone-300 rounded-md px-3 py-2.5 gap-2">
                                    <Search className="w-4 h-4 text-stone-400 flex-shrink-0" />
                                    <span className="text-sm text-stone-400 font-medium">Type to search clubs, activities, or interests...</span>
                                </div>
                            </div>
                        </div>

                        {/* Category Pills */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Academic', count: 11 },
                                { label: 'STEM', count: 5 },
                                { label: 'Arts', count: 5 },
                                { label: 'Service', count: 8 },
                                { label: 'Sports', count: 4 },
                                { label: 'Leadership', count: 1 },
                            ].map((cat) => (
                                <span
                                    key={cat.label}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-fcs-blue bg-fcs-blue/5 border border-fcs-blue/10 rounded-md uppercase tracking-wide cursor-pointer hover:bg-fcs-blue/10 transition-colors"
                                >
                                    {cat.label}
                                    <span className="text-[10px] text-fcs-blue/50 font-mono">{cat.count}</span>
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* ─────────────────────────────────────────────
              ROW 2: Permissions (6 cols) + Schedules (6 cols)
          ───────────────────────────────────────────── */}

                    {/* Digital Permissions Card */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-6 bg-stone-50 p-7 rounded-md border border-stone-200 hover:scale-[1.02] transition-transform"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-fcs-gold/10 border border-fcs-gold/20 rounded-md flex items-center justify-center">
                                <FileSignature className="w-4 h-4 text-fcs-gold-700" />
                            </div>
                            <h3 className="font-heading font-bold text-fcs-blue text-xl">
                                Digital Permissions
                            </h3>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed mb-5">
                            No more paper forms. Students apply, parents verify,
                            and club sponsors approve — all electronically.
                        </p>

                        {/* Mock Signature Line */}
                        <div className="bg-white border border-stone-200 rounded-md p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex -space-x-1.5">
                                    <div className="w-6 h-6 bg-fcs-blue/10 border border-stone-200 rounded-md flex items-center justify-center text-[9px] font-bold text-fcs-blue">S</div>
                                    <div className="w-6 h-6 bg-fcs-gold/10 border border-stone-200 rounded-md flex items-center justify-center text-[9px] font-bold text-fcs-gold-700">P</div>
                                    <div className="w-6 h-6 bg-teal-50 border border-stone-200 rounded-md flex items-center justify-center text-[9px] font-bold text-teal">A</div>
                                </div>
                                <span className="text-[11px] text-stone-400 font-medium">
                                    Student → Parent → Advisor
                                </span>
                            </div>
                            <div className="border-t border-stone-100 pt-3">
                                <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Parent / Guardian Signature</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-stone-300 text-sm">✕</span>
                                    <div className="flex-1 border-b border-stone-300 pb-0.5 relative">
                                        <span className="font-['Caveat',_cursive] text-fcs-blue/60 text-lg italic absolute -top-1 left-2">Jane Doe</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Live Schedules Card */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-6 bg-stone-50 p-7 rounded-md border border-stone-200 hover:scale-[1.02] transition-transform"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-teal-50 border border-teal-200 rounded-md flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-teal" />
                            </div>
                            <h3 className="font-heading font-bold text-fcs-blue text-xl">
                                Live Schedules
                            </h3>
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed mb-5">
                            Never miss a meeting. Sync club events to your calendar,
                            get reminders, and stay on top of deadlines.
                        </p>

                        {/* Mock Calendar Strip */}
                        <div className="bg-white border border-stone-200 rounded-md p-3">
                            <div className="grid grid-cols-5 gap-2">
                                {[
                                    { day: 'MON', date: '10', event: null },
                                    { day: 'TUE', date: '11', event: null },
                                    { day: 'WED', date: '12', event: 'Robotics' },
                                    { day: 'THU', date: '13', event: 'NHS' },
                                    { day: 'FRI', date: '14', event: 'Art Club' },
                                ].map((d) => (
                                    <div
                                        key={d.day}
                                        className={`text-center rounded-md p-2 ${d.event
                                                ? 'bg-fcs-blue/5 border border-fcs-blue/10'
                                                : 'bg-stone-50 border border-stone-100'
                                            }`}
                                    >
                                        <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-wider">{d.day}</p>
                                        <p className={`font-heading font-bold text-lg leading-tight ${d.event ? 'text-fcs-blue' : 'text-stone-300'}`}>
                                            {d.date}
                                        </p>
                                        {d.event && (
                                            <p className="text-[9px] font-semibold text-teal mt-0.5 truncate">{d.event}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-stone-400">
                                <div className="w-2 h-2 rounded-full bg-teal" />
                                <span className="font-medium">3 meetings this week</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* ─────────────────────────────────────────────
              ROW 3: Full-width CTA
          ───────────────────────────────────────────── */}
                    <motion.div
                        variants={snapIn}
                        className="md:col-span-12 bg-fcs-blue p-8 rounded-md border border-fcs-blue flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                        <div>
                            <h3 className="font-heading font-bold text-white text-xl mb-1.5">
                                Ready to get involved?
                            </h3>
                            <p className="text-white/50 text-sm font-medium">
                                Create a free student account and join your first club in minutes.
                            </p>
                        </div>
                        <Link
                            to="/create-account"
                            className="group inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-fcs-blue bg-fcs-gold rounded-md shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all no-underline whitespace-nowrap"
                        >
                            Create Account
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </motion.div>

                </div>
            </motion.section>

            {/* ── Footer ─────────────────────────────────────── */}
            <footer className="border-t border-stone-200 bg-stone-50">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-stone-500">
                    <p>&copy; {new Date().getFullYear()} ClubConnect &mdash; Forsyth County Schools</p>
                    <div className="flex gap-5">
                        <Link to="/about" className="hover:text-fcs-blue transition-colors no-underline text-stone-500">About</Link>
                        <Link to="/login" className="hover:text-fcs-blue transition-colors no-underline text-stone-500">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
