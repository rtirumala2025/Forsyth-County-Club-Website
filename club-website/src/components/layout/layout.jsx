import React, { useState } from 'react';
import Header from './header';

const Layout = ({ 
  children, 
  sidebarContent, 
  showSearch = true,
  headerTitle = "WFHS Clubs",
  headerSubtitle = "& Organizations",
  searchTerm = "",
  setSearchTerm = () => {}
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
      <div className="lg:ml-80 min-h-screen">
        <div className="p-8 lg:p-12">
          {children}
        </div>
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