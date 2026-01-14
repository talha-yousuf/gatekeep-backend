import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminUserService } from 'src/admin-user/admin-user.service';
import { AdminUserResponseDto } from 'src/admin-user/dto/admin-user.dto';

interface JwtPayload {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly adminUserService: AdminUserService) {
    const secretOrKey = process.env.JWT_SECRET;

    if (!secretOrKey) {
      throw new Error('JWT_SECRET environment variable not found');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey,
    });
  }

  async validate(payload: JwtPayload): Promise<AdminUserResponseDto> {
    const userId = payload.sub;

    if (!userId) {
      throw new UnauthorizedException('Invalid JWT payload');
    }

    const user = await this.adminUserService.getById(userId).catch(() => {
      throw new UnauthorizedException('User not found');
    });

    return user;
  }
}
