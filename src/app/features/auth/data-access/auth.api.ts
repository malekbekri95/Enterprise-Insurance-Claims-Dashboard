import { Observable } from 'rxjs';
import { LoginRequestDto, LoginResponseDto } from './auth.dto';

/** Transport contract for authentication; see HttpAuthApi and MockAuthApi. */
export abstract class AuthApi {
  abstract login(request: LoginRequestDto): Observable<LoginResponseDto>;
}
