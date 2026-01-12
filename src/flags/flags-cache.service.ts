import { Injectable, OnModuleInit } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import { FlagDto } from './dto/flags.dto';

@Injectable()
export class FlagsCacheService implements OnModuleInit {
  private cache = new Map<string, FlagDto>();

  constructor(private readonly db: DbService) {}

  async onModuleInit() {
    await this.refreshCache();
  }

  async refreshCache() {
    const flagsRes: {
      rows: Array<{
        id: number;
        key: string;
        enabled: boolean;
        default_value: boolean;
        rollout_percentage: number;
      }>;
    } = await this.db.query(`
      SELECT id, key, enabled, default_value, rollout_percentage
      FROM feature_flags
    `);

    const targetsRes: {
      rows: Array<{
        flag_id: number;
        user_id: string;
      }>;
    } = await this.db.query(`
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
  }

  getAllFlagsFromCache(): FlagDto[] {
    return Array.from(this.cache.values());
  }

  getFlagByKeyFromCache(key: string): FlagDto | undefined {
    return this.cache.get(key);
  }
}
