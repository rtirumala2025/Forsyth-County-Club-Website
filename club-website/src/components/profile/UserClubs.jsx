import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Edit, Check, BookOpen, Palette, Globe, Atom, HeartHandshake, Dumbbell, Mic, Chess, Briefcase, Leaf, User2, Star, Handshake, Music, Football, Smile, Shield, GraduationCap, Group, Trophy, Lightbulb, Code2, Calendar, ArrowLeft, Church } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Map club categories to Lucide icons
const categoryIcons = {
  Academic: BookOpen,
  Arts: Palette,
  Cultural: Globe,
  STEM: Atom,
  Service: HeartHandshake,
  Sports: Dumbbell,
  Music: Music,
  Recreation: Smile,
  Career: Briefcase,
  Awareness: Lightbulb,
  Business: Handshake,
  Religious: Church, // Changed from Bible to Church
  Support: Shield,
  Leadership: Star,
  // fallback
  Default: Users,
};

const UserClubs = ({ allClubs, selectedClubs, editMode, onEdit, onDone }) => {
  const [editSelection, setEditSelection] = useState(selectedClubs);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleToggle = (club) => {
    if (editSelection.some((c) => c.id === club.id)) {
      setEditSelection(editSelection.filter((c) => c.id !== club.id));
    } else {
      setEditSelection([...editSelection, club]);
    }
  };

  const handleDone = () => {
    onDone(editSelection);
  };

  // Reset editSelection if selectedClubs changes (e.g., after save)
  React.useEffect(() => {
    setEditSelection(selectedClubs);
  }, [selectedClubs, editMode]);

  // Helper to get icon for a club
  const getIcon = (club, size = 56) => {
    const Icon = categoryIcons[club.category] || categoryIcons.Default;
    return <Icon size={size} className="text-blue-400 bg-blue-100 rounded-full p-3 shadow-lg" />;
  };

  // Sophisticated search filter
  const filteredClubs = allClubs.filter((club) => {
    const query = search.toLowerCase();
    return (
      club.name.toLowerCase().includes(query) ||
      (club.category && club.category.toLowerCase().includes(query))
    );
  });

  // Helper to highlight search matches
  const highlightMatch = (text) => {
    if (!search) return text;
    const regex = new RegExp(`(${search})`, 'ig');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-yellow-200 text-yellow-900 rounded px-1 font-semibold">{part}</span> : part
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/50 p-12 h-full flex-1 flex flex-col">
      <div className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
          <Users size={28} className="text-blue-500 mr-3" />
          <h3 className="text-2xl font-bold text-gray-900">My Clubs</h3>
        </div>
        {!editMode && (
          <button
            onClick={onEdit}
            className="flex items-center px-3 py-1 rounded-lg border border-blue-400 text-blue-700 font-medium hover:bg-blue-50 transition-all"
          >
            <Edit size={16} className="mr-1" /> Edit
          </button>
        )}
      </div>
      {!editMode ? (
        selectedClubs && selectedClubs.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
            {selectedClubs.map((club) => (
              <li key={club.id} className="flex items-center bg-blue-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all">
                {getIcon(club, 64)}
                <Link
                  to={`/clubs/${club.id}`}
                  className="ml-6 text-blue-700 hover:underline font-semibold text-base truncate max-w-[14rem] leading-tight"
                  title={club.name}
                >
                  {(() => {
                    const words = club.name.split(' ');
                    if (words.length === 1) return words[0];
                    return <span><span>{words[0]}</span><br /><span>{words.slice(1).join(' ')}</span></span>;
                  })()}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 flex-1">You haven't joined any clubs yet.</p>
        )
      ) : (
        <>
          {/* Sophisticated Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clubs by name or category..."
              className="w-full px-5 py-3 rounded-xl border border-blue-300 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg shadow bg-white/70 placeholder-gray-400"
              autoFocus
            />
          </div>
          <div className="flex-1 overflow-y-auto max-h-56 mb-4">
            <ul className="space-y-2">
              {filteredClubs.length > 0 ? filteredClubs.map((club) => (
                <li key={club.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editSelection.some((c) => c.id === club.id)}
                    onChange={() => handleToggle(club)}
                    className="mr-2 accent-blue-500"
                    id={`club-${club.id}`}
                  />
                  <span className="mr-3">{getIcon(club)}</span>
                  <label htmlFor={`club-${club.id}`} className="text-gray-800 cursor-pointer text-base truncate max-w-[14rem] leading-tight">
                    {(() => {
                      const words = club.name.split(' ');
                      if (words.length === 1) return highlightMatch(words[0]);
                      return <span><span>{highlightMatch(words[0])}</span><br /><span>{highlightMatch(words.slice(1).join(' '))}</span></span>;
                    })()}
                    <span className="ml-2 text-xs text-blue-400 font-semibold">{highlightMatch(club.category || '')}</span>
                  </label>
                </li>
              )) : (
                <li className="text-gray-400 italic">No clubs found.</li>
              )}
            </ul>
          </div>
          <button
            onClick={handleDone}
            className="flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow hover:from-blue-600 hover:to-blue-700 transition-all self-end"
          >
            <Check size={18} className="mr-2" /> Done
          </button>
        </>
      )}
    </motion.div>
  );
};

export default UserClubs; 