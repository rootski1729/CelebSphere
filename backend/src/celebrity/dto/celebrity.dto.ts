import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsNumber, IsOptional, Min, MaxLength, IsEnum } from 'class-validator';

export class CreateCelebrityDto {
  @ApiProperty({ description: 'Celebrity name', example: 'Diljit Dosanjh' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ 
    description: 'Celebrity category', 
    example: 'Singer',
    enum: ['Singer', 'Actor', 'Speaker', 'Comedian', 'Dancer', 'Influencer', 'Other']
  })
  @IsEnum(['Singer', 'Actor', 'Speaker', 'Comedian', 'Dancer', 'Influencer', 'Other'])
  category: string;

  @ApiProperty({ description: 'Country of origin', example: 'India' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Biography', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiProperty({ description: 'Instagram URL', required: false })
  @IsOptional()
  @IsUrl()
  instagram_url?: string;

  @ApiProperty({ description: 'YouTube URL', required: false })
  @IsOptional()
  @IsUrl()
  youtube_url?: string;

  @ApiProperty({ description: 'Spotify URL', required: false })
  @IsOptional()
  @IsUrl()
  spotify_url?: string;

  @ApiProperty({ description: 'Fanbase count', example: 15000000, minimum: 1000 })
  @IsNumber()
  @Min(1000)
  fanbase_count: number;

  @ApiProperty({ description: 'Profile image URL', required: false })
  @IsOptional()
  @IsUrl()
  profile_image_url?: string;
}

export class CelebrityProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  instagram_url: string;

  @ApiProperty()
  youtube_url: string;

  @ApiProperty()
  spotify_url: string;

  @ApiProperty()
  fanbase_count: number;

  @ApiProperty()
  profile_image_url: string;

  @ApiProperty()
  is_verified: boolean;

  @ApiProperty()
  follower_count: number;

  @ApiProperty()
  profile_views: number;

  @ApiProperty()
  engagement_rate: number;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}