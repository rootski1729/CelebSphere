'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { celebrityApi } from '@/lib/api';
import Link from 'next/link';

export default function FanDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'fan') {
      loadDashboard();
    }
  }, [isAuthenticated, user]);

  const loadDashboard = async () => {
    try {
      const response = await celebrityApi.getFanDashboard();
      setFollowing(response.following || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-gray-600">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  if (user?.role !== 'fan') {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">Only fans can access this dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fan Dashboard</h1>
        <p className="text-gray-600">Manage your followed celebrities and discover new ones</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Following ({following.length})</h2>
        </div>
        <div className="px-6 py-4">
          {following.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {following.map((celebrity) => (
                <div key={celebrity.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {celebrity.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{celebrity.category}</p>
                  <p className="text-sm text-gray-500 mb-3">{celebrity.country}</p>
                  <Link href={`/celebrity/${celebrity.id}`}>
                    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                      View Profile
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No celebrities followed yet
              </h3>
              <p className="text-gray-500 mb-4">
                Explore the homepage to discover and follow your favorite celebrities!
              </p>
              <Link href="/">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Discover Celebrities
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}