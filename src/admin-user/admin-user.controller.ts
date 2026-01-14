import { Controller, Post, Body } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateAdminUserDto } from './dto/admin-user.dto';

@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post()
  async createAdminUser(@Body() createAdminUserDto: CreateAdminUserDto) {
    const { username, password } = createAdminUserDto;
    const user = await this.adminUserService.createUser(username, password);
    // Do not return password hash in response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
