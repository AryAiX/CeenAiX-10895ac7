import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Search, Users, AlertCircle, Plus, X, CheckCircle } from 'lucide-react';
import { GeometricBackground } from '../components/GeometricBackground';

interface SearchResult {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  uae_id_number: string;
}

interface FamilyLink {
  linked_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  relationship: string;
}

const relationshipOptions = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Grandparent',
  'Grandchild',
  'Other Relative',
];

export const LinkFamily: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [linkedMembers, setLinkedMembers] = useState<FamilyLink[]>([]);
  const [selectedRelationship, setSelectedRelationship] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setSearching(true);
    setError('');
    setSearchResults([]);

    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error: searchError } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, email, uae_id_number')
        .or(`email.ilike.%${searchTerm}%,uae_id_number.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
        .neq('user_id', user.id)
        .limit(10);

      if (searchError) throw searchError;

      setSearchResults(data || []);
      if (!data || data.length === 0) {
        setError('No users found matching your search');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleAddLink = async (result: SearchResult) => {
    const relationship = selectedRelationship[result.user_id];
    if (!relationship) {
      setError('Please select a relationship type');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not authenticated');

      const { error: linkError } = await supabase.from('family_links').insert({
        user_id: user.id,
        linked_user_id: result.user_id,
        relationship,
      });

      if (linkError) throw linkError;

      setLinkedMembers([
        ...linkedMembers,
        {
          linked_user_id: result.user_id,
          first_name: result.first_name,
          last_name: result.last_name,
          email: result.email,
          relationship,
        },
      ]);

      setSearchResults(searchResults.filter((r) => r.user_id !== result.user_id));
      setSuccess(`${result.first_name} ${result.last_name} added to your family network`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add family member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLink = async (linkedUserId: string) => {
    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('User not authenticated');

      const { error: deleteError } = await supabase
        .from('family_links')
        .delete()
        .eq('user_id', user.id)
        .eq('linked_user_id', linkedUserId);

      if (deleteError) throw deleteError;

      setLinkedMembers(linkedMembers.filter((m) => m.linked_user_id !== linkedUserId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove family member');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    const redirectPath = userProfile?.role === 'doctor' ? '/doctor/profile' : '/patient/profile';
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ceenai-cyan/10 via-white to-ceenai-blue/10 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <GeometricBackground />
      <div className="w-full max-w-3xl relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
              alt="CeenAiX Logo"
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent">
            Link Family Members
          </h1>
          <p className="text-gray-700 mt-2">
            Connect with family members to share medical history and information
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-ceenai-cyan/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Search Section */}
          <form onSubmit={handleSearch} className="mb-8">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Search for Family Members
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or Emirates ID"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                />
              </div>
              <button
                type="submit"
                disabled={searching || !searchTerm.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue hover:from-ceenai-cyan-dark hover:to-ceenai-blue-dark shadow-lg hover:shadow-xl disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {searching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Search Results</h3>
              <div className="space-y-3">
                {searchResults.map((result) => (
                  <div
                    key={result.user_id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-ceenai-cyan/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {result.first_name} {result.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{result.email}</p>
                        {result.uae_id_number && (
                          <p className="text-xs text-gray-500 mt-1">ID: {result.uae_id_number}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedRelationship[result.user_id] || ''}
                          onChange={(e) =>
                            setSelectedRelationship({
                              ...selectedRelationship,
                              [result.user_id]: e.target.value,
                            })
                          }
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                        >
                          <option value="">Select relationship</option>
                          {relationshipOptions.map((rel) => (
                            <option key={rel} value={rel}>
                              {rel}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAddLink(result)}
                          disabled={loading || !selectedRelationship[result.user_id]}
                          className="p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                          title="Add to family"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Family Members */}
          {linkedMembers.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-3">
                <Users className="w-5 h-5 text-ceenai-cyan" />
                <h3 className="text-sm font-semibold text-gray-900">Linked Family Members</h3>
              </div>
              <div className="space-y-2">
                {linkedMembers.map((member) => (
                  <div
                    key={member.linked_user_id}
                    className="p-3 bg-gradient-to-r from-ceenai-cyan/10 to-ceenai-blue/10 border border-ceenai-cyan/30 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {member.first_name} {member.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {member.relationship} • {member.email}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveLink(member.linked_user_id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remove link"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleFinish}
              className="flex-1 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue hover:from-ceenai-cyan-dark hover:to-ceenai-blue-dark shadow-lg hover:shadow-xl text-white font-medium py-3 rounded-lg transition-colors"
            >
              {linkedMembers.length > 0 ? 'Continue to Profile' : 'Skip & Go to Profile'}
            </button>
          </div>

          <p className="text-center text-gray-600 text-xs mt-6">
            You can add or remove family members anytime from your profile settings
          </p>
        </div>
      </div>
    </div>
  );
};
