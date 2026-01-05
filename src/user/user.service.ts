import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class UserService {
  constructor(private readonly db: DbService) {}

  // -------- Get all users --------
  async getAllUsers() {
    const res = await this.db.query(
      'SELECT id, created_at, updated_at FROM users ORDER BY created_at DESC',
    );
    return res.rows as Record<string, any>[];
  }
}
