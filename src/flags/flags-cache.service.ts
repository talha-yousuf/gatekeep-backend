import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { FlagDto } from './dto/flags.dto';
import { FeatureFlagDbRecord, TargetedUserDbRecord } from './flags.types';

const REFRESH_INTERVAL_MS = 300 * 1000; // 5 minutes

const DEFAULT_FLAG_NOT_FOUND: FlagDto = {
  id: -1, // Use an invalid ID for a non-existent flag
  key: 'NOT_FOUND',
  description: 'Default fallback for unknown flag.',
  enabled: false,
  defaultValue: false,
  rolloutPercentage: 0,
  targetedUsers: new Set<string>(),
};

@Injectable()
export class FlagsCacheService implements OnModuleInit {
  private readonly logger = new Logger(FlagsCacheService.name);
  private cache = new Map<string, FlagDto>();

  constructor(private readonly db: DbService) {}

  async onModuleInit() {
    this.logger.log(
      'FlagsCacheService initialized. Performing initial refresh...',
    );
    await this.refreshCache();
    this.logger.log(
      `Scheduled cache refresh every ${REFRESH_INTERVAL_MS / 1000} seconds.`,
    );
    setInterval(() => {
      this.refreshCache();
    }, REFRESH_INTERVAL_MS);
  }

  async refreshCache() {
    const startTime = process.hrtime.bigint();
    this.logger.log('Starting cache refresh...');
    try {
      const flagsRes = await this.db.query<FeatureFlagDbRecord>(`
        SELECT id, key, enabled, default_value, rollout_percentage
        FROM feature_flags
      `);

      const targetsRes = await this.db.query<TargetedUserDbRecord>(`
        SELECT flag_id, user_id FROM targeted_users
      `);

      const targetsByFlag = new Map<number, Set<string>>();

      for (const row of targetsRes.rows) {
        if (!targetsByFlag.has(row.flag_id)) {
          targetsByFlag.set(row.flag_id, new Set());
        }
        targetsByFlag.get(row.flag_id)!.add(row.user_id);
      }

      const nextCache = new Map<string, FlagDto>();

      for (const flag of flagsRes.rows) {
        nextCache.set(flag.key, {
          id: flag.id,
          key: flag.key,
          enabled: flag.enabled,
          defaultValue: flag.default_value,
          rolloutPercentage: flag.rollout_percentage,
          targetedUsers: targetsByFlag.get(flag.id) ?? new Set(),
        });
      }

      this.cache = nextCache;
      const endTime = process.hrtime.bigint();
      const durationMs = Number(endTime - startTime) / 1_000_000;
      this.logger.log(
        `Cache refresh completed in ${durationMs.toFixed(
          2,
        )} ms. Cached ${this.cache.size} flags.`,
      );
    } catch (error) {
      const e = error as Error;
      this.logger.error(`Cache refresh failed: ${e.message}`, e.stack);
      // Optionally, set cache to empty or a known safe state on severe failure
      // For now, we keep the old cache or an empty one if initial refresh fails.
    }
  }

  getAllFlagsFromCache(): FlagDto[] {
    if (this.cache.size === 0) {
      this.logger.warn('Accessing an empty flag cache. No flags are active.');
    }
    return Array.from(this.cache.values());
  }

  getFlagByKeyFromCache(key: string): FlagDto {
    const flag = this.cache.get(key);
    if (flag) {
      this.logger.debug(`Cache hit for flag: ${key}`);
      return flag;
    }
    this.logger.warn(
      `Cache miss for flag: ${key}. Returning default fallback.`,
    );
    return DEFAULT_FLAG_NOT_FOUND;
  }
}
