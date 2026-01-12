export class AdminUserResponseDto {
  id: number;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export class AdminUserResponseWithHashDto {
  id: number;
  username: string;
  created_at: Date;
  updated_at: Date;
  password_hash?: string;
}
