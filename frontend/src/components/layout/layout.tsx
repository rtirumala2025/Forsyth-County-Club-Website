import React, { useState } from 'react';
import Header from './header';

const Layout = ({
  children,
  sidebarContent,
  showSearch = true,
  headerTitle = "WFHS Clubs",
  headerSubtitle = "& Organizations",
  searchTerm = "",
  setSearchTerm = () => { }
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Header Component */}
          <Header
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showSearch={showSearch}
            title={headerTitle}
            subtitle={headerSubtitle}
          />

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen flex flex-col">
        <div className="flex-1 p-8 lg:p-12">
          {children}
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-slate-800 via-blue-900 to-indigo-900 text-white py-6 px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <p className="text-lg font-semibold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Crafted with passion by Ritvik Tirumala
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Established 2025  Building the future of student connections
                </p>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="text-2xl"></span>
                <span className="text-sm font-medium">Powered by React & AI</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;