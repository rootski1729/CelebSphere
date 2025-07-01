import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';
import { Celebrity } from './celebrity.entity';

@Entity('follows')
@Unique(['fan_id', 'celebrity_id'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fan_id: string;

  @Column()
  celebrity_id: string;

  @CreateDateColumn()
  followed_at: Date;

  @ManyToOne(() => User, user => user.following)
  @JoinColumn({ name: 'fan_id' })
  fan: User;

  @ManyToOne(() => Celebrity, celebrity => celebrity.followers)
  @JoinColumn({ name: 'celebrity_id' })
  celebrity: Celebrity;
}