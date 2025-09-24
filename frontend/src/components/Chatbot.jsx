import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { Bot, MessageCircle, Send, X, Loader2 } from 'lucide-react';

// Chatbot component that supports both mini (floating) and full-page modes.
// Props:
// - fullPage: boolean (render full-page layout)
// - isOpen: boolean (for mini mode visibility)
// - onToggle: function (open/close handler for mini mode)
// - className: optional additional classes
export default function Chatbot({
  fullPage = false,
  isOpen = true,
  onToggle = () => {},
  className = '',
}) {
  // API config
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  // Messages structure: { id, type: 'user' | 'bot', text, ts }
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  // UX states
  const [loading, setLoading] = useState(false);

  // Mini mode state
  const [miniState, setMiniState] = useState(() => {
    const saved = localStorage.getItem('chatbot-mini-state-v2');
    return saved
      ? JSON.parse(saved)
      : { width: 360, height: 520, x: null, y: null };
  });

  // Accessibility refs
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Session data for backend; can be enriched via props or user profile
  const [sessionData, setSessionData] = useState({
    interests: [],
    experience_types: [],
    clubs_viewed: [],
    query_history: [],
  });

  // Dynamic suggestions based on the latest bot response
  const suggestions = useMemo(() => {
    // Get suggestions from the latest bot message if available
    const lastBotMessage = messages.filter(m => m.type === 'bot').pop();
    if (lastBotMessage && lastBotMessage.suggestions && lastBotMessage.suggestions.length > 0) {
      return lastBotMessage.suggestions;
    }
    
    // Fallback to conversation state-based suggestions
    const isErrorState = lastBotMessage && (
      lastBotMessage.text.includes('Sorry') || 
      lastBotMessage.text.includes('trouble') ||
      lastBotMessage.text.includes('restart')
    );
    
    if (isErrorState) {
      return ['🔄 Restart'];
    }
    
    if (!sessionData.school) {
      return [
        'East Forsyth High School',
        'West Forsyth High School', 
        'North Forsyth High School',
        'South Forsyth High School',
        'Lambert High School',
        'Denmark High School',
      ];
    }
    
    if (sessionData.school && !sessionData.grade) {
      return ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
    }
    
    if (sessionData.school && sessionData.grade) {
      return [
        'STEM clubs',
        'Arts and creativity',
        'Leadership opportunities', 
        'Sports and fitness',
        'Community service',
        'Academic clubs',
      ];
    }
    
    return [];
  }, [sessionData.school, sessionData.grade, messages]);

  // Persist mini window size/position
  useEffect(() => {
    localStorage.setItem('chatbot-mini-state-v2', JSON.stringify(miniState));
  }, [miniState]);

  // Auto-scroll to latest message when messages change
  // Fixes issue #5: Always scroll to the newest message for better UX.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  // Initialize with a friendly welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: Date.now(),
          type: 'bot',
          text:
            '🏫 Welcome to the Forsyth County Club Recommender! I\'ll help you find the perfect clubs at your high school. Which high school do you attend?',
          ts: new Date().toISOString(),
        },
      ]);
    }
  }, [messages.length]);

  // Utility: Add message with timestamp
  const pushMessage = (type, text, extra = {}) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type,
        text,
        ts: new Date().toISOString(),
        clubs: extra.clubs || [],
        suggestions: extra.suggestions || [],
      },
    ]);
  };

  // Format time for timestamps beneath bubbles (improves readability)
  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Core: send a query to the backend
  const sendToBackend = async (userQuery) => {
    const query = (userQuery || '').trim();
    if (!query) return;
    setLoading(true);
    pushMessage('user', query);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: query,
          sessionData: sessionData,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.message) {
        // Parse JSON response if the message is JSON formatted
        let botResponse;
        try {
          const jsonResponse = JSON.parse(data.message);
          botResponse = {
            text: jsonResponse.message,
            clubs: jsonResponse.clubs || [],
            suggestions: jsonResponse.suggestions || []
          };
        } catch (e) {
          // Fallback to plain text if not JSON
          botResponse = { text: data.message, clubs: [], suggestions: [] };
        }

        pushMessage('bot', botResponse.text, { clubs: botResponse.clubs, suggestions: botResponse.suggestions });

        // Update session data if provided
        if (data.sessionData) {
          setSessionData(data.sessionData);
        }
      } else {
        pushMessage('bot', 'Sorry, I encountered an issue. Please try again.');
      }
    } catch (error) {
      console.error('Chat request failed:', error);
      pushMessage(
        'bot',
        'Sorry, I could not connect to the server. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handles typed input submission
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const query = input.trim();
    if (!query || loading) return;
    setInput('');
    sendToBackend(query);
  };

  // Handles suggestion click (ensures trimmed query; solves issue #7)
  const handleSuggestion = (s) => {
    if (!s) return;
    
    // Handle restart command specially
    if (s.includes('🔄 Restart') || s.toLowerCase().includes('restart')) {
      setInput('');
      sendToBackend('restart');
      return;
    }
    
    // Clear input (UX polish) and send trimmed suggestion
    setInput('');
    sendToBackend(s.trim());
  };

  // Accessibility: Basic focus trap for mini container
  const handleKeyDownTrap = (e) => {
    if (fullPage) return; // Trap only in mini mode
    if (e.key === 'Tab' && containerRef.current) {
      const focusable = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Arrow-key nudge (10px per press) in mini mode; satisfies requirement #4
    if (!fullPage && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      setMiniState((s) => {
        const step = 10;
        let { x = window.innerWidth - (s.width + 24), y = window.innerHeight - (s.height + 24) } = s;
        if (e.key === 'ArrowUp') y = Math.max(0, y - step);
        if (e.key === 'ArrowDown') y = Math.min(window.innerHeight - s.height, y + step);
        if (e.key === 'ArrowLeft') x = Math.max(0, x - step);
        if (e.key === 'ArrowRight') x = Math.min(window.innerWidth - s.width, x + step);
        return { ...s, x, y };
      });
    }
  };

  // Visible input text fix (addresses issue #2)
  const inputClasses =
    'w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

  // Chat bubble styling (addresses issue #1: poor message rendering)
  const Bubble = ({ type, text, ts }) => {
    const isUser = type === 'user';
    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
        <div
          className={[
            'max-w-[80%] rounded-2xl px-4 py-2 shadow-sm',
            isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900',
          ].join(' ')}
          role="text"
          aria-live={isUser ? 'off' : 'polite'}
        >
          <div className="whitespace-pre-wrap leading-relaxed">{text}</div>
          <div
            className={[
              'mt-1 text-xs',
              isUser ? 'text-blue-100/90' : 'text-gray-500',
            ].join(' ')}
          >
            {formatTime(ts)}
          </div>
        </div>
      </div>
    );
  };

  const ChatBody = (
    <div className="flex flex-col h-full">
      {/* Header: draggable handle in mini mode; accessible label */}
      <div
        className={[
          'flex items-center justify-between p-3 border-b',
          'bg-blue-600 text-white',
          fullPage ? 'rounded-none' : 'rounded-t-lg chatbot-drag-handle cursor-move',
        ].join(' ')}
        aria-label="Chat header"
      >
        <div className="flex items-center gap-2">
          <Bot size={18} />
          <span className="font-semibold">Club Recommender</span>
        </div>
        {!fullPage && (
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Close chat"
            title="Close"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Messages area: improved spacing, fonts, and auto-scroll behavior (fixes #1, #5) */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 bg-white"
        role="log"
        aria-live="polite"
      >
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id}>
              <Bubble type={m.type} text={m.text} ts={m.ts} />
              {m.clubs && m.clubs.length > 0 && (
                <div className="mt-2 space-y-2">
                  {m.clubs.map((club, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3 ml-4">
                      <h4 className="font-semibold text-blue-900">{club.name}</h4>
                      <p className="text-sm text-gray-700 mt-1">{club.description}</p>
                      <div className="mt-2 text-xs text-gray-600">
                        <p><strong>Sponsor:</strong> {club.sponsor}</p>
                        <p><strong>Category:</strong> {club.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions: trimmed and sent to backend; resolves #3/#7 */}
      {suggestions?.length > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-t">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-xs sm:text-sm px-3 py-1 rounded-full border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={`Ask about ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Composer: input and send button with visible text (fixes #2) */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t rounded-b-lg"
        aria-label="Message composer"
      >
        <div className="flex items-center gap-2">
          <MessageCircle size={18} className="text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            className={inputClasses}
            placeholder="Type your message…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={[
              'inline-flex items-center justify-center px-3 py-2 rounded-md',
              'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
            ].join(' ')}
            aria-label="Send message"
            title="Send"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </form>
    </div>
  );

  if (fullPage) {
    // Full-page layout retains all UX improvements while not needing drag/resize.
    return (
      <div className="w-screen h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {ChatBody}
        </div>
      </div>
    );
  }

  // Mini floating chat toggle button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={[
          'fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white',
          'shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
          'flex items-center justify-center z-50',
          className,
        ].join(' ')}
        aria-label="Open chat"
      >
        <MessageCircle size={22} />
      </button>
    );
  }

  // Mini floating chat with draggable/resizable (fixes #4)
  return (
    <Rnd
      size={{ width: miniState.width, height: miniState.height }}
      position={{
        x:
          miniState.x ??
          Math.max(16, window.innerWidth - (miniState.width + 16)),
        y:
          miniState.y ??
          Math.max(16, window.innerHeight - (miniState.height + 16)),
      }}
      onDragStop={(e, d) => setMiniState((s) => ({ ...s, x: d.x, y: d.y }))}
      onResizeStop={(e, dir, ref, delta, pos) =>
        setMiniState({
          width: parseInt(ref.style.width, 10),
          height: parseInt(ref.style.height, 10),
          x: pos.x,
          y: pos.y,
        })
      }
      minWidth={320}
      minHeight={360}
      maxWidth={Math.floor(window.innerWidth * 0.9)}
      maxHeight={Math.floor(window.innerHeight * 0.9)}
      bounds="window"
      dragHandleClassName="chatbot-drag-handle"
      className={`fixed z-50 ${className}`}
      enableResizing={{ bottomRight: true, right: true, bottom: true }}
    >
      <div
        ref={containerRef}
        tabIndex={0}
        role="dialog"
        aria-label="Smart Club Recommender"
        onKeyDown={handleKeyDownTrap}
        className="bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col w-full h-full outline-none"
      >
        {ChatBody}
      </div>
    </Rnd>
  );
}
