import { Injectable } from '@angular/core';
import { delay, Observable, of, switchMap, throwError, timer } from 'rxjs';
import { AuthError } from '../domain/auth-error';
import { AuthApi } from './auth.api';
import { LoginRequestDto, LoginResponseDto } from './auth.dto';

/** Demo account accepted by the mock backend (development only). */
export const DEMO_CREDENTIALS = {
  email: 'sophie.dubois@example.com',
  password: 'Sinistres2026!',
} as const;

const LATENCY_MS = 700;

@Injectable()
export class MockAuthApi extends AuthApi {
  login({ email, password }: LoginRequestDto): Observable<LoginResponseDto> {
    if (email !== DEMO_CREDENTIALS.email || password !== DEMO_CREDENTIALS.password) {
      return timer(LATENCY_MS).pipe(switchMap(() => throwError(() => new AuthError('invalid-credentials'))));
    }
    return of<LoginResponseDto>({
      access_token: `mock.${crypto.randomUUID()}`,
      expires_in: 8 * 60 * 60,
      user: {
        id: 'u-001',
        first_name: 'Sophie',
        last_name: 'Dubois',
        email,
        role: 'Responsable Sinistres',
        avatar_url: 'assets/images/login-hero.jpg',
      },
    }).pipe(delay(LATENCY_MS));
  }
}
