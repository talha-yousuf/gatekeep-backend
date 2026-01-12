import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbService } from './db/db.service';
import { FlagsModule } from './flags/flags.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminUserModule } from './admin-user/admin-user.module';

@Module({
  imports: [FlagsModule, UserModule, AuthModule, AdminUserModule],
  controllers: [AppController],
  providers: [AppService, DbService],
  exports: [DbService],
})
export class AppModule {}
