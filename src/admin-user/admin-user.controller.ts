import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { CreateAdminUserDto, AdminUserResponseDto } from './dto/admin-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Admin Users')
@Controller('admin-user')
export class AdminUserController {
  constructor(private readonly adminUserService: AdminUserService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiBody({ type: CreateAdminUserDto })
  @ApiResponse({
    status: 201,
    description: 'The newly created admin user.',
    type: AdminUserResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Username already exists.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  async createAdminUser(@Body() createAdminUserDto: CreateAdminUserDto) {
    const { username, password } = createAdminUserDto;
    const user = await this.adminUserService.createUser(username, password);
    // Do not return password hash in response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
