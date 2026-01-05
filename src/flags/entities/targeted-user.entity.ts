import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { FeatureFlagEntity } from './feature_flag.entity';
import { UserEntity } from 'src/user/entities/user.entity';

@Entity('targeted_users')
@Unique(['flagId', 'userId'])
export class TargetedUserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'flag_id' })
  flagId: number;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => FeatureFlagEntity, (flag) => flag.targetedUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'flag_id' })
  flag: FeatureFlagEntity;

  @ManyToOne(() => UserEntity, (user) => user.targetedUsers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
