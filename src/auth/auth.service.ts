import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { AdminUserService } from 'src/admin-user/admin-user.service';
import { AdminUserResponseDto } from 'src/admin-user/dto/admin-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private adminUserService: AdminUserService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AdminUserResponseDto | null> {
    const user = await this.adminUserService.getByUsername(username);
    if (!user) return null;
    if (!user.password_hash) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    return {
      id: user.id,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  login(user: AdminUserResponseDto) {
    const payload = { sub: user.id, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }
}
