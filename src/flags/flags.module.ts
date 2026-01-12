import { Module } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { FlagsController } from './flags.controller';
import { DbService } from 'src/db/db.service';
import { FlagsCacheService } from './flags-cache.service';

@Module({
  providers: [FlagsService, DbService, FlagsCacheService],
  controllers: [FlagsController],
  exports: [FlagsService],
})
export class FlagsModule {}
