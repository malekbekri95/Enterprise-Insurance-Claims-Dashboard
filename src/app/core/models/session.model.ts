export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface Session {
  accessToken: string;
  /** Expiry as a Unix epoch in milliseconds. */
  expiresAt: number;
  user: SessionUser;
}
