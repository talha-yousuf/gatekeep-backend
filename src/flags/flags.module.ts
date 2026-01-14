import { Module } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { FlagsController } from './flags.controller';
import { DbModule } from 'src/db/db.module';
import { FlagsCacheService } from './flags-cache.service';

@Module({
  imports: [DbModule],
  providers: [FlagsService, FlagsCacheService],
  controllers: [FlagsController],
  exports: [FlagsService],
})
export class FlagsModule {}
