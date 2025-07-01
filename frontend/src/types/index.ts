export interface Celebrity {
  id: string;
  name: string;
  category: string;
  country: string;
  bio: string;
  instagram_url: string;
  youtube_url: string;
  spotify_url: string;
  fanbase_count: number;
  profile_image_url: string;
  is_verified: boolean;
  follower_count: number;
  profile_views: number;
  engagement_rate: number;
  created_at: string;
  updated_at: string;
}

export interface CelebritySuggestion {
  name: string;
  category: string;
  country: string;
  confidence_score: number;
  bio: string;
  estimated_fanbase: number;
  instagram_handle?: string;
  youtube_channel?: string;
  spotify_artist?: string;
  image_url?: string;
  notable_works: string[];
  genres: string[];
}

export interface AiDiscoveryResponse {
  suggestions: CelebritySuggestion[];
  query_interpretation: string;
  total_found: number;
}