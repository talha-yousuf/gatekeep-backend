import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FlagsService } from './flags.service';
import { CreateFlagDto, UpdateFlagDto } from './dto/flags.dto';
import { UserDto } from 'src/user/dto/user.dto';

@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Get()
  getAll() {
    return this.flagsService.getAllFlags();
  }

  @Get('evaluate')
  evaluate(@Query('userId') userId: string) {
    return this.flagsService.evaluateFlagsForUser(userId);
  }

  @Post()
  create(@Body() dto: CreateFlagDto) {
    // todo: get actorId from auth context
    const actorId = 'system';
    return this.flagsService.createFlag(dto, actorId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFlagDto) {
    // todo: get actorId from auth context
    const actorId = 'system';
    return this.flagsService.updateFlag(+id, dto, actorId);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    // todo: get actorId from auth context
    const actorId = 'system';
    return this.flagsService.deleteFlag(+id, actorId);
  }

  @Post(':id/target')
  addTarget(@Param('id') id: string, @Body() dto: UserDto) {
    return this.flagsService.addTargetUser(+id, dto);
  }

  @Delete(':id/target/:userId')
  removeTarget(@Param('id') id: string, @Param('userId') userId: string) {
    return this.flagsService.removeTargetUser(+id, userId);
  }
}
