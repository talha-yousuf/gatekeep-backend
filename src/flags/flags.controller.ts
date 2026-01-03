import { Controller, Get } from '@nestjs/common';
import { FlagsService } from './flags.service';

@Controller('flags')
export class FlagsController {
  constructor(private readonly flagsService: FlagsService) {}

  @Get()
  async getAll() {
    return this.flagsService.getAllFlags();
  }
}
