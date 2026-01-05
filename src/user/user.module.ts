import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DbService } from '../db/db.service';
import { FlagsService } from '../flags/flags.service';

@Module({
  controllers: [UserController],
  providers: [UserService, DbService, FlagsService],
})
export class UserModule {}
