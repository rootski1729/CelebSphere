'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { aiApi, celebrityApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CelebritySignupPage() {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated || user?.role !== 'celebrity') {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">Only celebrity accounts can create profiles.</p>
      </div>
    );
  }

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      const response = await aiApi.discoverCelebrity(description.trim());
      setSuggestions(response.suggestions);
      toast.success(`Found ${response.total_found} celebrity matches!`);
    } catch (error) {
      toast.error('Failed to discover celebrities');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCelebrity = async (suggestion: any) => {
    setCreating(suggestion.name);
    try {
      await celebrityApi.createFromAi(suggestion);
      toast.success(`Profile created for ${suggestion.name}!`);
      router.push('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create profile';
      toast.error(message);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Your Celebrity Profile
        </h1>
        <p className="text-gray-600">
          Use AI to discover and create your professional celebrity profile
        </p>
      </div>
      
      {/* AI Discovery Form */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-center">AI Celebrity Discovery</h2>
          <p className="text-center text-gray-600">
            Describe yourself and let AI find the perfect matches
          </p>
        </div>
        <div className="px-6 py-4">
          <form onSubmit={handleDiscover} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Describe yourself as a celebrity
              </label>
              <input
                type="text"
                placeholder="e.g., Punjabi singer from India who performed at Coachella"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Discovering...
                </>
              ) : (
                '🔍 Discover Celebrities'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">AI Suggestions</h3>
          <div className="grid gap-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-semibold">{suggestion.name}</h4>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {Math.round(suggestion.confidence_score * 100)}% match
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{suggestion.category} • {suggestion.country}</p>
                      <p className="text-sm text-gray-700 mb-3">{suggestion.bio}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center">
                          👥 {(suggestion.estimated_fanbase / 1000000).toFixed(1)}M fans
                        </div>
                        {suggestion.genres && suggestion.genres.length > 0 && (
                          <div>Genres: {suggestion.genres.join(', ')}</div>
                        )}
                      </div>
                      
                      {suggestion.notable_works && suggestion.notable_works.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium">Notable works: </span>
                          <span className="text-sm text-gray-600">
                            {suggestion.notable_works.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <button
                        onClick={() => handleSelectCelebrity(suggestion)}
                        disabled={creating === suggestion.name}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        {creating === suggestion.name ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating...
                          </>
                        ) : (
                          '✨ Select This Profile'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}