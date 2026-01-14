import { IsString, MinLength, IsInt, IsDate } from 'class-validator';

export class AdminUserResponseDto {
  @IsInt()
  id: number;

  @IsString()
  username: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
}

export class AdminUserResponseWithHashDto extends AdminUserResponseDto {
  @IsString()
  password_hash?: string;
}

export class CreateAdminUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}
