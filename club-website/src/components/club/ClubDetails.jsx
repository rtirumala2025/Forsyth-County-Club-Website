import React from 'react';
import { User, Calendar, Mail } from 'lucide-react';

const ClubDetails = ({ club, CategoryColors }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Club Header */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{club.name}</h1>
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${CategoryColors[club.category] || 'bg-gray-100 text-gray-800'}`}>
              {club.category}
            </span>
          </div>
          <div className="mt-6 lg:mt-0">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
              Join Club
            </button>
          </div>
        </div>
        
        <p className="text-lg text-gray-700 leading-relaxed mb-6">
          {club.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center text-gray-600">
            <User size={20} className="mr-3 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Sponsor(s)</div>
              <div>{club.sponsor}</div>
            </div>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar size={20} className="mr-3 text-blue-600" />
            <div>
              <div className="font-medium text-gray-900">Meeting Info</div>
              <div>Contact sponsor for details</div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Involved</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Join</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Contact the club sponsor</li>
              <li>• Attend a club meeting</li>
              <li>• Fill out membership forms</li>
              <li>• Participate in club activities</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Benefits</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Meet like-minded students</li>
              <li>• Develop leadership skills</li>
              <li>• Build your resume</li>
              <li>• Make a positive impact</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="text-center">
          <Mail size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Ready to Join?</h2>
          <p className="text-blue-100 mb-6">
            Contact the club sponsor to learn more about {club.name} and how to get involved.
          </p>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block">
            <div className="font-semibold">Sponsor: {club.sponsor}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetails;