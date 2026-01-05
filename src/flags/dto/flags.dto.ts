export class CreateFlagDto {
  key: string;
  description: string;
  defaultValue?: boolean;
  enabled?: boolean;
  rolloutPercentage?: number;
}

export class UpdateFlagDto {
  description?: string;
  defaultValue?: boolean;
  enabled?: boolean;
  rolloutPercentage?: number;
}
