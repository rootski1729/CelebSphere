import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { DiscoverCelebrityDto, DiscoverCelebrityResponseDto } from './dto/discover-celebrity.dto';

@ApiTags('AI Celebrity Discovery')
@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('discover-celebrity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Discover celebrities using AI',
    description: 'Use Google Gemini AI to find celebrities based on natural language descriptions'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully found celebrity matches',
    type: DiscoverCelebrityResponseDto,
  })
  async discoverCelebrity(
    @Body() discoverDto: DiscoverCelebrityDto
  ): Promise<DiscoverCelebrityResponseDto> {
    return this.aiService.discoverCelebrities(discoverDto);
  }
}