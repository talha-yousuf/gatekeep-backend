import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ description: 'The unique ID of the user.' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The username of the user.' })
  @IsString()
  username: string;
}

export class UserCreateDto {
  @ApiProperty({ description: 'The username for the new user.' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'The type of user (e.g., tenant, user, anon).',
  })
  @IsString()
  @IsNotEmpty()
  usertype: string;
}

export class UserDbRecordDto {
  @ApiProperty({ description: 'The unique ID of the user.' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'The username of the user.' })
  @IsString()
  username: string;

  @ApiProperty({ description: 'The timestamp when the user was created.' })
  @IsDate()
  created_at: Date;

  @ApiProperty({ description: 'The timestamp when the user was last updated.' })
  @IsDate()
  updated_at: Date;
}
