import React from 'react';

const StatsCard = ({ value, label, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    purple: 'text-purple-600'
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center">
      <div className={`text-4xl font-bold ${colorClasses[color]} mb-2`}>{value}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
};

export default StatsCard;