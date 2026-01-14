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
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FlagsService } from './flags.service';
import { CreateFlagDto, UpdateFlagDto } from './dto/flags.dto';
import { UserDto } from 'src/user/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminUserResponseDto } from 'src/admin-user/dto/admin-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Flags')
@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Get('evaluate')
  @ApiOperation({
    summary: 'Evaluate all flags for a given user',
    description:
      'This is a public endpoint used by clients to get flag values.',
  })
  @ApiQuery({ name: 'userId', type: String, required: true })
  @ApiResponse({
    status: 200,
    description: 'A map of flag keys to their boolean values.',
  })
  evaluate(@Query('userId') userId: string) {
    return this.flagsService.evaluateFlagsForUser(userId);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all feature flags' })
  @ApiResponse({
    status: 200,
    description: 'An array of all feature flags.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAll() {
    return this.flagsService.getAllFlags();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new feature flag' })
  @ApiResponse({
    status: 201,
    description: 'The newly created feature flag.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a feature flag' })
  @ApiResponse({ status: 200, description: 'The updated feature flag.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Flag not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFlagDto,
    @Request()
    req: {
      user: AdminUserResponseDto;
    },
  ) {
    const actorId = req.user.username;
    return this.flagsService.updateFlag(id, dto, actorId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a feature flag' })
  @ApiResponse({ status: 204, description: 'Flag successfully deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Flag not found.' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request()
    req: {
      user: AdminUserResponseDto;
    },
  ) {
    const actorId = req.user.username;
    await this.flagsService.deleteFlag(id, actorId);
  }

  @Post(':id/target')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a user to a flags target list' })
  @ApiResponse({ status: 201, description: 'The targeting relationship.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addTarget(@Param('id', ParseIntPipe) id: number, @Body() userDto: UserDto) {
    return this.flagsService.addTargetUser(id, userDto);
  }

  @Delete(':id/target/:userId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a user from a flags target list' })
  @ApiResponse({
    status: 204,
    description: 'Targeting relationship successfully deleted.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async removeTarget(
    @Param('id', ParseIntPipe) id: number,
    @Param('userId') userId: string,
  ) {
    await this.flagsService.removeTargetUser(id, userId);
  }

  @Get(':id/audit')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the audit log for a feature flag' })
  @ApiResponse({ status: 200, description: 'An array of audit log entries.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'The ID of the feature flag.' })
  @ApiQuery({
    name: 'limit',
    description: 'The maximum number of audit logs to return.',
    required: false,
  })
  getAudit(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.flagsService.getAuditLogs(id, limit);
  }
}
