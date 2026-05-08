import React, { useState, useEffect } from 'react';
// Added the 'X' icon for closing the modal
import { ChevronRight, MessageCircle, Users, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore'; 
import { fitnessApi } from '@/api/fitnessApi'; 
import type { TrainingGroupDto } from '@/api/types';

export default function Groups() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.isAdmin === true; 

  const [myGroups, setMyGroups] = useState<TrainingGroupDto[]>([]);
  const [discoverGroups, setDiscoverGroups] = useState<TrainingGroupDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch groups on load
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
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

  const handleJoinGroup = async (groupId: string) => {
    try {
      await fitnessApi.joinGroup(groupId); 
      navigate(`/groups/${groupId}`); 
    } catch (error) {
      console.error("Failed to join group", error);
      alert("Could not join the group. Please try again.");
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDesc.trim()) return;

    setIsCreating(true);
    try {
      await fitnessApi.createGroup({
        name: newGroupName,
        description: newGroupDesc
      });
      
      setIsModalOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      
      await fetchGroups(); 
      
    } catch (error) {
      console.error("Failed to create group", error);
      alert("Failed to create the group. Check your backend logs!");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading groups...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-24 relative">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-4 py-5 flex items-center justify-between border-b border-gray-200 shadow-sm">
        <h1 className="text-2xl font-semibold">Training Groups</h1>
        <div className="flex gap-4 text-gray-900">
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="hover:bg-gray-100 p-2 rounded-full transition-colors" 
              aria-label="Create Group"
            >
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
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden shadow-sm">
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
                    <p className="text-sm text-gray-500 truncate">{group.description || 'No description yet.'}</p>
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
              <div key={group.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="text-lg font-medium text-gray-900 mb-1">{group.name}</h3>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>{group.isPublic ? 'Public' : 'Private'}</span>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">{group.description}</p>
                <button 
                  onClick={() => handleJoinGroup(group.id)}
                  className="mt-auto w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-center block"
                >
                  Join Group
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Create New Group</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateGroup} className="p-5 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Morning Runners"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="What is this group about?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all resize-none"
                  required
                />
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newGroupName.trim() || !newGroupDesc.trim()}
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
