import { Controller, Post, Body } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';

@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post('create')
  async create(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    const user = await this.adminUserService.createUser(username, password);
    // Do not return password hash in response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
