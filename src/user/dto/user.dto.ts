import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsString()
  id: string;

  @IsString()
  username: string;
}

export class UserCreateDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  usertype: string;
}

export class UserDbRecordDto {
  @IsString()
  id: string;

  @IsString()
  username: string;

  @IsDate()
  created_at: Date;

  @IsDate()
  updated_at: Date;
}
