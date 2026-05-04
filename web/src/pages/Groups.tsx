import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, MessageCircle, Users, Plus } from 'lucide-react';

const YOUR_GROUPS = [
  { id: 1, name: 'Leeds Powerlifters', lastMessage: "I'll be there, saving a rack now." },
  { id: 2, name: '5 AM Cardio Club', lastMessage: "Great run today everyone!" },
];

const DISCOVER_GROUPS = [
  { 
    id: 3, 
    name: 'Heavy Lifters HQ', 
    members: 45, 
    description: 'Talk about squats, deads, bench, and programming.' 
  },
  { 
    id: 4, 
    name: 'Marathon Prep 2026', 
    members: 112, 
    description: 'Sharing running routes, times, and race day prep!' 
  },
];

export default function Groups() {
  const isAdmin = true;

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Training Groups</h1>
        <div className="flex gap-4 text-gray-900">
          <button className="hover:opacity-70 transition-opacity" aria-label="Search">
            <Search className="w-6 h-6" />
          </button>
          {isAdmin && (
            <button className="hover:opacity-70 transition-opacity" aria-label="Create Group">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      <main className="p-4 space-y-8">
        {/* Your Groups Section */}
        <section>
         <h2 className="text-lg font-medium text-gray-900 mb-3">
            Your Groups:
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
            {YOUR_GROUPS.map((group, index) => (
              <Link 
                key={group.id}
                to={`/groups/${group.id}`}
                className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left ${
                  index !== YOUR_GROUPS.length - 1 ? 'border-b border-gray-200' : ''
                }`}
              >
                <div className="text-gray-500 mr-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{group.lastMessage}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>

        {/* Discover Groups Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-3">
            Discover Groups:
          </h2>
          <div className="space-y-4">
            {DISCOVER_GROUPS.map((group) => (
              <div 
                key={group.id}
                className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-1">{group.name}</h3>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{group.members} members</span>
                </div>
                
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  {group.description}
                </p>
                
                <button className="mt-auto w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-md transition-colors">
                  Join Group
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}