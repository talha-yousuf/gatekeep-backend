import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FeatureFlagEntity } from './feature_flag.entity';

@Entity('audit_log')
export class AuditLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'flag_id' })
  flagId: number;

  @Column({ name: 'actor_id', nullable: true })
  actorId: string;

  @Column({ type: 'jsonb', name: 'before_state', nullable: true })
  beforeState: any;

  @Column({ type: 'jsonb', name: 'after_state', nullable: true })
  afterState: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => FeatureFlagEntity)
  @JoinColumn({ name: 'flag_id' })
  flag: FeatureFlagEntity;
}
