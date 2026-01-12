import { Injectable } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import {
  AdminUserResponseDto,
  AdminUserResponseWithHashDto,
} from './dto/admin-user.dto';

@Injectable()
export class AdminUserService {
  constructor(private readonly db: DbService) {}

  async getByUsername(username: string): Promise<AdminUserResponseWithHashDto> {
    const result = await this.db.query(
      `SELECT id, username, created_at, updated_at, password_hash FROM admin_user WHERE username = $1`,
      [username],
    );

    const user = result.rows[0] as unknown;

    if (!user) {
      throw new Error('Admin User could not be found by username');
    }

    return user as AdminUserResponseWithHashDto;
  }

  async getById(id: number | string): Promise<AdminUserResponseDto> {
    const result = await this.db.query(
      `SELECT id, username, created_at, updated_at FROM admin_user WHERE id = $1`,
      [id],
    );

    const user = result.rows[0] as unknown;

    if (!user) {
      throw new Error('Admin User could not be found by id');
    }

    return user as AdminUserResponseDto;
  }
}
