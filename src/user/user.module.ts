import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DbService } from '../db/db.service';
import { FlagsService } from '../flags/flags.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, DbService, FlagsService],
  exports: [UserService],
})
export class UserModule {}
