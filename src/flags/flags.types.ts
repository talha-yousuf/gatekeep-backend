export interface FeatureFlagDbRecord {
  id: number;
  key: string;
  description: string;
  enabled: boolean;
  default_value: boolean;
  rollout_percentage: number;
  created_at: Date;
  updated_at: Date;
}

export interface TargetedUserDbRecord {
  id: number;
  flag_id: number;
  user_id: string;
}

export interface AuditLogDbRecord {
  id: number;
  flag_id: number;
  actor_id: string;
  before_state: Record<string, any> | null;
  after_state: Record<string, any> | null;
  created_at: Date;
}
