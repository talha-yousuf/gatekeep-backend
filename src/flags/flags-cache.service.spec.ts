import { Test, TestingModule } from '@nestjs/testing';
import { FlagsCacheService } from './flags-cache.service';

describe('FlagsCacheService', () => {
  let service: FlagsCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlagsCacheService],
    }).compile();

    service = module.get<FlagsCacheService>(FlagsCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
