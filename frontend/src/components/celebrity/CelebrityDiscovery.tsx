'use client';

import React, { useState } from 'react';
import { CelebritySuggestion } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { aiApi, celebrityApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { formatNumber } from '@/lib/utils';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface CelebrityDiscoveryProps {
  onProfileCreated?: () => void;
}

export function CelebrityDiscovery({ onProfileCreated }: CelebrityDiscoveryProps) {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<CelebritySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const { user } = useAuth();

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

  const handleSelectCelebrity = async (suggestion: CelebritySuggestion) => {
    if (user?.role !== 'celebrity') {
      toast.error('Only celebrity accounts can create profiles');
      return;
    }

    setCreating(suggestion.name);
    try {
      await celebrityApi.createFromAi(suggestion);
      toast.success(`Profile created for ${suggestion.name}!`);
      onProfileCreated?.();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create profile';
      toast.error(message);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">AI Celebrity Discovery</h2>
          <p className="text-center text-gray-600">
            Describe a celebrity and let AI find the perfect matches
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDiscover} className="space-y-4">
            <Input
              label="Describe the celebrity"
              placeholder="e.g., Punjabi singer from India who performed at Coachella"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
              Discover Celebrities
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">AI Suggestions</h3>
          <div className="grid gap-4">
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
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
                          <UserGroupIcon className="h-4 w-4 mr-1" />
                          {formatNumber(suggestion.estimated_fanbase)} fans
                        </div>
                        {suggestion.genres.length > 0 && (
                          <div>
                            Genres: {suggestion.genres.join(', ')}
                          </div>
                        )}
                      </div>
                      
                      {suggestion.notable_works.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium">Notable works: </span>
                          <span className="text-sm text-gray-600">
                            {suggestion.notable_works.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Button
                        onClick={() => handleSelectCelebrity(suggestion)}
                        loading={creating === suggestion.name}
                        disabled={user?.role !== 'celebrity'}
                        size="sm"
                      >
                        Select This Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}