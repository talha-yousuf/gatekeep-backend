import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Injectable()
export class FlagsService {
  constructor(private readonly db: DbService) {}

  async getAllFlags() {
    const result = await this.db.query('SELECT * FROM feature_flags');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result.rows;
  }
}
