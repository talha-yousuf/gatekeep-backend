import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CreateFlagDto, UpdateFlagDto } from './dto/flags.dto';
import { UserDto } from 'src/user/dto/user.dto';
import * as crypto from 'crypto';
import { FlagsCacheService } from './flags-cache.service';

@Injectable()
export class FlagsService {
  constructor(
    private readonly db: DbService,
    private readonly cache: FlagsCacheService,
  ) {}

  // ------------------ FLAGS CRUD ------------------

  async getFlagById(id: number) {
    const result = await this.db.query(
      'SELECT * FROM feature_flags WHERE id=$1',
      [id],
    );

    return result.rows[0] as Record<string, any>;
  }

  async createFlag(dto: CreateFlagDto, actorId: string) {
    const result = await this.db.query(
      `INSERT INTO feature_flags
      (key, description, enabled, default_value, rollout_percentage)
      VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        dto.key,
        dto.description || '',
        dto.enabled || false,
        dto.defaultValue || false,
        dto.rolloutPercentage || 0,
      ],
    );

    const createdFlag = result.rows[0] as Record<string, any>;

    await this.cache.refreshCache();
    await this.logAudit(createdFlag.id as number, actorId, null, createdFlag);

    return createdFlag;
  }

  async updateFlag(id: number, dto: UpdateFlagDto, actorId: string) {
    const before = await this.getFlagById(id);
    if (!before) throw new Error('Flag not found');

    const result = await this.db.query(
      `UPDATE feature_flags SET
      description=COALESCE($1, description),
      enabled=COALESCE($2, enabled),
      default_value=COALESCE($3, default_value),
      rollout_percentage=COALESCE($4, rollout_percentage),
      updated_at=NOW()
      WHERE id=$5 RETURNING *`,
      [
        dto.description,
        dto.enabled,
        dto.defaultValue,
        dto.rolloutPercentage,
        id,
      ],
    );

    const updatedFlag = result.rows[0] as Record<string, any>;

    await this.cache.refreshCache();
    await this.logAudit(id, actorId, before, updatedFlag);

    return updatedFlag;
  }

  async deleteFlag(id: number, actorId: string) {
    const before = await this.getFlagById(id);
    if (!before) throw new Error('Flag not found');

    await this.db.query('DELETE FROM feature_flags WHERE id=$1', [id]);

    await this.cache.refreshCache();
    await this.logAudit(id, actorId, before, null);

    return { deleted: true };
  }

  getAllFlags() {
    // const result = await this.db.query('SELECT * FROM feature_flags');
    // return result.rows as Record<string, any>[];
    return this.cache.getAllFlagsFromCache();
  }

  // ------------------ Mapping Users to Flags ------------------

  async addTargetUser(flagId: number, dto: UserDto) {
    const result = await this.db.query(
      'INSERT INTO targeted_users (flag_id, user_id) VALUES ($1,$2) RETURNING *',
      [flagId, dto.id],
    );

    await this.cache.refreshCache();

    return result;
  }

  async removeTargetUser(flagId: number, userId: string) {
    const result = await this.db.query(
      'DELETE FROM targeted_users WHERE flag_id=$1 AND user_id=$2',
      [flagId, userId],
    );

    await this.cache.refreshCache();

    return result;
  }

  async getTargetedUsers(flagId: number) {
    const result = await this.db.query(
      'SELECT user_id FROM targeted_users WHERE flag_id=$1',
      [flagId],
    );
    return result.rows.map((r: Record<string, string>) => r.user_id);
  }

  // ------------------ Evaluation ------------------

  async evaluateFlagsForUser(userId: string) {
    const result = this.getAllFlags();
    const evaluated: Record<string, boolean> = {};

    for (const flag of result) {
      evaluated[flag.key] = await this.evaluateFlag(flag, userId);
    }
    return evaluated;
  }

  private async evaluateFlag(
    flag: Record<string, any>,
    userId: string,
  ): Promise<boolean> {
    if (!flag.enabled) return false;

    const targetedUsers = await this.getTargetedUsers(flag.id as number);
    if (targetedUsers.includes(userId)) return true;

    if (flag.rollout_percentage && flag.rollout_percentage > 0) {
      const hash = crypto
        .createHash('sha256')
        .update(userId + flag.key)
        .digest('hex');
      const val = parseInt(hash.slice(0, 8), 16) % 100;
      if (val < flag.rollout_percentage) return true;
    }

    return flag.default_value as boolean;
  }

  // ------------------ Audit Logging ------------------

  private async logAudit(
    flagId: number,
    actorId: string,
    before: any,
    after: any,
  ) {
    await this.db.query(
      'INSERT INTO audit_log (flag_id, actor_id, before_state, after_state) VALUES ($1,$2,$3,$4)',
      [
        flagId,
        actorId,
        before ? JSON.stringify(before) : null,
        after ? JSON.stringify(after) : null,
      ],
    );
  }

  async getAuditLogs(flagId: number, limit: number) {
    const res = await this.db.query(
      'SELECT * FROM audit_log WHERE flag_id=$1 ORDER BY created_at DESC LIMIT $2',
      [flagId, limit],
    );

    return res.rows as Record<string, any>[];
  }
}
