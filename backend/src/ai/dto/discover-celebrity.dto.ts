import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class DiscoverCelebrityDto {
  @ApiProperty({
    description: 'Description of the celebrity to discover',
    example: 'Punjabi singer from India who performed at Coachella',
    maxLength: 500
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;
}

export class CelebritySuggestion {
  @ApiProperty()
  name: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  confidence_score: number;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  estimated_fanbase: number;

  @ApiProperty()
  instagram_handle?: string;

  @ApiProperty()
  youtube_channel?: string;

  @ApiProperty()
  spotify_artist?: string;

  @ApiProperty()
  image_url?: string;

  @ApiProperty()
  notable_works: string[];

  @ApiProperty()
  genres: string[];
}

export class DiscoverCelebrityResponseDto {
  @ApiProperty({ type: [CelebritySuggestion] })
  suggestions: CelebritySuggestion[];

  @ApiProperty()
  query_interpretation: string;

  @ApiProperty()
  total_found: number;
}