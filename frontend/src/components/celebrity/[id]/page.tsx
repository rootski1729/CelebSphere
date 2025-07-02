'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { celebrityApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

export default function CelebrityProfilePage() {
  const params = useParams();
  const [celebrity, setCelebrity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      loadCelebrity(params.id);
    }
  }, [params.id]);

  const loadCelebrity = async (id: string) => {
    try {
      const data = await celebrityApi.getById(id);
      setCelebrity(data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Celebrity not found');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated || user?.role !== 'fan') {
      toast.error('Only fans can follow celebrities');
      return;
    }

    setFollowing(true);
    try {
      await celebrityApi.follow(celebrity.id);
      toast.success(`Now following ${celebrity.name}!`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to follow';
      toast.error(message);
    } finally {
      setFollowing(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await celebrityApi.downloadPdf(celebrity.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${celebrity.name}-profile.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !celebrity) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Celebrity Not Found</h2>
        <p className="text-gray-600">{error || "The celebrity you're looking for doesn't exist."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            {celebrity.profile_image_url ? (
              <img
                src={celebrity.profile_image_url}
                alt={celebrity.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                👤
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{celebrity.name}</h1>
              {celebrity.is_verified && (
                <span className="text-blue-500 text-lg">✓</span>
              )}
            </div>
            
            <p className="text-xl text-gray-600 mb-2">{celebrity.category}</p>
            <p className="text-gray-500 mb-4">📍 {celebrity.country}</p>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center">
                <span className="font-semibold">{(celebrity.fanbase_count / 1000000).toFixed(1)}M</span>
                <span className="text-gray-500 ml-1">fans</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold">{celebrity.profile_views}</span>
                <span className="text-gray-500 ml-1">views</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold">{celebrity.follower_count}</span>
                <span className="text-gray-500 ml-1">followers</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {isAuthenticated && user?.role === 'fan' && (
                <button
                  onClick={handleFollow}
                  disabled={following}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {following ? 'Following...' : 'Follow'}
                </button>
              )}
              
              <button
                onClick={handleDownloadPdf}
                className="border border-gray-300 bg-white text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
              >
                📄 Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {celebrity.bio && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">About</h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-700 leading-relaxed">{celebrity.bio}</p>
          </div>
        </div>
      )}

      {/* Social Links */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Social Media</h2>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {celebrity.instagram_url && (
              <a
                href={celebrity.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                📷 Instagram
              </a>
            )}
            
            {celebrity.youtube_url && (
              <a
                href={celebrity.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                ▶️ YouTube
              </a>
            )}
            
            {celebrity.spotify_url && (
              <a
                href={celebrity.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                🎵 Spotify
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}