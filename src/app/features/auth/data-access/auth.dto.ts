export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  access_token: string;
  /** Token lifetime in seconds. */
  expires_in: number;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    avatar_url?: string | null;
  };
}
