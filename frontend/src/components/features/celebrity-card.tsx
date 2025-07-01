import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Celebrity } from '@/types';
import { formatNumber } from '@/lib/utils';
import { MapPin, Users, Eye, ExternalLink, CheckCircle } from 'lucide-react';

interface CelebrityCardProps {
  celebrity: Celebrity;
}

export function CelebrityCard({ celebrity }: CelebrityCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        {/* Profile Image */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
          {celebrity.profile_image_url ? (
            <img
              src={celebrity.profile_image_url}
              alt={celebrity.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-16 h-16 text-purple-300" />
            </div>
          )}
          
          {/* Verified Badge */}
          {celebrity.is_verified && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="w-6 h-6 text-blue-500 bg-white rounded-full" />
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90 text-purple-700">
              {celebrity.category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Name and Location */}
          <div className="mb-3">
            <h3 className="font-semibold text-lg mb-1 group-hover:text-purple-600 transition-colors">
              {celebrity.name}
            </h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-1" />
              {celebrity.country}
            </div>
          </div>

          {/* Bio */}
          {celebrity.bio && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {celebrity.bio}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-purple-500" />
              <span className="text-gray-600">
                {formatNumber(celebrity.fanbase_count)}
              </span>
            </div>
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1 text-blue-500" />
              <span className="text-gray-600">
                {formatNumber(celebrity.profile_views)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link href={`/celebrity/${celebrity.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
            <Button size="icon" variant="ghost">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
