import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Celebrity } from '../entities/celebrity.entity';
import { CelebrityStat } from '../entities/celebrity-stat.entity';
import { Follow } from '../entities/follow.entity';
import { User } from '../entities/user.entity';
import { CreateCelebrityDto, CelebrityProfileDto } from './dto/celebrity.dto';
import { CelebritySuggestion } from '../ai/dto/discover-celebrity.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CelebrityService {
  constructor(
    @InjectRepository(Celebrity)
    private celebrityRepository: Repository<Celebrity>,
    @InjectRepository(CelebrityStat)
    private statsRepository: Repository<CelebrityStat>,
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private aiService: AiService,
  ) {}

  async createFromAiSuggestion(userId: string, suggestion: CelebritySuggestion): Promise<CelebrityProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: 'celebrity' }
    });

    if (!user) {
      throw new ForbiddenException('Only celebrity accounts can create profiles');
    }

    const existingCelebrity = await this.celebrityRepository.findOne({
      where: { user_id: userId }
    });

    if (existingCelebrity) {
      throw new BadRequestException('Celebrity profile already exists for this user');
    }

    const celebrityData = {
      user_id: userId,
      name: suggestion.name,
      category: suggestion.category,
      country: suggestion.country,
      bio: suggestion.bio,
      instagram_url: suggestion.instagram_handle ? 
        `https://instagram.com/${suggestion.instagram_handle}` : undefined,
      youtube_url: suggestion.youtube_channel ? 
        `https://youtube.com/@${suggestion.youtube_channel}` : undefined,
      spotify_url: suggestion.spotify_artist ? 
        `https://open.spotify.com/artist/${suggestion.spotify_artist}` : undefined,
      fanbase_count: suggestion.estimated_fanbase,
      profile_image_url: suggestion.image_url || undefined,
    };

    const celebrity = this.celebrityRepository.create(celebrityData);
    const savedCelebrity = await this.celebrityRepository.save(celebrity);

    const stats = this.statsRepository.create({
      celebrity_id: savedCelebrity.id,
      total_followers: 0,
      profile_views: 0,
      engagement_rate: 0,
    });

    await this.statsRepository.save(stats);
    
    return this.formatCelebrityProfile(savedCelebrity);
  }

  async create(userId: string, createDto: CreateCelebrityDto): Promise<CelebrityProfileDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId, role: 'celebrity' }
    });

    if (!user) {
      throw new ForbiddenException('Only celebrity accounts can create profiles');
    }

    const existingCelebrity = await this.celebrityRepository.findOne({
      where: { user_id: userId }
    });

    if (existingCelebrity) {
      throw new BadRequestException('Celebrity profile already exists for this user');
    }

    const celebrityData = {
      user_id: userId,
      ...createDto,
    };

    const celebrity = this.celebrityRepository.create(celebrityData);
    const savedCelebrity = await this.celebrityRepository.save(celebrity);

    const stats = this.statsRepository.create({
      celebrity_id: savedCelebrity.id,
      total_followers: 0,
      profile_views: 0,
      engagement_rate: 0,
    });

    await this.statsRepository.save(stats);
    return this.formatCelebrityProfile(savedCelebrity);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{
    celebrities: CelebrityProfileDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const [celebrities, total] = await this.celebrityRepository.findAndCount({
      relations: ['stats'],
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      celebrities: celebrities.map(celebrity => this.formatCelebrityProfile(celebrity)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, incrementViews: boolean = false): Promise<CelebrityProfileDto> {
    const celebrity = await this.celebrityRepository.findOne({
      where: { id },
      relations: ['stats', 'followers'],
    });

    if (!celebrity) {
      throw new NotFoundException('Celebrity not found');
    }

    if (incrementViews) {
      await this.incrementProfileViews(id);
    }

    return this.formatCelebrityProfile(celebrity);
  }

  async update(id: string, userId: string, updateDto: Partial<CreateCelebrityDto>): Promise<CelebrityProfileDto> {
    const celebrity = await this.celebrityRepository.findOne({
      where: { id, user_id: userId },
      relations: ['stats'],
    });

    if (!celebrity) {
      throw new NotFoundException('Celebrity not found or access denied');
    }

    Object.assign(celebrity, updateDto);
    const updatedCelebrity = await this.celebrityRepository.save(celebrity);

    return this.formatCelebrityProfile(updatedCelebrity);
  }

  async delete(id: string, userId: string): Promise<void> {
    const celebrity = await this.celebrityRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!celebrity) {
      throw new NotFoundException('Celebrity not found or access denied');
    }

    await this.celebrityRepository.remove(celebrity);
  }

  async getDashboard(userId: string): Promise<{
    profile: CelebrityProfileDto;
    stats: {
      total_followers: number;
      profile_views: number;
      engagement_rate: number;
      monthly_growth: number;
      recent_followers: any[];
    };
    recent_activity: any[];
  }> {
    const celebrity = await this.celebrityRepository.findOne({
      where: { user_id: userId },
      relations: ['stats', 'followers'],
    });

    if (!celebrity) {
      throw new NotFoundException('Celebrity profile not found');
    }

    const stats = await this.statsRepository.findOne({
      where: { celebrity_id: celebrity.id }
    });

    const recentFollowers = await this.followRepository.find({
      where: { celebrity_id: celebrity.id },
      relations: ['fan'],
      order: { followed_at: 'DESC' },
      take: 10,
    });

    const monthlyGrowth = Math.floor(Math.random() * 20) + 5;

    return {
      profile: this.formatCelebrityProfile(celebrity),
      stats: {
        total_followers: celebrity.followers?.length || 0,
        profile_views: stats?.profile_views || 0,
        engagement_rate: Number(stats?.engagement_rate) || 0,
        monthly_growth: monthlyGrowth,
        recent_followers: recentFollowers.map(follow => ({
          id: follow.fan.id,
          email: follow.fan.email,
          followed_at: follow.followed_at,
        })),
      },
      recent_activity: [
        {
          type: 'profile_view',
          count: Math.floor(Math.random() * 100),
          date: new Date().toISOString(),
        },
        {
          type: 'new_followers',
          count: Math.floor(Math.random() * 20),
          date: new Date().toISOString(),
        },
      ],
    };
  }

  async followCelebrity(fanId: string, celebrityId: string): Promise<void> {
    const fan = await this.userRepository.findOne({
      where: { id: fanId, role: 'fan' }
    });

    if (!fan) {
      throw new ForbiddenException('Only fans can follow celebrities');
    }

    const celebrity = await this.celebrityRepository.findOne({
      where: { id: celebrityId }
    });

    if (!celebrity) {
      throw new NotFoundException('Celebrity not found');
    }

    const existingFollow = await this.followRepository.findOne({
      where: { fan_id: fanId, celebrity_id: celebrityId }
    });

    if (existingFollow) {
      throw new BadRequestException('Already following this celebrity');
    }

    const follow = this.followRepository.create({
      fan_id: fanId,
      celebrity_id: celebrityId,
    });

    await this.followRepository.save(follow);
    await this.updateFollowerCount(celebrityId);
  }

  async unfollowCelebrity(fanId: string, celebrityId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { fan_id: fanId, celebrity_id: celebrityId }
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.followRepository.remove(follow);
    await this.updateFollowerCount(celebrityId);
  }

  async getFanDashboard(fanId: string): Promise<{
    following: CelebrityProfileDto[];
    total_following: number;
  }> {
    const follows = await this.followRepository.find({
      where: { fan_id: fanId },
      relations: ['celebrity'],
      order: { followed_at: 'DESC' },
    });

    return {
      following: follows.map(follow => 
        this.formatCelebrityProfile(follow.celebrity)
      ),
      total_following: follows.length,
    };
  }

  private async incrementProfileViews(celebrityId: string): Promise<void> {
    await this.statsRepository
      .createQueryBuilder()
      .update(CelebrityStat)
      .set({ profile_views: () => 'profile_views + 1' })
      .where('celebrity_id = :celebrityId', { celebrityId })
      .execute();
  }

  private async updateFollowerCount(celebrityId: string): Promise<void> {
    const followerCount = await this.followRepository.count({
      where: { celebrity_id: celebrityId }
    });

    await this.statsRepository
      .createQueryBuilder()
      .update(CelebrityStat)
      .set({ total_followers: followerCount })
      .where('celebrity_id = :celebrityId', { celebrityId })
      .execute();
  }

  private formatCelebrityProfile(celebrity: Celebrity): CelebrityProfileDto {
    return {
      id: celebrity.id,
      name: celebrity.name,
      category: celebrity.category,
      country: celebrity.country,
      bio: celebrity.bio || '',
      instagram_url: celebrity.instagram_url || '',
      youtube_url: celebrity.youtube_url || '',
      spotify_url: celebrity.spotify_url || '',
      fanbase_count: celebrity.fanbase_count,
      profile_image_url: celebrity.profile_image_url || '',
      is_verified: celebrity.is_verified,
      follower_count: celebrity.followers?.length || 0,
      profile_views: celebrity.stats?.[0]?.profile_views || 0,
      engagement_rate: Number(celebrity.stats?.[0]?.engagement_rate) || 0,
      created_at: celebrity.created_at,
      updated_at: celebrity.updated_at,
    };
  }
}