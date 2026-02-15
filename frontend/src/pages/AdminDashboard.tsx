import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { useClubs, useCategories, useSchools } from '../hooks/useClubs';
import { isAdmin, getCurrentUserRole, logAdminAction } from '../utils/adminUtils';
import { createAccessibleButton, createAccessibleTable } from '../utils/accessibility';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showClubModal, setShowClubModal] = useState(false);

  // Data hooks
  const { data: clubs, loading: clubsLoading } = useClubs({ pageSize: 100 });
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: schools, loading: schoolsLoading } = useSchools();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const role = await getCurrentUserRole();
        setUserRole(role);

        if (role !== 'admin') {
          // Redirect non-admin users
          window.location.href = '/';
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Handle club actions
  const handleEditClub = (club) => {
    setSelectedClub(club);
    setShowClubModal(true);
    logAdminAction('edit_club', { clubId: club.id, clubName: club.name });
  };

  const handleDeleteClub = async (club) => {
    if (window.confirm(`Are you sure you want to delete "${club.name}"?`)) {
      try {
        // Delete club logic would go here
        console.log('Deleting club:', club.id);
        logAdminAction('delete_club', { clubId: club.id, clubName: club.name });
        // Refresh data
      } catch (error) {
        console.error('Error deleting club:', error);
      }
    }
  };

  const handleViewClub = (club) => {
    logAdminAction('view_club', { clubId: club.id, clubName: club.name });
    // Navigate to club details
  };

  // Export data
  const handleExportData = async (type) => {
    try {
      logAdminAction('export_data', { dataType: type });
      // Export logic would go here
      console.log(`Exporting ${type} data...`);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
          <p className="text-gray-300">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'clubs', label: 'Clubs', icon: BookOpen },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage clubs, users, and system settings</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExportData('clubs')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                {...createAccessibleButton('Export clubs data')}
              >
                <Download size={16} className="mr-2" />
                Export Data
              </button>
              <button
                onClick={() => setShowClubModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                {...createAccessibleButton('Add new club')}
              >
                <Plus size={16} className="mr-2" />
                Add Club
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  {...createAccessibleButton(`${tab.label} tab`)}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Clubs</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {clubsLoading ? '...' : clubs?.clubs?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">Total Users</p>
                      <p className="text-2xl font-bold text-green-900">0</p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Total Events</p>
                      <p className="text-2xl font-bold text-purple-900">0</p>
                    </div>
                  </div>
                </div>
                <div className="bg-orange-50 p-6 rounded-lg">
                  <div className="flex items-center">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-orange-600">Categories</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {categoriesLoading ? '...' : categories?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clubs' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Club Management</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleExportData('clubs')}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    {...createAccessibleButton('Export clubs')}
                  >
                    <Download size={16} className="mr-2" />
                    Export
                  </button>
                  <button
                    onClick={() => setShowClubModal(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    {...createAccessibleButton('Add new club')}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Club
                  </button>
                </div>
              </div>

              {/* Clubs Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" {...createAccessibleTable('Clubs management table')}>
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Club Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clubsLoading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          Loading clubs...
                        </td>
                      </tr>
                    ) : clubs?.clubs?.map((club) => (
                      <tr key={club.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{club.name}</div>
                          <div className="text-sm text-gray-500">{club.sponsor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {club.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {club.school}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${club.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}>
                            {club.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewClub(club)}
                              className="text-blue-600 hover:text-blue-900"
                              {...createAccessibleButton(`View ${club.name}`)}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEditClub(club)}
                              className="text-indigo-600 hover:text-indigo-900"
                              {...createAccessibleButton(`Edit ${club.name}`)}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClub(club)}
                              className="text-red-600 hover:text-red-900"
                              {...createAccessibleButton(`Delete ${club.name}`)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No clubs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
              <p className="text-gray-600">User management features coming soon...</p>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Event Management</h2>
              <p className="text-gray-600">Event management features coming soon...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">System Settings</h2>
              <p className="text-gray-600">System settings coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Club Modal */}
      {showClubModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedClub ? 'Edit Club' : 'Add New Club'}
              </h3>
              <p className="text-gray-600">Club form coming soon...</p>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowClubModal(false);
                    setSelectedClub(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowClubModal(false);
                    setSelectedClub(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {selectedClub ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
