import { TargetedUserEntity } from 'src/flags/entities/targeted-user.entity';
import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
  OneToMany,
} from 'typeorm';

@Entity('users')
@Check(`id ~ '^(tenant|user|anon):[a-fA-F0-9\\-]{36}$'`)
export class UserEntity {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TargetedUserEntity, (targetedUser) => targetedUser.user)
  targetedUsers: TargetedUserEntity[];
}
