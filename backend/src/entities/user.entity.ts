import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Celebrity } from './celebrity.entity';
import { Follow } from './follow.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column({ type: 'enum', enum: ['celebrity', 'fan'] })
  role: 'celebrity' | 'fan';

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Celebrity, celebrity => celebrity.user)
  celebrity: Celebrity;

  @OneToMany(() => Follow, follow => follow.fan)
  following: Follow[];
}