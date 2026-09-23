import { inject, Injectable } from '@angular/core';
import { SessionStore } from '@core/services/session.store';
import { map, Observable, tap } from 'rxjs';
import { AuthUser } from '../domain/auth-user';
import { Credentials } from '../domain/credentials';
import { AuthApi } from './auth.api';
import { toAuthResult, toLoginRequest } from './auth.mapper';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApi);
  private readonly session = inject(SessionStore);

  /** Authenticates and opens a session. Errors are emitted as AuthError. */
  login(credentials: Credentials, remember: boolean): Observable<AuthUser> {
    return this.api.login(toLoginRequest(credentials)).pipe(
      map((dto) => toAuthResult(dto)),
      tap((result) => this.session.start(result, remember)),
      map((result) => result.user),
    );
  }

  logout(): void {
    this.session.clear();
  }
}
