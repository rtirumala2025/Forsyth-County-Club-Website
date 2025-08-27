import React from 'react';
import AIClubChatbotFixed from './AIClubChatbotFixed';

const ChatbotUI = ({ allClubData, isOpen, onClose, selectedSchool = null }) => {
  return (
    <AIClubChatbotFixed 
      allClubData={allClubData} 
      isOpen={isOpen}
      onClose={onClose}
      selectedSchool={selectedSchool}
    />
  );
};

export default ChatbotUI;
