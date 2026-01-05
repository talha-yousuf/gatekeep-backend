import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TargetedUserEntity } from './targeted-user.entity';
import { IsInt, Max, Min } from 'class-validator';

@Entity('feature_flags')
export class FeatureFlagEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column({ unique: true, default: '' })
  description: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ name: 'default_value', default: false })
  defaultValue: boolean;

  @Column({
    type: 'int',
    default: 0,
    name: 'rollout_percentage',
  })
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TargetedUserEntity, (target) => target.flag)
  targetedUsers: TargetedUserEntity[];
}
