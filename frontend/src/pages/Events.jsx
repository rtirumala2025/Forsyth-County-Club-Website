import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Filter,
  Grid,
  List,
  CalendarDays,
  Star,
  Eye,
  Share2,
  Bookmark,
  BookmarkPlus,
  X,
  CalendarIcon
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { allClubData, getClubsBySchool, getAvailableSchools } from '../data/clubData';
import { CategoryColors } from '../utils/constants';

const Events = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedSchool, setSelectedSchool] = useState('West Forsyth High School');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('date');
  const [bookmarkedEvents, setBookmarkedEvents] = useState(new Set());
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [events, setEvents] = useState([]);

  // Add Event Form State
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    location: '',
    organizer: '',
    category: '',
    maxAttendees: '',
    isRegistrationRequired: false,
    isFeatured: false,
    price: 'Free',
    contact: '',
    tags: []
  });

  // Get available schools
  const availableSchools = getAvailableSchools();

  // Get clubs for selected school
  const filteredClubsData = getClubsBySchool(selectedSchool);

  const months = [
    'All', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const categories = ['All', ...Object.keys(CategoryColors)];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'popularity', label: 'Popularity' }
  ];

  const filteredEvents = useMemo(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      
      const eventMonth = new Date(event.date).toLocaleString('default', { month: 'long' });
      const matchesMonth = selectedMonth === 'All' || eventMonth === selectedMonth;
      
      return matchesSearch && matchesCategory && matchesMonth;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'popularity':
          return (b.attendees / b.maxAttendees) - (a.attendees / a.maxAttendees);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedMonth, sortBy, events]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFullDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMonthFromDate = (dateString) => {
    return new Date(dateString).toLocaleString('default', { month: 'long' });
  };

  const groupedEvents = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach(event => {
      const month = getMonthFromDate(event.date);
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
    setShowSchoolDropdown(false);
  };

  const handleAddEvent = () => {
    setShowAddEventModal(true);
  };

  const handleCloseModal = () => {
    setShowAddEventModal(false);
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      endTime: '',
      location: '',
      organizer: '',
      category: '',
      maxAttendees: '',
      isRegistrationRequired: false,
      isFeatured: false,
      price: 'Free',
      contact: '',
      tags: []
    });
  };
  const handleSubmitEvent = (e) => {
    e.preventDefault();
    const newEvent = {
      id: Date.now(),
      ...eventForm,
      attendees: 0,
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop', // Default image
      tags: eventForm.tags.length > 0 ? eventForm.tags : ['New Event']
    };
    setEvents(prev => [...prev, newEvent]);
    handleCloseModal();
  };
  const handleInputChange = (field, value) => {
    setEventForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleTagsChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setEventForm(prev => ({
      ...prev,
      tags
    }));
  };
  const toggleBookmark = (eventId) => {
    const newBookmarked = new Set(bookmarkedEvents);
    if (newBookmarked.has(eventId)) {
      newBookmarked.delete(eventId);
    } else {
      newBookmarked.add(eventId);
    }
    setBookmarkedEvents(newBookmarked);
  };
  const getEventStatus = (event) => {
    const now = new Date();
    const eventDate = new Date(event.date);
    const isPast = eventDate < now;
    const isFull = event.attendees >= event.maxAttendees;
    if (isPast) return { text: 'Past Event', color: 'bg-gray-100 text-gray-600' };
    if (isFull) return { text: 'Full', color: 'bg-red-100 text-red-700' };
    if (event.isRegistrationRequired) return { text: 'Registration Required', color: 'bg-yellow-100 text-yellow-700' };
    return { text: 'Open', color: 'bg-green-100 text-green-700' };
  };
  const EventCard = ({ event }) => {
    const status = getEventStatus(event);
    const isBookmarked = bookmarkedEvents.has(event.id);
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${CategoryColors[event.category] || 'bg-gray-100 text-gray-800'}`}>
              {event.category}
            </span>
          </div>
          {/* Featured Badge */}
          {event.isFeatured && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900 flex items-center">
                <Star size={12} className="mr-1" />
                Featured
              </span>
            </div>
          )}
          {/* Bookmark Button */}
          <button
            onClick={() => toggleBookmark(event.id)}
            className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1.5 transition-colors"
          >
            {isBookmarked ? (
              <BookmarkPlus size={16} className="text-blue-600" />
            ) : (
              <Bookmark size={16} className="text-gray-600" />
            )}
          </button>
        </div>
        {/* Content Section */}
        <div className="p-6">
          {/* Title and Status */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 mr-3">
              {event.title}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.text}
            </span>
          </div>
          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar size={14} className="mr-2 flex-shrink-0" />
              <span>{formatFullDate(event.date)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={14} className="mr-2 flex-shrink-0" />
              <span>{event.time} - {event.endTime}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={14} className="mr-2 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users size={14} className="mr-2 flex-shrink-0" />
              <span>{event.attendees}/{event.maxAttendees} attendees</span>
            </div>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
          {/* Price and Organizer */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">
              {event.price}
            </span>
            <span className="text-sm text-gray-500">
              by {event.organizer}
            </span>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
              <Eye size={16} className="mr-2" />
              View Details
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };
  const EventListItem = ({ event }) => {
    const status = getEventStatus(event);
    const isBookmarked = bookmarkedEvents.has(event.id);
    
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 p-6">
        <div className="flex gap-6">
          {/* Image */}
          <div className="relative w-32 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            {event.isFeatured && (
              <div className="absolute top-1 right-1">
                <Star size={12} className="text-yellow-400 fill-current" />
              </div>
            )}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate mr-3">
                {event.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  {status.text}
                </span>
                <button
                  onClick={() => toggleBookmark(event.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkPlus size={16} className="text-blue-600" />
                  ) : (
                    <Bookmark size={16} />
                  )}
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {event.description}
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                {formatDate(event.date)}
              </div>
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                {event.time}
              </div>
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {event.location}
              </div>
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                {event.attendees}/{event.maxAttendees}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">{event.price}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">by {event.organizer}</span>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft size={20} className="mr-1" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Events</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleAddEvent}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus size={16} className="mr-2" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* School Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select School</h2>
                
                <div className="relative">
                  <button
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX
                      });
                      setShowSchoolDropdown(!showSchoolDropdown);
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-left flex items-center justify-between hover:bg-gray-100"
                  >
                    <span className="text-gray-900 font-medium">{selectedSchool}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showSchoolDropdown && createPortal(
                    <div className="fixed inset-0 z-50" onClick={() => setShowSchoolDropdown(false)}>
                      <div 
                        className="absolute bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                        style={{
                          top: dropdownPosition.top,
                          left: dropdownPosition.left,
                          minWidth: '300px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {availableSchools.map((school) => (
                          <button
                            key={school}
                            onClick={() => handleSchoolSelect(school)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            {school}
                          </button>
                        ))}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              </div>
              {/* Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Events</h2>
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
                  />
                </div>
              </div>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* View Options */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">View Options</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Grid size={16} className="mr-3" />
                    Grid View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <List size={16} className="mr-3" />
                    List View
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                      viewMode === 'calendar' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <CalendarDays size={16} className="mr-3" />
                    Calendar View
                  </button>
                </div>
              </div>
              {/* Results Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {filteredEvents.length}
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    event{filteredEvents.length !== 1 ? 's' : ''} found
                  </div>
                  {bookmarkedEvents.size > 0 && (
                    <div className="text-sm text-blue-600">
                      {bookmarkedEvents.size} bookmarked
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Main Content */}
          <div className="flex-1">
            {/* Events Display */}
            {viewMode === 'calendar' ? (
              // Calendar View
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                  <CalendarDays size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View</h3>
                  <p className="text-gray-600">Calendar view coming soon!</p>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              // List View
              <div className="space-y-4">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => (
                    <EventListItem key={event.id} event={event} />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
                    <p className="text-gray-600">Add your first event using the "Add Event" button!</p>
                  </div>
                )}
              </div>
            ) : (
              // Grid View
              <div className="space-y-8">
                {Object.keys(groupedEvents).length > 0 ? (
                  Object.entries(groupedEvents).map(([month, events]) => (
                    <div key={month}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">{month} Events</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {events.map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
                    <p className="text-gray-600">Add your first event using the "Add Event" button!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add Event Modal */}
      {showAddEventModal && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Add New Event</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmitEvent} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={eventForm.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="">Select category</option>
                    {categories.filter(cat => cat !== 'All').map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  required
                  value={eventForm.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Describe your event..."
                />
              </div>
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={eventForm.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                  <input
                    type="time"
                    required
                    value={eventForm.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
              {/* Location and Organizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Event location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organizer *</label>
                  <input
                    type="text"
                    required
                    value={eventForm.organizer}
                    onChange={(e) => handleInputChange('organizer', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Event organizer"
                  />
                </div>
              </div>
              {/* Capacity and Registration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={eventForm.maxAttendees}
                    onChange={(e) => handleInputChange('maxAttendees', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Maximum number of attendees"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <input
                    type="text"
                    value={eventForm.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Free, $10, etc."
                  />
                </div>
              </div>
              {/* Contact and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                  <input
                    type="email"
                    value={eventForm.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="contact@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={eventForm.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={eventForm.isRegistrationRequired}
                    onChange={(e) => handleInputChange('isRegistrationRequired', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Registration Required</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={eventForm.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Event</span>
                </label>
              </div>
              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
export default Events; 