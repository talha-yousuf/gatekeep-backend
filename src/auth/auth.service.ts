import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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
    const user = await this.adminUserService
      .getByUsername(username)
      .catch(() => null);

    if (user && user.password_hash) {
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (isValid) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password_hash, ...safeUser } = user;
        return safeUser;
      }
    }

    return null;
  }

  login(user: AdminUserResponseDto) {
    const payload = { sub: user.id, username: user.username };
    return { access_token: this.jwtService.sign(payload) };
  }
}
