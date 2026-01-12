import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FlagsService } from './flags.service';
import { CreateFlagDto, UpdateFlagDto } from './dto/flags.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminUserResponseDto } from 'src/admin-user/dto/admin-user.dto';

@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Get('evaluate')
  evaluate(@Query('userId') userId: string) {
    return this.flagsService.evaluateFlagsForUser(userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getAll() {
    return this.flagsService.getAllFlags();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() dto: CreateFlagDto,
    @Request()
    req: {
      user: AdminUserResponseDto;
    },
  ) {
    const actorId = req.user.username;
    return this.flagsService.createFlag(dto, actorId);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFlagDto,
    @Request()
    req: {
      user: AdminUserResponseDto;
    },
  ) {
    const actorId = req.user.username;
    return this.flagsService.updateFlag(+id, dto, actorId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  delete(
    @Param('id') id: string,
    @Request()
    req: {
      user: AdminUserResponseDto;
    },
  ) {
    const actorId = req.user.username;
    return this.flagsService.deleteFlag(+id, actorId);
  }

  @Post(':id/target')
  @UseGuards(AuthGuard('jwt'))
  addTarget(@Param('id') id: string, @Body() dto: UserDto) {
    return this.flagsService.addTargetUser(+id, dto);
  }

  @Delete(':id/target/:userId')
  @UseGuards(AuthGuard('jwt'))
  removeTarget(@Param('id') id: string, @Param('userId') userId: string) {
    return this.flagsService.removeTargetUser(+id, userId);
  }

  @Get(':id/audit')
  @UseGuards(AuthGuard('jwt'))
  getAudit(@Param('id') id: string, @Query('limit') limit: string) {
    const l = limit ? parseInt(limit, 10) : 50;
    return this.flagsService.getAuditLogs(+id, l);
  }
}
