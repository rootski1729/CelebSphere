'use client';

import React, { useState } from 'react';
import { Celebrity } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { formatNumber, downloadFile } from '@/lib/utils';
import { celebrityApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  UserGroupIcon,
  EyeIcon,
  MapPinIcon,
  GlobeAltIcon,
  MusicalNoteIcon,
  PlayIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

interface CelebrityProfileProps {
  celebrity: Celebrity;
  onFollowChange?: () => void;
}

export function CelebrityProfile({ celebrity, onFollowChange }: CelebrityProfileProps) {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handleFollow = async () => {
    if (!isAuthenticated || user?.role !== 'fan') {
      toast.error('Only fans can follow celebrities');
      return;
    }

    setLoading(true);
    try {
      await celebrityApi.follow(celebrity.id);
      toast.success(`Now following ${celebrity.name}!`);
      onFollowChange?.();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to follow';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const blob = await celebrityApi.downloadPdf(celebrity.id);
      downloadFile(blob, `${celebrity.name}-profile.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardContent className="p-8">
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
                  <UserGroupIcon className="h-16 w-16" />
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
              
              <div className="flex items-center text-gray-500 mb-4">
                <MapPinIcon className="h-5 w-5 mr-2" />
                {celebrity.country}
              </div>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-blue-500" />
                  <span className="font-semibold">{formatNumber(celebrity.fanbase_count)}</span>
                  <span className="text-gray-500 ml-1">fans</span>
                </div>
                <div className="flex items-center">
                  <EyeIcon className="h-5 w-5 mr-2 text-green-500" />
                  <span className="font-semibold">{formatNumber(celebrity.profile_views)}</span>
                  <span className="text-gray-500 ml-1">views</span>
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-purple-500" />
                  <span className="font-semibold">{formatNumber(celebrity.follower_count)}</span>
                  <span className="text-gray-500 ml-1">followers</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {isAuthenticated && user?.role === 'fan' && (
                  <Button
                    onClick={handleFollow}
                    loading={loading}
                    className="px-6"
                  >
                    Follow
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={handleDownloadPdf}
                  loading={downloadingPdf}
                  className="px-6"
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      {celebrity.bio && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">About</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{celebrity.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Social Media</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {celebrity.instagram_url && (
              <a
                href={celebrity.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <GlobeAltIcon className="h-6 w-6 mr-3" />
                <span>Instagram</span>
              </a>
            )}
            
            {celebrity.youtube_url && (
              <a
                href={celebrity.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <PlayIcon className="h-6 w-6 mr-3" />
                <span>YouTube</span>
              </a>
            )}
            
            {celebrity.spotify_url && (
              <a
                href={celebrity.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <MusicalNoteIcon className="h-6 w-6 mr-3" />
                <span>Spotify</span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}