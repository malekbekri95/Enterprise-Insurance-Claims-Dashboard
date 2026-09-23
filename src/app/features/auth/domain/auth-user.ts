export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface AuthResult {
  accessToken: string;
  /** Expiry as a Unix epoch in milliseconds. */
  expiresAt: number;
  user: AuthUser;
}
