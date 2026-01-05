import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { FeatureFlag } from './feature_flag.entity';
import { User } from 'src/user/entities/user.entity';

@Entity('targeted_users')
@Unique(['flagId', 'userId'])
export class TargetedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'flag_id' })
  flagId: number;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => FeatureFlag, (flag) => flag.targetedUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'flag_id' })
  flag: FeatureFlag;

  @ManyToOne(() => User, (user) => user.targetedUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
