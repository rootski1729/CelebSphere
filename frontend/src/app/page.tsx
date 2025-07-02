'use client';

import React, { useEffect, useState } from 'react';
import { Celebrity } from '@/types';
import { CelebrityCard } from '@/components/celebrity/CelebrityCard';
import { Button } from '@/components/ui/Button';
import { celebrityApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function HomePage() {
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    loadCelebrities();
  }, [page]);

  const loadCelebrities = async () => {
    try {
      const response = await celebrityApi.getAll(page, 12);
      setCelebrities(response.celebrities);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load celebrities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to CelebNetwork
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Discover, connect, and follow your favorite celebrities
        </p>
        
        {!isAuthenticated ? (
          <div className="space-x-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                Sign In
              </Button>
            </Link>
          </div>
        ) : user?.role === 'celebrity' ? (
          <Link href="/celebrity/signup">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Create Your Profile
            </Button>
          </Link>
        ) : (
          <Link href="/fan/dashboard">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              View Your Dashboard
            </Button>
          </Link>
        )}
      </div>

      {/* Featured Celebrities */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Featured Celebrities</h2>
          {isAuthenticated && user?.role === 'celebrity' && (
            <Link href="/celebrity/signup">
              <Button>Create Profile</Button>
            </Link>
          )}
        </div>

        {celebrities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {celebrities.map((celebrity) => (
                <CelebrityCard key={celebrity.id} celebrity={celebrity} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8 space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-4">
              No celebrities found
            </h3>
            <p className="text-gray-500 mb-6">
              Be the first to create a celebrity profile!
            </p>
            {isAuthenticated && user?.role === 'celebrity' && (
              <Link href="/celebrity/signup">
                <Button>Create Your Profile</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}