import React from 'react';
import Link from 'next/link';
import { Celebrity } from '@/types';

interface CelebrityCardProps {
  celebrity: Celebrity;
}

export function CelebrityCard({ celebrity }: CelebrityCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
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
  );
}