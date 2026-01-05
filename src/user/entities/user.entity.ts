import { TargetedUser } from 'src/flags/entities/targeted-user.entity';
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
export class User {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => TargetedUser, (targetedUser) => targetedUser.user)
  targetedUsers: TargetedUser[];
}
