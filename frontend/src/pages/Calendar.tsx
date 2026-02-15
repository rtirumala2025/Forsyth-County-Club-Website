import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Star,
  Plus,
  Filter,
  Grid,
  List,
  CalendarDays
} from 'lucide-react';
import { useSupabaseClubs } from '../hooks/useSupabaseClubs';
import { CategoryColors } from '../utils/constants';
const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState('West Forsyth High School');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: supabaseRecords } = useSupabaseClubs();
  const availableSchools = useMemo(() => {
    if (!supabaseRecords) return [];
    const schools = new Set(supabaseRecords.map(r => (r.school as any)?.name).filter(Boolean));
    return Array.from(schools);
  }, [supabaseRecords]);
  const eventsData = useMemo(() => [
    {
      id: 1,
      title: 'Academic Bowl Championship',
      description: 'Join us for the annual Academic Bowl competition where teams compete in various academic subjects.',
      date: '2024-02-15',
      time: '3:30 PM',
      endTime: '5:30 PM',
      location: 'Room 201 - Main Building',
      organizer: 'Academic Bowl Club',
      category: 'Academic',
      attendees: 24,
      maxAttendees: 30,
      isRegistrationRequired: true,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1523240794102-9ebd172decd7?w=400&h=300&fit=crop',
      tags: ['Competition', 'Academic', 'Team Event'],
      price: 'Free',
      contact: 'academicbowl@school.edu'
    },
    {
      id: 2,
      title: 'Spring Art Exhibition',
      description: 'Showcase of student artwork and creative projects from the Art Club.',
      date: '2024-02-20',
      time: '4:00 PM',
      endTime: '7:00 PM',
      location: 'Art Gallery - Fine Arts Center',
      organizer: 'Art Club',
      category: 'Arts',
      attendees: 45,
      maxAttendees: 50,
      isRegistrationRequired: false,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8a?w=400&h=300&fit=crop',
      tags: ['Exhibition', 'Art', 'Creative'],
      price: 'Free',
      contact: 'artclub@school.edu'
    },
    {
      id: 3,
      title: 'DECA Regional Competition',
      description: 'Regional DECA competition for business and marketing students.',
      date: '2024-02-25',
      time: '8:00 AM',
      endTime: '4:00 PM',
      location: 'Conference Center - Business Hall',
      organizer: 'DECA Club',
      category: 'Business',
      attendees: 18,
      maxAttendees: 20,
      isRegistrationRequired: true,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop',
      tags: ['Competition', 'Business', 'Professional'],
      price: '$15',
      contact: 'deca@school.edu'
    },
    {
      id: 4,
      title: 'Environmental Cleanup Day',
      description: 'Community service event to clean up the school grounds and promote environmental awareness.',
      date: '2024-03-01',
      time: '2:30 PM',
      endTime: '4:30 PM',
      location: 'School Grounds - Meet at Main Entrance',
      organizer: 'Environmental Club',
      category: 'Service',
      attendees: 32,
      maxAttendees: 40,
      isRegistrationRequired: true,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
      tags: ['Community Service', 'Environmental', 'Outdoor'],
      price: 'Free',
      contact: 'environmental@school.edu'
    },
    {
      id: 5,
      title: 'Science Olympiad Practice',
      description: 'Weekly practice session for Science Olympiad team members.',
      date: '2024-03-05',
      time: '3:00 PM',
      endTime: '5:00 PM',
      location: 'Science Lab 3 - Science Building',
      organizer: 'Science Olympiad',
      category: 'STEM',
      attendees: 15,
      maxAttendees: 15,
      isRegistrationRequired: true,
      isFeatured: false,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
      tags: ['Practice', 'Science', 'Competition Prep'],
      price: 'Free',
      contact: 'scienceolympiad@school.edu'
    },
    {
      id: 6,
      title: 'Jazz Band Concert',
      description: 'Spring concert featuring the school jazz band performing classic and contemporary jazz pieces.',
      date: '2024-03-10',
      time: '7:00 PM',
      endTime: '9:00 PM',
      location: 'Auditorium - Performing Arts Center',
      organizer: 'Music Department',
      category: 'Arts',
      attendees: 120,
      maxAttendees: 200,
      isRegistrationRequired: false,
      isFeatured: true,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      tags: ['Concert', 'Music', 'Performance'],
      price: '$5',
      contact: 'music@school.edu'
    }
  ], []);

  const categories = ['All', ...Object.keys(CategoryColors)];

  const filteredEvents = useMemo(() => {
    return eventsData.filter(event => {
      const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory, eventsData]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    while (current <= lastDay || current.getDay() !== 0) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return filteredEvents.filter(event => event.date === dateString);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return time;
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

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
              <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/events')}
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
                    onClick={() => setShowSchoolDropdown(!showSchoolDropdown)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-left flex items-center justify-between hover:bg-gray-100"
                  >
                    <span className="text-gray-900 font-medium">{selectedSchool}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showSchoolDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                      {availableSchools.map((school) => (
                        <button
                          key={school}
                          onClick={() => {
                            setSelectedSchool(school);
                            setShowSchoolDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          {school}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* View Options */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">View Options</h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${viewMode === 'month' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <CalendarDays size={16} className="mr-3" />
                    Month View
                  </button>
                  <button
                    onClick={() => setViewMode('week')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${viewMode === 'week' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <CalendarIcon size={16} className="mr-3" />
                    Week View
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <List size={16} className="mr-3" />
                    List View
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h2>

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

              {/* Selected Date Events */}
              {selectedDate && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {formatDate(selectedDate)} Events
                  </h2>

                  <div className="space-y-3">
                    {selectedDateEvents.length > 0 ? (
                      selectedDateEvents.map(event => (
                        <div key={event.id} className="p-3 bg-gray-50 rounded-lg">
                          <h3 className="font-medium text-gray-900 text-sm">{event.title}</h3>
                          <p className="text-xs text-gray-600">{event.time} - {event.endTime}</p>
                          <p className="text-xs text-gray-600">{event.location}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No events on this date</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Calendar */}
          <div className="flex-1">
            {viewMode === 'month' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900">{getMonthName(currentDate)}</h2>
                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => {
                    const dayEvents = getEventsForDate(day);
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day)}
                        className={`min-h-[120px] p-2 text-left border border-gray-100 hover:border-blue-300 transition-all duration-200 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          } ${isToday(day) ? 'ring-2 ring-blue-500' : ''} ${isSelected(day) ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                      >
                        <div className={`text-sm font-medium mb-1 ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          } ${isToday(day) ? 'text-blue-600' : ''}`}>
                          {day.getDate()}
                        </div>

                        {/* Event Indicators */}
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${CategoryColors[event.category] || 'bg-gray-100 text-gray-800'
                                }`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Events</h2>

                <div className="space-y-4">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                      <div key={event.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon size={20} className="text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock size={12} className="mr-1" />
                              {event.time} - {event.endTime}
                            </span>
                            <span className="flex items-center">
                              <MapPin size={12} className="mr-1" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${CategoryColors[event.category] || 'bg-gray-100 text-gray-800'
                            }`}>
                            {event.category}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
                      <p className="text-gray-600">Try adjusting your filters or add new events.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'week' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="text-center py-12">
                  <CalendarIcon size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Week View</h3>
                  <p className="text-gray-600">Week view coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar; 