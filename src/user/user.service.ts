import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { randomUUID } from 'crypto';
import { UserCreateDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly db: DbService) {}

  // -------- Get all users --------
  async getAllUsers() {
    const res = await this.db.query(
      'SELECT id, created_at, updated_at, username FROM users ORDER BY created_at DESC',
    );
    return res.rows as Record<string, any>[];
  }

  // -------- Create user --------
  async createUser(req: UserCreateDto) {
    const id = `${req.usertype}:${randomUUID()}`;

    const res = await this.db.query(
      'INSERT INTO users (id, username, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id, username, created_at, updated_at',
      [id, req.username],
    );

    return res.rows[0] as Record<string, any>;
  }
}
