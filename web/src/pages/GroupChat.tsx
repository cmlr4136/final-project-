import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react';
import { fitnessApi } from '@/api/fitnessApi'; 
import { useAuthStore } from '@/stores/authStore';
import type { GroupMessageDto, TrainingGroupDto } from '@/api/types';

export default function GroupChat() {
  const { groupId } = useParams<{ groupId: string }>(); 
  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const isAdmin = currentUser?.isAdmin === true;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;
    try {
      await fitnessApi.leaveGroup(groupId!); 
      navigate('/groups'); 
    } catch (error) {
      alert("Failed to leave group.");
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("WARNING: Are you sure you want to completely DELETE this group?")) return;
    try {
      await fitnessApi.deleteGroup(groupId!);
      navigate('/groups');
    } catch (error) {
      alert("Failed to delete group.");
    }
  };

  const [groupInfo, setGroupInfo] = useState<TrainingGroupDto | null>(null);
  const [messages, setMessages] = useState<GroupMessageDto[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastCreatedAtRef = useRef<string | null>(null);
  
  // Auto-scroll to bottom ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      if (!groupId) return;
      try {
        const info = await fitnessApi.getGroupDetails(groupId);
        const history = await fitnessApi.getGroupMessages(groupId);
        
        setGroupInfo(info);
        setMessages([...history].reverse());
      } catch (error) {
        console.error("Failed to load chat", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchChatData();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    const poll = async () => {
      const lastCreatedAt = lastCreatedAtRef.current;
      if (!lastCreatedAt) return;

      setIsSyncing(true);
      try {
        const incoming = await fitnessApi.getGroupMessages(groupId, { after: lastCreatedAt });
        if (incoming.length === 0) return;

        const normalized = [...incoming].reverse();
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const appended = normalized.filter((m) => !existingIds.has(m.id));
          return appended.length === 0 ? prev : [...prev, ...appended];
        });
      } catch (error) {
        console.error("Failed to sync messages", error);
      } finally {
        setIsSyncing(false);
      }
    };

    const id = window.setInterval(poll, 3000);
    return () => window.clearInterval(id);
  }, [groupId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    lastCreatedAtRef.current = messages[messages.length - 1]?.createdAt ?? null;
  }, [messages]);

  // 3. Save new messages to the backend
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    const messageText = newMessage.trim();
    setNewMessage(''); 
    try {
      const savedMessage = await fitnessApi.sendMessage(groupId, messageText);
      
      // Update the UI with the confirmed message from the server
      setMessages((prev) => [...prev, savedMessage]);
    } catch (error) {
      console.error("Failed to send message", error);
      alert("Failed to send message. Please try again.");
      setNewMessage(messageText); 
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading chat...</div>;
  if (!groupInfo) return <div className="p-8 text-center">Group not found.</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white px-4 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/groups" className="text-gray-900 hover:opacity-70 transition-opacity p-1 -ml-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">{groupInfo.name}</h1>
            <p className="text-sm text-gray-500 leading-tight">{(groupInfo.memberCount ?? 0)} members · {groupInfo.isPublic ? 'Public group' : 'Private group'}</p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-500 hover:text-gray-900 transition-colors p-1 rounded-full" 
            aria-label="Menu"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
              {!isAdmin && (
                <button
                  onClick={handleLeaveGroup}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Leave Group
                </button>
              )}

              {isAdmin && (
                <button
                  onClick={handleDeleteGroup}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Delete Group
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          // Check if this message belongs to the current user
          const isMine = msg.userId === currentUser?.id; 

          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
              {!isMine && (
                <span className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName || 'Unknown User'}</span>
              )}
              
              <div className={`px-4 py-2.5 max-w-[80%] rounded-2xl ${
                  isMine 
                    ? 'bg-gray-900 text-white rounded-tr-sm' 
                    : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm shadow-sm'
                }`}
              >
                <p className="text-[15px] leading-relaxed">{msg.content}</p>
              </div>
              
              <span className={`text-[11px] text-gray-400 mt-1 ${isMine ? 'mr-1' : 'ml-1'}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-100 rounded-full pl-4 pr-1 py-1 border border-gray-200 focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">
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
