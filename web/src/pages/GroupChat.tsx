import React, { useState } from 'react';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';

// Mock data: In reality, you will fetch this based on the group ID in the URL
const GROUP_INFO = {
  name: 'Leeds Powerlifters',
  members: 24,
};

const INITIAL_MESSAGES = [
  { id: 1, sender: 'Sarah J.', text: 'Anyone hitting the gym at 5 today?', timestamp: '10:15 AM', isMine: false },
  { id: 2, sender: 'You', text: 'Yeah, doing legs.', timestamp: '10:20 AM', isMine: true },
  { id: 3, sender: 'Marcus T.', text: "I'll be there, saving a rack now.", timestamp: '10:25 AM', isMine: false },
];

export default function GroupChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add the new message to the UI instantly
    const newMsgObj = {
      id: Date.now(),
      sender: 'You',
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };

    setMessages([...messages, newMsgObj]);
    setNewMessage('');
    
    // TODO: Send this message to your Kotlin backend here
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      
      {/* Sticky Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Back button (In a real app, wrap this in a <Link> or useNavigate) */}
          <button className="text-gray-900 hover:opacity-70 transition-opacity p-1 -ml-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              {GROUP_INFO.name}
            </h1>
            <p className="text-sm text-gray-500 leading-tight">
              {GROUP_INFO.members} members
            </p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-900 transition-colors p-1">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* Message Feed Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${msg.isMine ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Name (Only show if it's not the user's own message) */}
            {!msg.isMine && (
              <span className="text-xs text-gray-500 mb-1 ml-1">
                {msg.sender}
              </span>
            )}
            
            {/* Message Bubble */}
            <div 
              className={`px-4 py-2.5 max-w-[80%] rounded-2xl ${
                msg.isMine 
                  ? 'bg-gray-900 text-white rounded-tr-sm' // User's messages (Dark Theme)
                  : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm shadow-sm' // Others' messages (Light Theme)
              }`}
            >
              <p className="text-[15px] leading-relaxed">{msg.text}</p>
            </div>
            
            {/* Timestamp */}
            <span className={`text-[11px] text-gray-400 mt-1 ${msg.isMine ? 'mr-1' : 'ml-1'}`}>
              {msg.timestamp}
            </span>
          </div>
        ))}
      </main>

      {/* Sticky Message Input Footer */}
      <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <form 
          onSubmit={handleSendMessage}
          className="flex items-center gap-2 bg-gray-100 rounded-full pl-4 pr-1 py-1 border border-gray-200 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 text-[15px] py-2 placeholder-gray-500"
            autoComplete="off"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gray-900 text-white p-2 rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-5 h-5 ml-0.5" /> 
          </button>
        </form>
      </footer>
      
    </div>
  );
}