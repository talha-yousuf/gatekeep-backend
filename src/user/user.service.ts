import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { randomUUID } from 'crypto';
import { UserCreateDto, UserDbRecordDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private readonly db: DbService) {}

  // -------- Get all users --------
  async getAllUsers(): Promise<UserDbRecordDto[]> {
    const res = await this.db.query<UserDbRecordDto>(
      'SELECT id, created_at, updated_at, username FROM users ORDER BY created_at DESC',
    );
    return res.rows;
  }

  // -------- Create user --------
  async createUser(createUserDto: UserCreateDto): Promise<UserDbRecordDto> {
    const id = `${createUserDto.usertype}:${randomUUID()}`;

    const res = await this.db.query<UserDbRecordDto>(
      'INSERT INTO users (id, username, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING id, username, created_at, updated_at',
      [id, createUserDto.username],
    );

    return res.rows[0];
  }
}
