import { Module } from '@nestjs/common';
import { FlagsService } from './flags.service';
import { FlagsController } from './flags.controller';
import { DbService } from 'src/db/db.service';

@Module({
  providers: [FlagsService, DbService],
  controllers: [FlagsController],
})
export class FlagsModule {}
