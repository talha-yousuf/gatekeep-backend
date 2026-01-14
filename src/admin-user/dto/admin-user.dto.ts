import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsInt, IsDate } from 'class-validator';

export class AdminUserResponseDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsDate()
  updated_at: Date;
}

export class AdminUserResponseWithHashDto extends AdminUserResponseDto {
  @ApiProperty()
  @IsString()
  password_hash?: string;
}

export class CreateAdminUserDto {
  @ApiProperty({
    description: 'Username for the new admin user.',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({
    description: 'Password for the new admin user.',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
