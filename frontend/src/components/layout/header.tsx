import React from 'react';
import { Search, Menu, X, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  searchTerm, 
  setSearchTerm, 
  showSearch = true,
  title = "WFHS Clubs",
  subtitle = "& Organizations"
}) => {
  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
          <p className="text-blue-100 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/about" className="text-white hover:text-yellow-300 font-medium text-lg transition-colors">About</Link>
          <Link to="/calendar" className="flex items-center text-white hover:text-yellow-300 font-medium text-lg transition-colors">
            <CalendarIcon size={20} className="mr-1" /> Calendar
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Header;