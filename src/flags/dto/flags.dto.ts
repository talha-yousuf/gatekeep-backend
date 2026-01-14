import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFlagDto {
  @IsString()
  key: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;
}

export class UpdateFlagDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;
}

export class FlagDto {
  @IsInt()
  id: number;

  @IsString()
  key: string;

  @IsBoolean()
  enabled: boolean;

  @IsBoolean()
  defaultValue: boolean;

  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage: number;

  targetedUsers: Set<string>;
}
