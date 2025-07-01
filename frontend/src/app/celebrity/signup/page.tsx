'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/layout/navbar';
import { CelebritySuggestion, AiDiscoveryResponse } from '@/types';
import api from '@/lib/api';
import { Sparkles, Search, CheckCircle, Star, Users, MapPin, Loader2 } from 'lucide-react';

export default function CelebritySignupPage() {
  const [step, setStep] = useState<'search' | 'select' | 'confirm'>('search');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CelebritySuggestion[]>([]);
  const [selectedCelebrity, setSelectedCelebrity] = useState<CelebritySuggestion | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      setError('');

      const response = await api.post<AiDiscoveryResponse>('/api/ai/discover-celebrity', {
        description: searchQuery,
      });

      setSuggestions(response.data.suggestions);
      setStep('select');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to discover celebrities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCelebrity = (celebrity: CelebritySuggestion) => {
    setSelectedCelebrity(celebrity);
    setStep('confirm');
  };

  const handleCreateProfile = async () => {
    if (!selectedCelebrity) return;

    try {
      setLoading(true);
      setError('');

      await api.post('/api/celebrities/from-ai', selectedCelebrity);
      router.push('/celebrity/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Create Your Celebrity Profile
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Let our AI help you create a professional celebrity profile in minutes.
            </p>
          </div>

          {/* Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-8">
              <div className={`flex items-center ${step === 'search' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  step === 'search' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}>
                  1
                </div>
                <span className="font-medium">Describe Yourself</span>
              </div>
              <div className={`w-8 h-px ${step !== 'search' ? 'bg-purple-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center ${step === 'select' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  step === 'select' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}>
                  2
                </div>
                <span className="font-medium">Select Profile</span>
              </div>
              <div className={`w-8 h-px ${step === 'confirm' ? 'bg-purple-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center ${step === 'confirm' ? 'text-purple-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                  step === 'confirm' ? 'bg-purple-600 text-white' : 'bg-gray-200'
                }`}>
                  3
                </div>
                <span className="font-medium">Confirm</span>
              </div>
            </div>
          </div>

          {/* Step 1: AI Search */}
          {step === 'search' && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Tell us about yourself
                </CardTitle>
                <CardDescription>
                  Describe yourself in a few words and let our AI find matching celebrity profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <Input
                    placeholder="e.g., Punjabi singer from India who performed at Coachella"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>

                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Examples:</p>
                  <ul className="space-y-1">
                    <li>• "Bollywood actor known for action movies"</li>
                    <li>• "International pop singer with Grammy awards"</li>
                    <li>• "Motivational speaker and bestselling author"</li>
                    <li>• "Stand-up comedian from New York"</li>
                  </ul>
                </div>

                <Button 
                  onClick={handleAiSearch} 
                  disabled={loading || !searchQuery.trim()}
                  className="w-full h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Discovering profiles...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Discover My Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Select Celebrity */}
          {step === 'select' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Select Your Profile</h2>
                <p className="text-gray-600">Choose the profile that best matches you:</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {suggestions.map((celebrity, index) => (
                  <Card 
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-purple-300"
                    onClick={() => handleSelectCelebrity(celebrity)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{celebrity.name}</h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {celebrity.country}
                          </div>
                        </div>
                        <Badge variant="secondary">{celebrity.category}</Badge>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-3">{celebrity.bio}</p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-purple-500" />
                          <span className="text-sm text-gray-600">
                            {(celebrity.estimated_fanbase / 1000000).toFixed(1)}M fans
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          <span className="text-sm text-gray-600">
                            {Math.round(celebrity.confidence_score * 100)}% match
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        Select This Profile
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8">
                <Button variant="ghost" onClick={() => setStep('search')}>
                  ← Try Different Description
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && selectedCelebrity && (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Confirm Your Profile
                </CardTitle>
                <CardDescription>
                  Review your profile details before creating your celebrity account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{selectedCelebrity.name}</h3>
                      <div className="flex items-center gap-3">
                        <Badge>{selectedCelebrity.category}</Badge>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          {selectedCelebrity.country}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{selectedCelebrity.bio}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Estimated Fanbase:</span>
                      <p>{(selectedCelebrity.estimated_fanbase / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <span className="font-medium">Match Score:</span>
                      <p>{Math.round(selectedCelebrity.confidence_score * 100)}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep('select')} className="flex-1">
                    ← Go Back
                  </Button>
                  <Button onClick={handleCreateProfile} disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      'Create My Profile'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}