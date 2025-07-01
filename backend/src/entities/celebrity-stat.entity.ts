import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, UpdateDateColumn } from 'typeorm';
import { Celebrity } from './celebrity.entity';

@Entity('celebrity_stats')
export class CelebrityStat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  celebrity_id: string;

  @Column({ default: 0 })
  profile_views: number;

  @Column({ default: 0 })
  total_followers: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  engagement_rate: number;

  @UpdateDateColumn()
  last_updated: Date;

  @ManyToOne(() => Celebrity, celebrity => celebrity.stats)
  @JoinColumn({ name: 'celebrity_id' })
  celebrity: Celebrity;
}