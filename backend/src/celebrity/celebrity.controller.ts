import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { CelebrityService } from './celebrity.service';
import { PdfService } from '../pdf/pdf.service';
import { CreateCelebrityDto, CelebrityProfileDto } from './dto/celebrity.dto';
import { CelebritySuggestion } from '../ai/dto/discover-celebrity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Celebrities')
@Controller('api/celebrities')
export class CelebrityController {
  constructor(
    private readonly celebrityService: CelebrityService,
    private readonly pdfService: PdfService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all celebrities' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.celebrityService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get celebrity by ID' })
  async findById(@Param('id') id: string): Promise<CelebrityProfileDto> {
    return this.celebrityService.findById(id, true);
  }

  @Post('from-ai')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('celebrity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create celebrity profile from AI suggestion' })
  async createFromAi(
    @CurrentUser('id') userId: string,
    @Body() suggestion: CelebritySuggestion,
  ): Promise<CelebrityProfileDto> {
    return this.celebrityService.createFromAiSuggestion(userId, suggestion);
  }

  @Post(':id/follow')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fan')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Follow celebrity (fans only)' })
  async follow(
    @Param('id') celebrityId: string,
    @CurrentUser('id') fanId: string,
  ): Promise<{ message: string }> {
    await this.celebrityService.followCelebrity(fanId, celebrityId);
    return { message: 'Successfully followed celebrity' };
  }

  @Post(':id/unfollow')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fan')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow celebrity (fans only)' })
  async unfollow(
    @Param('id') celebrityId: string,
    @CurrentUser('id') fanId: string,
  ): Promise<{ message: string }> {
    await this.celebrityService.unfollowCelebrity(fanId, celebrityId);
    return { message: 'Successfully unfollowed celebrity' };
  }

  @Get('fan/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fan')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get fan dashboard' })
  async getFanDashboard(@CurrentUser('id') fanId: string) {
    return this.celebrityService.getFanDashboard(fanId);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download celebrity profile as PDF' })
  async downloadPdf(
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<void> {
    const celebrity = await this.celebrityService.findById(id);
    const pdfBuffer = await this.pdfService.generateCelebrityProfilePdf(celebrity);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${celebrity.name}-profile.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);
  }
}