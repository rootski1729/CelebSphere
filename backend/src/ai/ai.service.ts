import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DiscoverCelebrityDto, CelebritySuggestion, DiscoverCelebrityResponseDto } from './dto/discover-celebrity.dto';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async discoverCelebrities(discoverDto: DiscoverCelebrityDto): Promise<DiscoverCelebrityResponseDto> {
    try{ 
      const prompt = this.createDiscoveryPrompt(discoverDto.description);
      
      const result = await this.model.generateContent(prompt);
      const {response} = result;
      const text = response.text();

      if (!text) {
        throw new InternalServerErrorException('Failed to get AI response');
      }

      return this.parseAiResponse(text, discoverDto.description);
    } catch (error) {
      console.error('Gemini API error:', error);
      // Return fallback response if AI fails
      return this.getFallbackResponse(discoverDto.description);
    }
  }

  private createDiscoveryPrompt(description: string): string {
    return `
      Based on this description: "${description}"
      
      Find 3-5 matching celebrities and return them in this exact JSON format:
      
      {
        "suggestions": [
          {
            "name": "Celebrity Full Name",
            "category": "Singer|Actor|Speaker|Comedian|etc",
            "country": "Primary Country",
            "confidence_score": 0.95,
            "bio": "Brief professional bio (50-100 words)",
            "estimated_fanbase": estimated_number,
            "instagram_handle": "username_without_@",
            "youtube_channel": "channel_name",
            "spotify_artist": "artist_name",
            "image_url": null,
            "notable_works": ["work1", "work2", "work3"],
            "genres": ["genre1", "genre2"]
          }
        ],
        "query_interpretation": "How you interpreted the user's description",
        "total_found": number_of_suggestions
      }
      
      Rules:
      1. Order by confidence_score (highest first)
      2. Only include real, well-known celebrities
      3. Use null for unknown social media handles
      4. Return only valid JSON, no additional text
      
      Examples:
      - For "Punjabi singer from India who performed at Coachella": Include Diljit Dosanjh
      - For "British rock band": Include Coldplay, Queen, etc.
    `;
  }

  private parseAiResponse(response: string, originalQuery: string): DiscoverCelebrityResponseDto {
    try {
      // Clean the response to extract JSON
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonMatch[0] = jsonMatch[1];
        }
      }
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
        throw new Error('Invalid response structure');
      }

      const validatedSuggestions = parsed.suggestions.map((suggestion: any) => ({
        name: suggestion.name || 'Unknown Celebrity',
        category: suggestion.category || 'Entertainment',
        country: suggestion.country || 'Unknown',
        confidence_score: Math.min(Math.max(suggestion.confidence_score || 0.5, 0), 1),
        bio: suggestion.bio || 'No biography available',
        estimated_fanbase: Math.max(suggestion.estimated_fanbase || 10000, 1000),
        instagram_handle: suggestion.instagram_handle || null,
        youtube_channel: suggestion.youtube_channel || null,
        spotify_artist: suggestion.spotify_artist || null,
        image_url: suggestion.image_url || null,
        notable_works: Array.isArray(suggestion.notable_works) ? suggestion.notable_works : [],
        genres: Array.isArray(suggestion.genres) ? suggestion.genres : []
      }));

      return {
        suggestions: validatedSuggestions,
        query_interpretation: parsed.query_interpretation || `Search for: ${originalQuery}`,
        total_found: validatedSuggestions.length
      };

    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.getFallbackResponse(originalQuery);
    }
  }

  private getFallbackResponse(query: string): DiscoverCelebrityResponseDto {
    const fallbackSuggestions: CelebritySuggestion[] = [];
    
    if (query.toLowerCase().includes('punjabi') || query.toLowerCase().includes('indian singer')) {
      fallbackSuggestions.push({
        name: 'Diljit Dosanjh',
        category: 'Singer',
        country: 'India',
        confidence_score: 0.8,
        bio: 'Popular Punjabi singer and actor who has performed internationally including at Coachella',
        estimated_fanbase: 15000000,
        instagram_handle: 'diljitdosanjh',
        youtube_channel: 'DiljitDosanjh',
        spotify_artist: 'Diljit Dosanjh',
        image_url: undefined,
        notable_works: ['G.O.A.T.', 'Born to Shine', 'Coachella Performance'],
        genres: ['Punjabi Pop', 'Bhangra', 'Hip Hop']
      });
    }

    if (query.toLowerCase().includes('british') && query.toLowerCase().includes('rock')) {
      fallbackSuggestions.push({
        name: 'Coldplay',
        category: 'Band',
        country: 'United Kingdom',
        confidence_score: 0.9,
        bio: 'British rock band formed in London, known for alternative rock and pop music',
        estimated_fanbase: 50000000,
        instagram_handle: 'coldplay',
        youtube_channel: 'ColdplayOfficial',
        spotify_artist: 'Coldplay',
        image_url: undefined,
        notable_works: ['Yellow', 'Fix You', 'Viva La Vida', 'Paradise'],
        genres: ['Alternative Rock', 'Pop Rock', 'Post-Britpop']
      });
    }

    // Default suggestion if no matches
    if (fallbackSuggestions.length === 0) {
      fallbackSuggestions.push({
        name: 'Global Celebrity',
        category: 'Entertainment',
        country: 'International',
        confidence_score: 0.5,
        bio: 'Internationally recognized celebrity in the entertainment industry',
        estimated_fanbase: 1000000,
        instagram_handle: undefined,
        youtube_channel: undefined,
        spotify_artist: undefined,
        image_url: undefined,
        notable_works: ['Various acclaimed works'],
        genres: ['Entertainment']
      });
    }

    return {
      suggestions: fallbackSuggestions,
      query_interpretation: `Fallback search results for: ${query}`,
      total_found: fallbackSuggestions.length
    };
  }
}