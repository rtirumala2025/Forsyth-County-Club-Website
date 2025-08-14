import React from 'react';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const UserEvents = ({ events }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-12 h-full flex-1 flex flex-col">
      <div className="flex items-center mb-4">
        <Calendar size={28} className="text-blue-500 mr-3" />
        <h3 className="text-2xl font-bold text-gray-900">My Events</h3>
      </div>
      {events && events.length > 0 ? (
        <ul className="space-y-4">
          {events.map((event) => (
            <li key={event.id} className="text-blue-700 font-bold text-lg">
              {event.title}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">You haven't RSVPed to any events yet.</p>
      )}
    </motion.div>
  );
};

export default UserEvents; 