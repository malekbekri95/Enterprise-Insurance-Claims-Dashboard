import { AuthResult } from '../domain/auth-user';
import { Credentials } from '../domain/credentials';
import { LoginRequestDto, LoginResponseDto } from './auth.dto';

export const toLoginRequest = ({ email, password }: Credentials): LoginRequestDto => ({
  email: email.trim().toLowerCase(),
  password,
});

export const toAuthResult = (dto: LoginResponseDto, now = Date.now()): AuthResult => ({
  accessToken: dto.access_token,
  expiresAt: now + dto.expires_in * 1000,
  user: {
    id: dto.user.id,
    fullName: `${dto.user.first_name} ${dto.user.last_name}`.trim(),
    email: dto.user.email,
    role: dto.user.role,
    avatarUrl: dto.user.avatar_url ?? undefined,
  },
});
