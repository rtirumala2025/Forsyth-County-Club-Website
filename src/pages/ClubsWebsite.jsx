import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Menu, X, Users, ChevronRight, BarChart3, Calendar as CalendarIcon, ChevronDown, BookOpen, MessageCircle } from 'lucide-react';
import { useAuth } from '../config/firebase';
import UserMenu from '../components/auth/userMenu';
import { useNavigate } from 'react-router-dom';
import { useClubFilter } from '../hooks/useClubFilter';
import { allClubData, CategoryColors, getClubsBySchool, getAvailableSchools } from '../data/clubData';
import ChatbotUI from '../components/chatbot/ChatbotUI';

const ClubsWebsite = () => {
  // Add debugging logs
  console.log('ClubsWebsite component rendering...');
  console.log('allClubData length:', allClubData?.length);
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('West Forsyth High School');
  const [schoolDropdownOpen, setSchoolDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [hasSeenChatbot, setHasSeenChatbot] = useState(false);
  const { user, loading } = useAuth();  
  const navigate = useNavigate();
  
  console.log('Auth state:', { user, loading });
  
  const availableSchools = useMemo(
    () => allClubData.map(school => school.school),
    [allClubData]
  );

  console.log('Available schools:', availableSchools);

  // Filter clubs by selected school
  const filteredClubsData = useMemo(() => {
    const schoolData = allClubData.find(school => school.school === selectedSchool);
    console.log('School data for', selectedSchool, ':', schoolData);
    if (!schoolData) return [];
    // Handle both 'clubs' and 'club' property names
    const clubs = schoolData.clubs || schoolData.club || [];
    console.log('Filtered clubs data length:', clubs.length);
    return clubs;
  }, [selectedSchool, allClubData]);

  console.log('Filtered clubs data:', filteredClubsData);

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

  // Add loading state check
  if (loading) {
    console.log('Auth is loading, showing loading screen...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Add error state for missing data
  if (!allClubData || allClubData.length === 0) {
    console.error('No club data available');
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Data Loading Error</h1>
          <p className="text-gray-600">Unable to load club data. Please refresh the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const CategoryColors = {
    'Academic': 'bg-blue-100 text-blue-800 border-blue-200',
    'Arts': 'bg-purple-100 text-purple-800 border-purple-200',
    'Business': 'bg-green-100 text-green-800 border-green-200',
    'Career': 'bg-orange-100 text-orange-800 border-orange-200',
    'Cultural': 'bg-pink-100 text-pink-800 border-pink-200',
    'Recreation': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Recreational': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Religious': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Faith-Based': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Service': 'bg-red-100 text-red-800 border-red-200',
    'Sports': 'bg-teal-100 text-teal-800 border-teal-200',
    'Athletics': 'bg-teal-100 text-teal-800 border-teal-200',
    'STEM': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Support': 'bg-gray-100 text-gray-800 border-gray-200',
    'Leadership': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Civic Engagement': 'bg-amber-100 text-amber-800 border-amber-200',
    'CTAE': 'bg-slate-100 text-slate-800 border-slate-200',
    'Healthcare': 'bg-rose-100 text-rose-800 border-rose-200',
    'Honor Society': 'bg-violet-100 text-violet-800 border-violet-200',
    'Literary': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    'Inclusion': 'bg-sky-100 text-sky-800 border-sky-200',
    'Wellness': 'bg-lime-100 text-lime-800 border-lime-200',
  };

  // Rename the local CategoryGrid to avoid conflict
  const LocalCategoryGrid = ({ categories, categoryColors, clubsByCategory, onCategorySelect }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategorySelect(category)}
          className={`p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg text-left ${categoryColors[category] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold !text-black">{category}</h3>
            <ChevronRight size={20} className="!text-black" />
          </div>
          <p className="text-sm opacity-75 mb-3 !text-black">
            Explore {category.toLowerCase()} clubs and organizations
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold !text-black">
              {clubsByCategory[category]?.length || 0}
            </span>
            <span className="text-xs font-medium !text-black">
              {clubsByCategory[category]?.length === 1 ? 'Club' : 'Clubs'}
            </span>
          </div>
        </button>
      ))}
    </div>
  );

  const SearchBar = ({ searchTerm, setSearchTerm }) => (
    <div className="p-6 border-b border-gray-200">
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );

  const ClubCard = ({ club, categoryColors, onClick }) => (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold !text-black">{club.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[club.category] || 'bg-gray-100 !text-black border-gray-200'}`}>
            {club.category}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{club.description}</p>
        <div className="text-xs text-gray-500">
          <span className="font-medium">Sponsor:</span> {club.sponsor}
        </div>
      </div>
    </div>
  );

  const ClubDetails = ({ club, categoryColors, onBack }) => (
    <div className="max-w-6xl mx-auto">
      {/* Back Navigation */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-all duration-200 hover:translate-x-1"
      >
        <ChevronRight size={20} className="rotate-180 mr-2" />
        <span className="font-medium">Back to Clubs</span>
      </button>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl mb-8 overflow-hidden relative">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white rounded-full mix-blend-overlay animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full mix-blend-overlay animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative z-10 p-8 md:p-12 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                {club.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30`}>
                  {club.category}
                </span>
                <div className="flex items-center text-white/90">
                  <Users size={18} className="mr-2" />
                  <span className="text-sm font-medium">Join Today!</span>
                </div>
              </div>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-3 min-w-[200px]">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105">
                Join Club
              </button>
              <button className="bg-transparent hover:bg-white/10 border-2 border-white/50 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105">
                Contact Sponsor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold !text-black flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Users size={18} className="!text-black" />
                </div>
                About This Club
              </h2>
            </div>
            <div className="p-8">
              <p className="text-gray-700 leading-relaxed text-lg">
                {club.description}
              </p>
            </div>
          </div>

          {/* Activities & Highlights Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold !text-black flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 size={18} className="!text-black" />
                </div>
                What We Do
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="font-semibold !text-black mb-2 flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
                    Regular Meetings
                  </h3>
                  <p className="!text-black text-sm">Connect with fellow members and plan activities</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                  <h3 className="font-semibold !text-black mb-2 flex items-center">
                    <div className="w-6 h-6 bg-purple-500 rounded-full mr-2"></div>
                    Special Events
                  </h3>
                  <p className="!text-black text-sm">Participate in competitions and showcases</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                  <h3 className="font-semibold !text-black mb-2 flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full mr-2"></div>
                    Community Service
                  </h3>
                  <p className="!text-black text-sm">Make a positive impact in our community</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                  <h3 className="font-semibold !text-black mb-2 flex items-center">
                    <div className="w-6 h-6 bg-orange-500 rounded-full mr-2"></div>
                    Skill Building
                  </h3>
                  <p className="!text-black text-sm">Develop leadership and specialized skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold !text-black">Contact Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <Users size={16} className="!text-black" />
                </div>
                <div>
                  <p className="text-sm font-medium !text-black">Club Sponsor</p>
                  <p className="!text-black">{club.sponsor}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                  <BarChart3 size={16} className="!text-black" />
                </div>
                <div>
                  <p className="text-sm font-medium !text-black">Category</p>
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${categoryColors[club.category] || 'bg-gray-100 text-gray-800 border-gray-200'} mt-1`}>
              {club.category}
            </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold !text-black">Quick Facts</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium !text-black">Meeting Frequency</span>
                <span className="text-sm font-semibold !text-black">Weekly</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium !text-black">Open to All Grades</span>
                <span className="text-sm font-semibold !text-black">Yes</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium !text-black">Experience Required</span>
                <span className="text-sm font-semibold !text-black">No</span>
              </div>
            </div>
          </div>

          {/* Join Now CTA Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg overflow-hidden text-white">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-3">Ready to Join?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Connect with like-minded students and make a difference!
              </p>
              <button className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-all duration-200 hover:scale-105">
                Get Started Today
              </button>
            </div>
          </div>

          {/* Social Media Links (if available) */}
          {club.socialMedia && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold !text-black">Follow Us</h3>
              </div>
              <div className="p-6 space-y-3">
                {club.socialMedia.instagram && (
                  <a href={club.socialMedia.instagram} className="flex items-center p-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">IG</span>
                    </div>
                    <span className="text-sm font-medium !text-black">Instagram</span>
                  </a>
                )}
                {club.socialMedia.website && (
                  <a href={club.socialMedia.website} className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-xs font-bold">WEB</span>
                    </div>
                    <span className="text-sm font-medium !text-black">Website</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } bg-white pt-0`}>
        {/* Sidebar Header - White background with black text */}
        <div className="bg-white px-6 py-6 relative overflow-hidden border-b border-gray-200">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-xl font-bold text-black !text-black" style={{ color: '#000000 !important', WebkitTextFillColor: '#000000' }}>
                {selectedSchool === 'Alliance Academy of Innovation' ? 'AAI' : selectedSchool.split(' ').map(word => word[0]).join('')} Clubs
              </h1>
              <p className="text-sm font-medium mt-1 text-gray-600">
                & Organizations
              </p>
            </div>
            {/* Close button for sidebar */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg bg-white border-2 border-black hover:bg-gray-50 transition-all duration-300"
            >
              <X size={20} className="text-black" />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 overflow-y-auto">
          <button
            onClick={handleHomeClick}
            className="w-full text-left p-3 rounded-lg mb-2 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center">
              <Users size={18} className="mr-3 text-black" />
              <span className="text-black">All Clubs</span>
            </div>
          </button>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
              Categories
            </h3>
            {Object.keys(CategoryColors).map(category => (
              <button
                key={category}
                onClick={() => { setSelectedCategory(category); setSelectedClub(null); }}
                className={`w-full text-left p-2 rounded-lg mb-1 transition-colors ${
                  selectedCategory === category && !selectedClub
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'hover:bg-gray-50 text-black'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={selectedCategory === category && !selectedClub ? 'text-blue-800' : 'text-black'}>{category}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedCategory === category && !selectedClub 
                      ? 'bg-blue-200 text-blue-800' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {clubsByCategory[category]?.length || 0}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-80' : 'lg:ml-0'}`}>
        {/* Topbar - White navigation bar */}
        <div className="w-full bg-white h-[104px] flex items-center justify-between shadow-lg border-b border-gray-200 relative overflow-hidden px-6 z-10">
          
          {/* Left side - Menu and buttons */}
          <div className="flex items-center space-x-3 relative z-10">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-transparent border-2 border-black hover:bg-gray-50 hover:border-gray-600 transition-all duration-200"
            >
              {sidebarOpen ? <X size={20} className="text-black" /> : <Menu size={20} className="text-black" />}
            </button>

            {/* Compare Button */}
            <button
              onClick={handleCompareClick}
              className="px-3 py-2 rounded-lg bg-transparent border-2 border-black hover:bg-gray-50 hover:border-gray-600 transition-all duration-200 text-sm font-medium text-black"
            >
              Compare
            </button>

            {/* Events Button */}
            <button
              onClick={handleEventsClick}
              className="px-3 py-2 rounded-lg bg-transparent border-2 border-black hover:bg-gray-50 hover:border-gray-600 transition-all duration-200 text-sm font-medium text-black"
            >
              Events
            </button>
            {/* About Button */}
            <button
              onClick={handleAboutClick}
              className="px-3 py-2 rounded-lg bg-transparent border-2 border-black hover:bg-gray-50 hover:border-gray-600 transition-all duration-200 text-sm font-medium text-black"
            >
              About
            </button>
            {/* Calendar Button */}
            <button
              onClick={handleCalendarClick}
              className="flex items-center px-3 py-2 rounded-lg bg-transparent border-2 border-black hover:bg-gray-50 hover:border-gray-600 transition-all duration-200 text-sm font-medium text-black"
            >
              <CalendarIcon size={18} className="mr-1 text-black" /> Calendar
            </button>
            
            {/* AI Chatbot Button */}
            <button
              onClick={() => {
                setChatbotOpen(!chatbotOpen);
                if (!hasSeenChatbot) {
                  setHasSeenChatbot(true);
                }
              }}
              className={`flex items-center px-3 py-2 rounded-lg border-2 transition-all duration-200 text-sm font-medium ${
                chatbotOpen 
                  ? 'bg-blue-50 border-blue-600 text-blue-800' 
                  : 'bg-transparent border-black hover:bg-gray-50 hover:border-gray-600 text-black'
              }`}
              title="Get AI-powered club recommendations"
            >
              <MessageCircle size={18} className="mr-1" />
              Club Quiz
              {!hasSeenChatbot && (
                <div className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </button>
            {/* School Selector Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left
                  });
                  setSchoolDropdownOpen(!schoolDropdownOpen);
                }}
                className="flex items-center px-3 py-2 rounded-lg bg-transparent border-2 border-black hover:bg-gray-50 hover:border-gray-600 transition-all duration-200 text-sm font-medium text-black"
              >
                <span className="mr-2">{selectedSchool}</span>
                <ChevronDown size={16} className={`transition-transform duration-200 ${schoolDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {schoolDropdownOpen && createPortal(
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-[9998]" 
                    onClick={() => setSchoolDropdownOpen(false)}
                  />
                  <div 
                    className="fixed w-80 bg-white border-2 border-black rounded-lg shadow-xl z-[9999] max-h-80 overflow-y-auto"
                    style={{
                      top: `${dropdownPosition.top}px`,
                      left: `${dropdownPosition.left}px`,
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#000000 #ffffff'
                    }}
                  >
                    {availableSchools.map(school => (
                      <button
                        key={school}
                        onClick={() => {
                          setSelectedSchool(school);
                          setSchoolDropdownOpen(false);
                          setSelectedCategory(null);
                          setSelectedClub(null);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-black ${
                          selectedSchool === school ? 'bg-blue-50 text-blue-800' : ''
                        }`}
                      >
                        {school}
                      </button>
                    ))}
                  </div>
                </>,
                document.body
              )}
            </div>
          </div>
                    
          {/* Center - Title */}
          <div className="flex-1 text-center relative z-10 px-4">
            <button
              onClick={handleHomeClick}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <h1 className="text-2xl font-bold leading-tight text-black bg-none bg-clip-border" style={{ color: '#000000 !important', WebkitTextFillColor: '#000000' }}>
                The Club Network @ {selectedSchool === 'Alliance Academy of Innovation' ? 'AAI' : selectedSchool.split(' ').map(word => word[0]).join('')}
              </h1>
              <p className="text-sm font-medium mt-1 leading-snug text-gray-600">
                Explore clubs and organizations at {selectedSchool}
              </p>
            </button>
          </div>

          {/* Right side - User menu */}
          {user && (
            <div className="flex items-center relative z-[9999]">
              <UserMenu user={user} />
            </div>
          )}
        </div>

        <div className="p-6">
          {!selectedCategory && !selectedClub ? (
            <>
              {/* Welcome Section with AI Assistant Info */}
              <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-blue-900 mb-2">
                      Welcome to The Club Network! 🎉
                    </h2>
                    <p className="text-blue-800 mb-4">
                      Discover amazing clubs and organizations at {selectedSchool}. Browse by category or take a quiz to find clubs that match your interests!
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-blue-700">
                        <MessageCircle size={16} className="mr-2" />
                        <span className="text-sm font-medium">Club Quiz Ready</span>
                      </div>
                      <div className="flex items-center text-blue-700">
                        <Users size={16} className="mr-2" />
                        <span className="text-sm font-medium">{filteredClubsData.length} Clubs Available</span>
                      </div>
                      <div className="flex items-center text-blue-700">
                        <BarChart3 size={16} className="mr-2" />
                        <span className="text-sm font-medium">{categories.length} Categories</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setChatbotOpen(true);
                      if (!hasSeenChatbot) {
                        setHasSeenChatbot(true);
                      }
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <MessageCircle size={18} className="mr-2 inline" />
                    Take Club Quiz
                  </button>
                </div>
              </div>
              
              <LocalCategoryGrid 
                categories={categories}
                categoryColors={CategoryColors}
                clubsByCategory={clubsByCategory}
                onCategorySelect={setSelectedCategory}
              />
            </>
          ) : selectedCategory && !selectedClub ? (
            <div>
              <button
                onClick={handleHomeClick}
                className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ChevronRight size={20} className="rotate-180 mr-2" />
                Home Page
              </button>
              <div className="bg-none bg-clip-border">
                <h2 className="text-3xl font-bold mb-2 flex items-center !text-black" style={{ color: '#000000 !important' }}>
                  <BookOpen size={28} className="mr-2 !text-black" style={{ color: '#000000 !important' }} />
                  {selectedCategory} Clubs
                </h2>
                <p className="mb-6 !text-black" style={{ color: '#000000 !important' }}>Clubs in the {selectedCategory} category</p>
              </div>
              {/* Category club grid rendering - fix fallback rendering */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.isArray(filteredClubs[selectedCategory]) && filteredClubs[selectedCategory].length > 0 ? (
                  filteredClubs[selectedCategory].map(club => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      categoryColors={CategoryColors}
                      onClick={() => setSelectedClub(club.id)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500">No clubs found in this category.</p>
                  </div>
                )}
              </div>
            </div>
          ) : selectedClubData ? (
            <ClubDetails
              club={selectedClubData}
              categoryColors={CategoryColors}
              onBack={() => setSelectedClub(null)}
            />
          ) : null}
        </div>
      </div>
      
      {/* AI Club Chatbot */}
      <ChatbotUI 
        allClubData={allClubData} 
        isOpen={chatbotOpen}
        onClose={() => setChatbotOpen(false)}
      />
      
      {/* Welcome Notification for AI Assistant */}
      {chatbotOpen && !hasSeenChatbot && (
        <div className="fixed top-20 right-6 bg-white border border-blue-200 rounded-lg shadow-lg p-4 max-w-sm z-50 animate-slideIn">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageCircle size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">Club Quiz Ready! 🎯</h4>
              <p className="text-sm text-gray-600 mb-3">
                Take a quick quiz to discover clubs that match your interests and personality!
              </p>
              <button
                onClick={() => setHasSeenChatbot(true)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Got it, thanks!
              </button>
            </div>
            <button
              onClick={() => setHasSeenChatbot(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Simple Credit */}
      <div className="fixed bottom-0 left-0 right-0 text-center py-2 text-gray-600 text-sm bg-white border-t border-gray-200">
        Designed & Created by Ritvik Tirumala
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ClubsWebsite;