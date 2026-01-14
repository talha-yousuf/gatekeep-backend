import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDto } from './dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createUser(@Body() dto: UserCreateDto) {
    return this.usersService.createUser(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
