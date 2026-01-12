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
} from '@nestjs/common';
import { FlagsService } from './flags.service';
import { CreateFlagDto, UpdateFlagDto } from './dto/flags.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Get('evaluate')
  evaluate(@Query('userId') userId: string) {
    return this.flagsService.evaluateFlagsForUser(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getAll() {
    return this.flagsService.getAllFlags();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() dto: CreateFlagDto) {
    // todo: get actorId from auth context
    const actorId = 'system';
    return this.flagsService.createFlag(dto, actorId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFlagDto) {
    // todo: get actorId from auth context
    const actorId = 'system';
    return this.flagsService.updateFlag(+id, dto, actorId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id') id: string) {
    // todo: get actorId from auth context
    const actorId = 'system';
    return this.flagsService.deleteFlag(+id, actorId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/target')
  addTarget(@Param('id') id: string, @Body() dto: UserDto) {
    return this.flagsService.addTargetUser(+id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id/target/:userId')
  removeTarget(@Param('id') id: string, @Param('userId') userId: string) {
    return this.flagsService.removeTargetUser(+id, userId);
  }
}
