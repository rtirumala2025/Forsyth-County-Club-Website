import React from 'react';
import Chatbot from '../components/Chatbot';

// Full-page Chatbot wrapper so routing stays clean and future layout can be added here
const ChatbotPage = () => {
  return (
    <div className="w-screen h-screen">
      <Chatbot fullPage={true} isOpen={true} onToggle={() => {}} />
    </div>
  );
};

export default ChatbotPage;
