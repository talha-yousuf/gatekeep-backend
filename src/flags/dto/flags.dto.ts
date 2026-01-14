import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFlagDto {
  @ApiProperty({ description: 'The unique key for the feature flag.' })
  @IsString()
  key: string;

  @ApiPropertyOptional({
    description: 'A description of what the flag is for.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The default value of the flag if no other rules match.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the flag is currently enabled.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description:
      'A percentage (0-100) of users for whom the flag will be enabled.',
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;
}

export class UpdateFlagDto {
  @ApiPropertyOptional({
    description: 'A description of what the flag is for.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The default value of the flag if no other rules match.',
  })
  @IsOptional()
  @IsBoolean()
  defaultValue?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the flag is currently enabled.',
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({
    description:
      'A percentage (0-100) of users for whom the flag will be enabled.',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;
}

export class FlagDto {
  @ApiPropertyOptional({ description: 'The internal ID of the flag.' })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiProperty({ description: 'The unique key for the feature flag.' })
  @IsString()
  key: string;

  @ApiPropertyOptional({
    description: 'A description of what the flag is for.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Whether the flag is currently enabled.' })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'The default value of the flag if no other rules match.',
  })
  @IsBoolean()
  defaultValue: boolean;

  @ApiProperty({
    description:
      'A percentage (0-100) of users for whom the flag will be enabled.',
  })
  @IsInt()
  @Min(0)
  @Max(100)
  rolloutPercentage: number;

  @ApiProperty({
    description: 'A set of user IDs specifically targeted by this flag.',
    type: [String],
  })
  targetedUsers: Set<string>;
}
