import { Module } from '@nestjs/common';
import { AdminUserService } from './admin-user.service';
import { AdminUserController } from './admin-user.controller';
import { DbService } from '../db/db.service';

@Module({
  providers: [AdminUserService, DbService],
  controllers: [AdminUserController],
  exports: [AdminUserService],
})
export class AdminUserModule {}
