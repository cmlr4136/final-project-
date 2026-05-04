import React, { useState, useEffect } from 'react';
import { ChevronRight, MessageCircle, Users, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// Adjust this import path if your auth store is named differently
import { useAuthStore } from '@/stores/authStore'; 
import { fitnessApi } from '@/api/fitnessApi'; // Assuming you have your API functions here

export default function Groups() {
  const navigate = useNavigate();
  // 1. Check if the current user is an admin
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.isAdmin === true;

  // 2. Set up state for real data instead of hardcoded arrays
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 3. Fetch real groups when the page loads
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Replace these with your actual API calls defined in fitnessApi.ts
        const myGroupsData = await fitnessApi.getMyGroups(); 
        const discoverGroupsData = await fitnessApi.getDiscoverGroups();
        
        setMyGroups(myGroupsData);
        setDiscoverGroups(discoverGroupsData);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  // 4. Handle joining a group dynamically
  const handleJoinGroup = async (groupId: number) => {
    try {
      await fitnessApi.joinGroup(groupId); // Your API call to join
      navigate(`/groups/${groupId}`); // Redirect to the chat room immediately
    } catch (error) {
      console.error("Failed to join group", error);
      alert("Could not join the group. Please try again.");
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading groups...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 py-5 flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-semibold">Training Groups</h1>
        <div className="flex gap-4 text-gray-900">
          {/* SEARCH ICON REMOVED */}
          
          {/* PLUS ICON: Only renders if isAdmin is true */}
          {isAdmin && (
            <button className="hover:opacity-70 transition-opacity" aria-label="Create Group">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>
      </header>

      <main className="p-4 space-y-8">
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Your Groups:</h2>
          {myGroups.length === 0 ? (
            <p className="text-sm text-gray-500">You haven't joined any groups yet.</p>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
              {myGroups.map((group, index) => (
                <Link 
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className={`w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left ${
                    index !== myGroups.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="text-gray-500 mr-4">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{group.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{group.lastMessage || 'No messages yet.'}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Discover Groups:</h2>
          <div className="space-y-4">
            {discoverGroups.map((group) => (
              <div key={group.id} className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{group.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{group.memberCount} members</span>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">{group.description}</p>
                
                {/* Changed from Link to a Button that triggers the Join API call */}
                <button 
                  onClick={() => handleJoinGroup(group.id)}
                  className="mt-auto w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-md transition-colors text-center block"
                >
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