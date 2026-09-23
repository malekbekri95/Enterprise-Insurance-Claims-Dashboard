export type AuthFailureReason = 'invalid-credentials' | 'account-locked' | 'network' | 'unknown';

export class AuthError extends Error {
  constructor(readonly reason: AuthFailureReason) {
    super(`Authentication failed: ${reason}`);
    this.name = 'AuthError';
  }
}
