import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CelebrityController } from './celebrity.controller';
import { CelebrityService } from './celebrity.service';
import { Celebrity } from '../entities/celebrity.entity';
import { CelebrityStat } from '../entities/celebrity-stat.entity';
import { Follow } from '../entities/follow.entity';
import { User } from '../entities/user.entity';
import { AiModule } from '../ai/ai.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Celebrity, CelebrityStat, Follow, User]),
    AiModule,
    PdfModule,
  ],
  controllers: [CelebrityController],
  providers: [CelebrityService],
  exports: [CelebrityService],
})
export class CelebrityModule {}