import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Follow } from './follow.entity';
import { CelebrityStat } from './celebrity-stat.entity';

@Entity('celebrities')
export class Celebrity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column()
  country: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ nullable: true })
  instagram_url: string;

  @Column({ nullable: true })
  youtube_url: string;

  @Column({ nullable: true })
  spotify_url: string;

  @Column({ default: 0 })
  fanbase_count: number;

  @Column({ nullable: true })
  profile_image_url: string;

  @Column({ default: false })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User, user => user.celebrity)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Follow, follow => follow.celebrity)
  followers: Follow[];

  @OneToMany(() => CelebrityStat, stat => stat.celebrity)
  stats: CelebrityStat[];
}