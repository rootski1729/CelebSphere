'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Celebrity } from '@/types';
import { authService } from '@/lib/auth';
import api from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { 
  MapPin, Users, Eye, Heart, Share2, Download, 
  Instagram, Youtube, Music, CheckCircle, TrendingUp,
  Calendar, Globe
} from 'lucide-react';

export default function CelebrityProfilePage() {
  const params = useParams();
  const [celebrity, setCelebrity] = useState<Celebrity | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  const user = authService.getUser();
  const isFan = user?.role === 'fan';

  useEffect(() => {
    fetchCelebrity();
  }, [params.id]);

  const fetchCelebrity = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/celebrities/${params.id}`);
      setCelebrity(response.data);
    } catch (error) {
      console.error('Failed to fetch celebrity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isFan || !celebrity) return;

    try {
      setFollowLoading(true);
      if (following) {
        await api.post(`/api/celebrities/${celebrity.id}/unfollow`);
        setFollowing(false);
      } else {
        await api.post(`/api/celebrities/${celebrity.id}/follow`);
        setFollowing(true);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!celebrity) return;

    try {
      const response = await api.get(`/api/celebrities/${celebrity.id}/pdf`, {
        responseType: 'blob',
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${celebrity.name}-profile.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Navbar />
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                  <div className="h-48 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!celebrity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Navbar />
        <div className="py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Celebrity Not Found</h1>
            <p className="text-gray-600">The celebrity profile you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                {celebrity.profile_image_url ? (
                  <img
                    src={celebrity.profile_image_url}
                    alt={celebrity.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-24 h-24 text-white/60" />
                )}
              </div>
              {celebrity.is_verified && (
                <CheckCircle className="absolute bottom-2 right-2 w-8 h-8 text-blue-400 bg-white rounded-full" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold">{celebrity.name}</h1>
                {celebrity.is_verified && (
                  <Badge className="bg-blue-500 text-white">Verified</Badge>
                )}
              </div>
              
              <div className="flex items-center justify-center md:justify-start gap-4 mb-6 text-white/90">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {celebrity.category}
                </Badge>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {celebrity.country}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since {new Date(celebrity.created_at).getFullYear()}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(celebrity.fanbase_count)}</div>
                  <div className="text-white/80 text-sm">Total Fans</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(celebrity.follower_count)}</div>
                  <div className="text-white/80 text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatNumber(celebrity.profile_views)}</div>
                  <div className="text-white/80 text-sm">Profile Views</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {isFan && (
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    variant={following ? "secondary" : "default"}
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${following ? 'fill-current' : ''}`} />
                    {following ? 'Following' : 'Follow'}
                  </Button>
                )}
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  onClick={handleDownloadPDF}
                  variant="outline" 
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Biography */}
            <Card>
              <CardHeader>
                <CardTitle>About {celebrity.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {celebrity.bio || `${celebrity.name} is a talented ${celebrity.category.toLowerCase()} from ${celebrity.country}. Known for their exceptional work in the entertainment industry, they have built a significant following and continue to inspire fans worldwide.`}
                </p>
              </CardContent>
            </Card>

            {/* Social Media Links */}
            {(celebrity.instagram_url || celebrity.youtube_url || celebrity.spotify_url) && (
              <Card>
                <CardHeader>
                  <CardTitle>Connect & Follow</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {celebrity.instagram_url && (
                      <a
                        href={celebrity.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Instagram className="w-8 h-8 text-pink-500 mr-3" />
                        <div>
                          <div className="font-medium">Instagram</div>
                          <div className="text-sm text-gray-600">Follow on IG</div>
                        </div>
                      </a>
                    )}
                    {celebrity.youtube_url && (
                      <a
                        href={celebrity.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Youtube className="w-8 h-8 text-red-500 mr-3" />
                        <div>
                          <div className="font-medium">YouTube</div>
                          <div className="text-sm text-gray-600">Watch videos</div>
                        </div>
                      </a>
                    )}
                    {celebrity.spotify_url && (
                      <a
                        href={celebrity.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Music className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                          <div className="font-medium">Spotify</div>
                          <div className="text-sm text-gray-600">Listen now</div>
                        </div>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <Badge>{celebrity.category}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{celebrity.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Engagement:</span>
                  <span className="font-medium">{celebrity.engagement_rate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified:</span>
                  <span className={celebrity.is_verified ? "text-green-600" : "text-gray-500"}>
                    {celebrity.is_verified ? "Yes" : "No"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Profile updated</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">New followers gained</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-gray-600">Engagement increased</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}