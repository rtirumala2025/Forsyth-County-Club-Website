import React from 'react';
import AIClubChatbotFixed from './AIClubChatbotFixed';

const ChatbotUI = ({ allClubData, isOpen, onClose }) => {
  return (
    <AIClubChatbotFixed 
      allClubData={allClubData} 
      isOpen={isOpen}
      onClose={onClose}
    />
  );
};

export default ChatbotUI;
