import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Users, Calendar, MapPin, Star, Award, Heart, Lightbulb, Building, Globe } from 'lucide-react';
import { allClubData, getAvailableSchools } from '../data/clubData';

const About = () => {
  const navigate = useNavigate();
  const availableSchools = getAvailableSchools() || [];
  const totalClubs = allClubData?.reduce((total, school) => 
    total + (school.clubs || school.club || []).length, 0
  ) || 0;
  const totalCategories = new Set(allClubData?.flatMap(school => 
    (school.clubs || school.club || []).map(club => club.category)
  ) || []).size;
  const stats = [
    {
      icon: Building,
      number: availableSchools.length,
      label: 'High Schools',
      description: 'Comprehensive coverage across Forsyth County'
    },
    {
      icon: Users,
      number: `${totalClubs}+`,
      label: 'Active Clubs',
      description: 'Diverse organizations covering all interests'
    },
    {
      icon: Calendar,
      number: '500+',
      label: 'Events Yearly',
      description: 'Regular meetings, competitions, and activities'
    },
    {
      icon: MapPin,
      number: totalCategories,
      label: 'Categories',
      description: 'From Academic to Sports and everything in between'
    }
  ];
  const features = [
    {
      icon: Heart,
      title: 'Community Building',
      description: 'Fostering connections and friendships among students across all Forsyth County high schools.'
    },
    {
      icon: Award,
      title: 'Leadership Development',
      description: 'Providing opportunities for students to develop leadership and organizational skills.'
    },
    {
      icon: Lightbulb,
      title: 'Skill Enhancement',
      description: 'Helping students explore passions and develop new talents outside the classroom.'
    },
    {
      icon: Globe,
      title: 'County-Wide Network',
      description: 'Connecting students across different schools and building a stronger community.'
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-white border-b border-white/50 backdrop-blur-sm relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-blob animation-delay-2000"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center text-yellow-800 hover:text-yellow-600 transition-colors"
              >
                <ChevronLeft size={24} className="mr-2" />
                Back to Clubs
              </button>
            </div>
            <h1 className="text-3xl font-bold text-yellow-800 drop-shadow-sm">About The Club Network @FCS</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-8 text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to The Forsyth County Club Network</h2>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Discover the vibrant community of clubs and organizations across all high schools in Forsyth County. 
              From academic excellence to creative expression, there's something for every student.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full inline-block hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              <span className="font-semibold">Explore Clubs Across All Schools!</span>
            </button>
          </div>
        </div>
        {/* Stats Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our County-Wide Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
                    <stat.icon size={24} className="text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-700 mb-2">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Schools Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Participating Schools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableSchools.map((schoolName, index) => {
              const schoolData = allClubData.find(school => school.school === schoolName);
              const clubCount = schoolData ? (schoolData.clubs?.length || schoolData.club?.length || 0) : 0;
              return (
                <button
                  key={index}
                  onClick={() => navigate('/')}
                  className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 p-6 text-left hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex-shrink-0">
                      <Building size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{schoolName}</h4>
                      <p className="text-sm text-blue-600 mb-2">Cumming, GA</p>
                      <p className="text-sm text-gray-600 mb-3">
                        {clubCount} active clubs and organizations
                      </p>
                      <div className="text-xs text-blue-500 font-medium">
                        Click to explore clubs →
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {/* Features Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Join a Club?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/50 p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex-shrink-0">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Mission Statement */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4 text-center">Our Mission</h3>
            <p className="text-lg text-center max-w-4xl mx-auto leading-relaxed">
              To provide every student across Forsyth County with opportunities to explore their interests, 
              develop leadership skills, and build lasting connections through meaningful extracurricular activities. 
              We believe that involvement in clubs and organizations is essential for personal growth, academic success, 
              and building a stronger, more connected community across all our high schools.
            </p>
          </div>
        </div>
        {/* Contact Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Get Involved</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">How to Join</h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Select your school from the dropdown menu</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Browse clubs by category on our main page</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Contact the club sponsor for meeting times</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Attend a meeting to learn more</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Complete any required registration forms</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h4>
              <div className="space-y-3 text-gray-600">
                <p>If you have questions about clubs or need assistance getting started, please contact your school's activities office:</p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">Forsyth County Schools</p>
                  <p>Student Activities Department</p>
                  <p>Email: activities@forsyth.k12.ga.us</p>
                  <p>Phone: (770) 781-6600</p>
                  <p className="text-sm mt-2">Or contact your individual school's activities office</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};
export default About; 