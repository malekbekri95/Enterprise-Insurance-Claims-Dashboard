import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthError, AuthFailureReason } from '../domain/auth-error';
import { AuthApi } from './auth.api';
import { LoginRequestDto, LoginResponseDto } from './auth.dto';

const toReason = (status: number): AuthFailureReason => {
  switch (status) {
    case 0:
      return 'network';
    case 400:
    case 401:
      return 'invalid-credentials';
    case 423:
      return 'account-locked';
    default:
      return 'unknown';
  }
};

@Injectable()
export class HttpAuthApi extends AuthApi {
  private readonly http = inject(HttpClient);

  login(request: LoginRequestDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${environment.apiUrl}/auth/login`, request).pipe(
      catchError((error: unknown) =>
        throwError(() => new AuthError(error instanceof HttpErrorResponse ? toReason(error.status) : 'unknown')),
      ),
    );
  }
}
