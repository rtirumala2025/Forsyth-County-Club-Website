import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Menu, X, Users, ChevronRight, BarChart3, Calendar as CalendarIcon, ChevronDown, BookOpen, MessageCircle, CheckCircle, Loader2, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../config/firebase';
import UserMenu from '../components/auth/userMenu';
import { useNavigate, useParams } from 'react-router-dom';
import { useClubFilter } from '../hooks/useClubFilter';
import { useSupabaseClubs } from '../hooks/useSupabaseClubs';
import type { ClubRecord } from '../hooks/useSupabaseClubs';
// Removed legacy chatbot import; using global floating Chatbot in App.jsx instead

const ClubsWebsite = () => {
  // ── Supabase data feed ──────────────────────────────────────
  const { data: supabaseRecords, isLoading: clubsLoading, isError, error: clubsError } = useSupabaseClubs();

  // Transform Supabase records → legacy shape { school, clubs[] }
  const allClubData = useMemo(() => {
    if (!supabaseRecords) return [];
    const grouped = new Map<string, any[]>();
    for (const rec of supabaseRecords) {
      const schoolName = (rec.school as any)?.name ?? 'Unknown';
      if (!grouped.has(schoolName)) grouped.set(schoolName, []);
      grouped.get(schoolName)!.push({
        id: rec.id,
        name: (rec.club as any)?.name ?? '',
        slug: (rec.club as any)?.slug ?? '',
        description: (rec.club as any)?.description ?? '',
        category: (rec.club as any)?.category ?? 'Other',
        sponsor: rec.sponsor_name ?? '',
        meeting_details: rec.meeting_details ?? '',
        application_required: rec.application_required ?? false,
      });
    }
    return Array.from(grouped.entries()).map(([school, clubs]) => ({ school, clubs }));
  }, [supabaseRecords]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('West Forsyth High School');
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { schoolSlug, clubSlug } = useParams();

  const availableSchools = useMemo(
    () => allClubData?.map(school => school.school) || [],
    [allClubData]
  );

  // Filter clubs by selected school
  const filteredClubsData = useMemo(() => {
    if (!allClubData) return [];
    const schoolData = allClubData.find(school => school.school === selectedSchool);
    if (!schoolData) return [];
    return schoolData.clubs || [];
  }, [selectedSchool, allClubData]);

  // Handle URL parameters for direct club links
  useEffect(() => {
    if (schoolSlug && clubSlug && allClubData?.length > 0) {
      // Convert school slug back to school name using proper mapping
      const getSchoolNameFromSlug = (slug) => {
        const slugMappings = {
          'east-forsyth': 'East Forsyth High School',
          'west-forsyth': 'West Forsyth High School',
          'lambert': 'Lambert High School',
          'forsyth-central': 'Forsyth Central High School',
          'denmark': 'Denmark High School',
          'south-forsyth': 'South Forsyth High School',
          'north-forsyth': 'North Forsyth High School',
          'alliance-academy': 'Alliance Academy for Innovation'
        };
        return slugMappings[slug] || slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' High School';
      };

      const schoolName = getSchoolNameFromSlug(schoolSlug);

      // Find the school data
      const schoolData = allClubData.find(school => school.school === schoolName);
      if (schoolData) {
        const clubs = schoolData.clubs || [];

        // Find the club by exact ID match (club data already has proper IDs)
        const club = clubs.find(club => club.id === clubSlug);

        if (club) {
          console.log('Found club from URL:', club.name, 'in', schoolName);
          setSelectedSchool(schoolName);
          setSelectedClub(club.id);
        } else {
          console.warn('Club not found:', clubSlug, 'in', schoolName);
          // Redirect to home if club not found
          navigate('/home');
        }
      } else {
        console.warn('School not found:', schoolName);
        // Redirect to home if school not found
        navigate('/home');
      }
    }
  }, [schoolSlug, clubSlug, allClubData]);

  // Call all hooks before any conditional returns
  const { clubsByCategory, filteredClubs, categories, stats } = useClubFilter(filteredClubsData || [], searchTerm, selectedCategory);
  const selectedClubData = (filteredClubsData || []).find(club => club.id === selectedClub);

  const handleHomeClick = () => {
    setSelectedCategory(null);
    setSelectedClub(null);
    setSearchTerm('');
  };

  const handleCompareClick = () => {
    navigate('/compare');
  };

  const handleEventsClick = () => {
    navigate('/events');
  };

  // Add handler for About button
  const handleAboutClick = () => {
    navigate('/about');
  };

  // Add handler for Calendar button
  const handleCalendarClick = () => {
    navigate('/calendar');
  };

  // ── Join Club Logic ───────────────────────────────────────────
  const [joiningClubId, setJoiningClubId] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auto-dismiss join message after 5 seconds
  useEffect(() => {
    if (joinMessage) {
      const timer = setTimeout(() => setJoinMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [joinMessage]);

  const handleJoinClub = async (club: any) => {
    // 1. Check auth
    if (!user) {
      setJoinMessage({ type: 'info', text: 'Please log in to join a club.' });
      navigate('/login');
      return;
    }

    setJoiningClubId(club.id);
    setJoinMessage(null);

    try {
      // 2. Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('firebase_uid', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        setJoinMessage({ type: 'info', text: 'Please complete your profile before joining a club.' });
        navigate('/profile-setup');
        return;
      }

      // 3. Check for duplicate application
      const { data: existing } = await supabase
        .from('signatures')
        .select('id')
        .eq('profile_id', profile.id)
        .eq('club_id', club.id)
        .maybeSingle();

      if (existing) {
        setJoinMessage({ type: 'info', text: `You've already applied to ${club.name}.` });
        return;
      }

      // 4. Insert signature
      const { error: insertError } = await supabase.from('signatures').insert({
        profile_id: profile.id,
        club_id: club.id,
        club_name: club.name,
        school_name: selectedSchool,
        student_name: profile.full_name,
        status: 'PENDING_PARENT',
      });

      if (insertError) throw insertError;

      setJoinMessage({
        type: 'success',
        text: `Application submitted for ${club.name}! Your parent will receive a verification link.`,
      });
    } catch (err: any) {
      console.error('Join club error:', err);
      setJoinMessage({ type: 'error', text: err.message || 'Failed to submit application.' });
    } finally {
      setJoiningClubId(null);
    }
  };

  // ── Loading / error states (auth + Supabase) ──────────────
  if (loading || clubsLoading) {
    return (
      <div className="min-h-screen bg-stone-100 bg-noise flex items-center justify-center font-body">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-fcs-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 text-sm font-medium">{loading ? 'Loading authentication…' : 'Fetching clubs…'}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-stone-100 bg-noise flex items-center justify-center font-body">
        <div className="text-center max-w-md">
          <h1 className="font-heading font-bold text-fcs-blue text-2xl mb-3">Connection Error</h1>
          <p className="text-stone-600 text-sm mb-2">Unable to load club data from the database.</p>
          <p className="text-xs text-stone-400 mb-5 font-mono">{clubsError?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2 bg-fcs-blue text-white text-sm font-semibold rounded-md hover:bg-fcs-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ── Category accent colors (left-border only, rest is white) ─── */
  const CategoryAccents: Record<string, string> = {
    'Academic': 'border-l-fcs-blue',
    'Arts': 'border-l-purple-500',
    'Business': 'border-l-green-500',
    'Career': 'border-l-fcs-gold',
    'Cultural': 'border-l-pink-500',
    'Recreation': 'border-l-yellow-500',
    'Recreational': 'border-l-yellow-500',
    'Religious': 'border-l-indigo-500',
    'Faith-Based': 'border-l-indigo-500',
    'Service': 'border-l-red-500',
    'Sports': 'border-l-teal',
    'Athletics': 'border-l-teal',
    'STEM': 'border-l-cyan-500',
    'Support': 'border-l-stone-400',
    'Leadership': 'border-l-green-600',
    'Civic Engagement': 'border-l-fcs-gold',
    'CTAE': 'border-l-slate-500',
    'Healthcare': 'border-l-red-500',
    'Honor Society': 'border-l-purple-600',
    'Literary': 'border-l-pink-500',
    'Inclusion': 'border-l-teal-500',
    'Wellness': 'border-l-green-500',
  };

  // ── Category Grid — Refined with larger text ───────────────────
  const LocalCategoryGrid = ({ categories, categoryAccents, clubsByCategory, onCategorySelect }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategorySelect(category)}
          className={`group relative h-28 bg-white border border-stone-200 border-l-[6px] ${categoryAccents[category] || 'border-l-stone-400'} rounded-xl p-5 text-left shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-start justify-between">
              <h3 className="font-heading font-bold text-stone-800 text-lg group-hover:text-fcs-blue transition-colors">{category}</h3>
            </div>
            <div className="flex items-end justify-end gap-1.5">
              <span className="font-heading font-black text-stone-200 group-hover:text-fcs-gold transition-colors duration-300 text-4xl leading-none -mb-1">
                {clubsByCategory[category]?.length || 0}
              </span>
              <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">
                Clubs
              </span>
            </div>
          </div>
          {/* Subtle bg hover effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-stone-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      ))}
    </div>
  );

  // ── Search Bar — stone-styled ───────────────────────────────────
  const SearchBar = ({ searchTerm, setSearchTerm }) => (
    <div className="mb-5">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search clubs, activities, or interests…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-300 rounded-md text-sm text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-fcs-blue/20 focus:border-fcs-blue outline-none transition-all font-body"
        />
      </div>
    </div>
  );

  // ── Club Card — compact, white, tight shadow ───────────────────
  const ClubCard = ({ club, categoryAccents, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-md border border-stone-200 border-l-4 ${categoryAccents[club.category] || 'border-l-stone-400'} shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer group`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-heading font-bold text-fcs-blue text-sm leading-snug">{club.name}</h3>
          <span className="shrink-0 px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wide">
            {club.category}
          </span>
        </div>
        <p className="text-stone-500 text-xs leading-relaxed mb-3 line-clamp-2 font-body">{club.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-stone-400 font-medium">
            <span className="text-stone-500 font-semibold">Sponsor:</span> {club.sponsor}
          </span>
          <ChevronRight size={14} className="text-stone-300 group-hover:text-fcs-blue group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );

  // ── Club Details — Sawnee & Slate ──────────────────────────────
  const ClubDetails = ({ club, onBack }) => (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={onBack}
        className="mb-5 flex items-center gap-1.5 text-fcs-blue text-sm font-semibold hover:underline underline-offset-2 transition-all"
      >
        <ChevronRight size={16} className="rotate-180" />
        Back to Clubs
      </button>

      {/* Dark Hero */}
      <div className="bg-fcs-blue rounded-md p-7 md:p-10 mb-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <h1 className="font-heading font-extrabold text-white text-3xl md:text-4xl leading-tight mb-3">
              {club.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md text-[11px] font-semibold bg-white/10 text-white/80 uppercase tracking-wide border border-white/10">
                {club.category}
              </span>
              <span className="text-white/50 text-sm font-medium flex items-center gap-1.5">
                <Users size={14} /> Open to join
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); handleJoinClub(club); }}
              disabled={joiningClubId === club.id}
              className="px-5 py-2.5 bg-fcs-gold text-fcs-blue text-sm font-bold rounded-md shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
            >
              {joiningClubId === club.id ? (
                <><Loader2 size={14} className="animate-spin" /> Joining…</>
              ) : (
                'Join Club'
              )}
            </button>
            <button className="px-5 py-2.5 bg-transparent text-white text-sm font-semibold rounded-md border border-white/20 hover:bg-white/5 transition-all">
              Contact Sponsor
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — details */}
        <div className="lg:col-span-2 space-y-5">
          {/* About */}
          <div className="bg-white rounded-md border border-stone-200 shadow-sm">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-heading font-bold text-fcs-blue text-lg flex items-center gap-2">
                <Users size={16} className="text-fcs-blue" /> About This Club
              </h2>
            </div>
            <div className="p-6">
              <p className="text-stone-600 leading-relaxed text-sm font-body">{club.description}</p>
            </div>
          </div>

          {/* What We Do */}
          <div className="bg-white rounded-md border border-stone-200 shadow-sm">
            <div className="px-6 py-4 border-b border-stone-100">
              <h2 className="font-heading font-bold text-fcs-blue text-lg flex items-center gap-2">
                <BarChart3 size={16} className="text-fcs-blue" /> What We Do
              </h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'Regular Meetings', desc: 'Connect with fellow members and plan activities' },
                { label: 'Special Events', desc: 'Participate in competitions and showcases' },
                { label: 'Community Service', desc: 'Make a positive impact in our community' },
                { label: 'Skill Building', desc: 'Develop leadership and specialized skills' },
              ].map(item => (
                <div key={item.label} className="bg-stone-50 border border-stone-100 rounded-md p-4">
                  <h3 className="font-heading font-semibold text-fcs-blue text-sm mb-1">{item.label}</h3>
                  <p className="text-stone-500 text-xs font-body">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Contact */}
          <div className="bg-white rounded-md border border-stone-200 shadow-sm">
            <div className="px-5 py-3 border-b border-stone-100">
              <h3 className="font-heading font-bold text-fcs-blue text-sm">Contact Information</h3>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold mb-0.5">Sponsor</p>
                <p className="text-stone-700 text-sm font-medium">{club.sponsor}</p>
              </div>
              <div>
                <p className="text-[11px] text-stone-400 uppercase tracking-wider font-semibold mb-0.5">Category</p>
                <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wide">
                  {club.category}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Facts */}
          <div className="bg-white rounded-md border border-stone-200 shadow-sm">
            <div className="px-5 py-3 border-b border-stone-100">
              <h3 className="font-heading font-bold text-fcs-blue text-sm">Quick Facts</h3>
            </div>
            <div className="p-5 space-y-2">
              {[
                { label: 'Meeting Frequency', value: 'Weekly' },
                { label: 'Open to All Grades', value: 'Yes' },
                { label: 'Experience Required', value: 'No' },
              ].map(fact => (
                <div key={fact.label} className="flex justify-between items-center p-2.5 bg-stone-50 rounded-md">
                  <span className="text-xs text-stone-500 font-medium">{fact.label}</span>
                  <span className="text-xs text-fcs-blue font-bold">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Join CTA */}
          <div className="bg-fcs-blue rounded-md p-5">
            <h3 className="font-heading font-bold text-white text-base mb-2">Ready to Join?</h3>
            <p className="text-white/50 text-xs mb-4">Connect with like-minded students and make a difference!</p>
            <button
              onClick={(e) => { e.stopPropagation(); handleJoinClub(club); }}
              disabled={joiningClubId === club.id}
              className="w-full px-4 py-2.5 bg-fcs-gold text-fcs-blue text-sm font-bold rounded-md shadow-hard-sm hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            >
              {joiningClubId === club.id ? (
                <><Loader2 size={14} className="animate-spin" /> Joining…</>
              ) : (
                'Get Started Today'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-100 bg-noise font-body text-stone-900 flex">
      {/* ── Sidebar ────────────────────────────────────────────── */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-stone-50 border-r border-stone-200 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-stone-200">
          <div>
            <h1 className="font-heading font-bold text-fcs-blue text-lg leading-tight">
              {selectedSchool === 'Alliance Academy of Innovation' ? 'AAI' : selectedSchool.split(' ').map(word => word[0]).join('')} Clubs
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md hover:bg-stone-200 text-stone-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
          <button
            onClick={handleHomeClick}
            className={`w-full text-left px-3 py-2 rounded-md mb-6 transition-colors flex items-center gap-3 ${!selectedCategory && !selectedClub
              ? 'bg-fcs-blue/10 text-fcs-blue font-semibold'
              : 'text-stone-600 hover:bg-stone-100 hover:text-fcs-blue'
              }`}
          >
            <Users size={16} />
            <span className="text-sm">All Clubs</span>
          </button>

          <div>
            <h3 className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Categories
            </h3>
            <div className="space-y-0.5">
              {Object.keys(CategoryAccents).map(category => (
                <button
                  key={category}
                  onClick={() => { setSelectedCategory(category); setSelectedClub(null); }}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all flex items-center justify-between group ${selectedCategory === category && !selectedClub
                    ? 'bg-white shadow-sm border border-stone-200 text-fcs-blue font-medium'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-fcs-blue'
                    }`}
                >
                  <span className="text-sm">{category}</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${selectedCategory === category && !selectedClub
                    ? 'bg-fcs-blue/10 text-fcs-blue'
                    : 'bg-stone-100 text-stone-400 group-hover:text-stone-500'
                    }`}>
                    {clubsByCategory[category]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-fcs-blue/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>

        {/* Top Navbar — Merged with Hero (Prussian Blue) */}
        <div className="sticky top-0 z-30 bg-fcs-blue h-16 px-6 flex items-center justify-between">
          {/* Left: Menu & School Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-md text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* School Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSchoolDropdownOpen(!schoolDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/10 hover:bg-white/20 transition-all text-sm font-semibold text-white"
              >
                <MapPin size={14} className="text-fcs-gold" />
                {selectedSchool}
                <ChevronDown size={14} className={`text-white/60 transition-transform ${schoolDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {schoolDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSchoolDropdownOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-stone-200 rounded-md shadow-xl py-1 z-40">
                    {availableSchools.map(school => (
                      <button
                        key={school}
                        onClick={() => {
                          setSelectedSchool(school);
                          setSchoolDropdownOpen(false);
                          setSelectedCategory(null);
                          setSelectedClub(null);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedSchool === school
                          ? 'bg-fcs-blue/5 text-fcs-blue font-semibold'
                          : 'text-stone-600 hover:bg-stone-50'
                          }`}
                      >
                        {school}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center Title (Desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2">
            <h1 className="font-heading font-bold text-white text-lg tracking-tight">
              The Club Network
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/chatbot')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-fcs-blue bg-white rounded-md shadow-sm hover:shadow-md transition-all"
            >
              <MessageCircle size={14} />
              <span className="uppercase tracking-wide">Club Quiz</span>
            </button>

            {user ? (
              <UserMenu user={user} />
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-white/90 hover:text-white hover:underline underline-offset-2"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {!selectedCategory && !selectedClub ? (
            <>
              {/* Dark Hero Section — Merged with Header set to bg-fcs-blue */}
              <div className="bg-fcs-blue rounded-b-3xl p-8 md:p-12 mb-16 shadow-xl relative overflow-visible -mt-6">
                <div className="absolute top-0 right-0 w-96 h-96 bg-fcs-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
                  <h2 className="font-heading font-extrabold text-white text-4xl md:text-5xl leading-tight">
                    Find your people. <br /><span className="text-fcs-gold">Join your club.</span>
                  </h2>
                  <p className="text-white/80 text-lg leading-relaxed font-medium">
                    Discover amazing opportunities at {selectedSchool}.
                  </p>

                  {/* Hero Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                      onClick={() => navigate('/chatbot')}
                      className="px-8 py-3.5 bg-fcs-gold text-fcs-blue text-sm font-bold rounded-lg shadow-hard-lg hover:-translate-y-1 hover:shadow-hard-xl transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      Take Club Quiz
                    </button>
                    <button
                      onClick={handleCalendarClick}
                      className="px-8 py-3.5 bg-white/10 text-white text-sm font-semibold rounded-lg border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
                    >
                      <CalendarIcon size={18} />
                      Events Calendar
                    </button>
                  </div>
                </div>

                {/* Floating Search Bar (Pill) — Integrated into Hero */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-fcs-gold to-fcs-blue rounded-2xl opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative">
                      <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 text-fcs-blue" />
                      <input
                        type="text"
                        placeholder="Search clubs (e.g. 'Robotics', 'Chess', 'Debate')…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-14 pr-6 h-14 bg-white rounded-xl shadow-2xl text-stone-900 placeholder:text-stone-400 font-medium text-base focus:scale-[1.01] focus:-translate-y-1 transition-all duration-300 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading font-bold text-fcs-blue text-lg">Browse by Category</h3>
              </div>

              <LocalCategoryGrid
                categories={categories}
                categoryAccents={CategoryAccents}
                clubsByCategory={clubsByCategory}
                onCategorySelect={setSelectedCategory}
              />
            </>
          ) : selectedCategory && !selectedClub ? (
            <div className="animate-[fadeUp_0.3s_ease-out]">
              {/* Category Header */}
              <div className="mb-6">
                <button
                  onClick={handleHomeClick}
                  className="mb-3 flex items-center gap-1.5 text-stone-500 text-xs font-semibold hover:text-fcs-blue transition-colors uppercase tracking-wide"
                >
                  <ChevronRight size={14} className="rotate-180" />
                  Return Home
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-md bg-white border border-stone-200 flex items-center justify-center border-l-4 ${CategoryAccents[selectedCategory] || 'border-l-stone-400'}`}>
                    <BookOpen size={20} className="text-fcs-blue" />
                  </div>
                  <h2 className="font-heading font-bold text-3xl text-fcs-blue">
                    {selectedCategory}
                  </h2>
                </div>
                <p className="text-stone-500 text-sm ml-14">
                  Showing {filteredClubs[selectedCategory]?.length || 0} clubs in this category
                </p>
              </div>

              <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

              {/* Club Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(filteredClubs[selectedCategory]) && filteredClubs[selectedCategory].length > 0 ? (
                  filteredClubs[selectedCategory].map(club => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      categoryAccents={CategoryAccents}
                      onClick={() => setSelectedClub(club.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center bg-white rounded-md border border-stone-200 border-dashed">
                    <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search size={20} className="text-stone-300" />
                    </div>
                    <p className="text-stone-900 font-semibold text-sm">No clubs found.</p>
                    <p className="text-stone-500 text-xs mt-1">Try adjusting your search terms.</p>
                  </div>
                )}
              </div>
            </div>
          ) : selectedClubData ? (
            <div className="animate-[fadeUp_0.3s_ease-out]">
              <ClubDetails
                club={selectedClubData}
                onBack={() => {
                  if (schoolSlug && clubSlug) {
                    navigate('/home');
                  } else {
                    setSelectedClub(null);
                  }
                }}
              />
            </div>
          ) : null}
        </main>

        {/* Footer */}
        <footer className="bg-stone-50 border-t border-stone-200 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>&copy; {new Date().getFullYear()} ClubConnect — Forsyth County Schools</p>
            <div className="flex gap-6">
              <button onClick={handleAboutClick} className="hover:text-fcs-blue transition-colors">About</button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-fcs-blue transition-colors">Back to Top</button>
            </div>
          </div>
        </footer>

      </div>

      {/* Toast Notification */}
      {joinMessage && (
        <div className="fixed top-6 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
          <div
            onClick={() => setJoinMessage(null)}
            className={`flex items-start gap-3 p-4 rounded-md shadow-hard-lg border cursor-pointer transition-all hover:translate-y-px hover:shadow-hard-sm bg-white ${joinMessage.type === 'success'
              ? 'border-l-4 border-l-green-500'
              : joinMessage.type === 'error'
                ? 'border-l-4 border-l-red-500'
                : 'border-l-4 border-l-fcs-blue'
              }`}
          >
            {joinMessage.type === 'success' ? (
              <CheckCircle size={18} className="text-green-600 mt-0.5" />
            ) : joinMessage.type === 'error' ? (
              <X size={18} className="text-red-600 mt-0.5" />
            ) : (
              <BookOpen size={18} className="text-fcs-blue mt-0.5" />
            )}
            <div>
              <p className="text-sm font-bold text-stone-800 mb-0.5">
                {joinMessage.type === 'success' ? 'Success' : joinMessage.type === 'error' ? 'Error' : 'Notification'}
              </p>
              <p className="text-xs text-stone-500 font-medium">{joinMessage.text}</p>
            </div>
            <X size={14} className="text-stone-300 ml-2" />
          </div>
        </div>
      )}
    </div >
  );
};

export default ClubsWebsite;