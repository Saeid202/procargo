import React, { useState } from 'react';
import { 
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const LegalAssistancePage: React.FC = () => {
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! I\'m your legal assistance AI. I can help you with questions about international trade compliance, customs regulations, and legal requirements for China-Canada trade. How can I assist you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user',
      message: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    // Add bot response (simulated)
    const botResponse = {
      id: chatMessages.length + 2,
      type: 'bot',
      message: generateBotResponse(inputMessage),
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages([...chatMessages, userMessage, botResponse]);
    setInputMessage('');
  };

  const generateBotResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('export') || message.includes('china')) {
      return 'For China exports, you\'ll need a Commercial Invoice, Packing List, Certificate of Origin (if applicable), and Export License for restricted items. The process typically takes 3-5 business days for documentation review.';
    } else if (message.includes('import') || message.includes('canada')) {
      return 'Canada imports require a Bill of Lading, Commercial Invoice in English/French, Packing List, and Import Declaration (B3 Form). Customs clearance usually takes 1-3 business days.';
    } else if (message.includes('customs') || message.includes('documentation')) {
      return 'Essential customs documents include: Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, and Customs Declaration. Always ensure documents are complete and accurate to avoid delays.';
    } else if (message.includes('tariff') || message.includes('duty')) {
      return 'Tariff rates vary by product classification and origin. China-Canada trade may qualify for preferential rates under trade agreements. I recommend consulting our tariff calculator or speaking with a customs specialist.';
    } else if (message.includes('restricted') || message.includes('prohibited')) {
      return 'Certain items are restricted or prohibited in international trade. This includes hazardous materials, endangered species, and items requiring special permits. Please provide specific product details for accurate guidance.';
    } else {
      return 'Thank you for your question. For specific legal advice and detailed compliance requirements, I recommend scheduling a consultation with our legal team or reviewing our legal resources section. I\'m here to provide general guidance only.';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Legal AI Chatbot */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-cargo-100 rounded-lg">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-cargo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Legal AI Assistant</h3>
              <p className="text-sm text-gray-600">Get instant answers to your legal questions about international trade</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Chat Interface */}
          <div className="bg-gray-50 rounded-lg p-4 h-96 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-cargo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.type === 'user' ? 'text-cargo-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about export requirements, customs procedures, or legal compliance..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cargo-500 focus:border-cargo-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-cargo-600 hover:bg-cargo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                <PaperAirplaneIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chatbot Disclaimer */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">AI Legal Assistant Notice</p>
                <p>
                  This AI provides general information and guidance only. It is not a substitute for professional legal advice. 
                  For specific legal matters, please consult with qualified legal professionals or schedule a consultation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistancePage;
