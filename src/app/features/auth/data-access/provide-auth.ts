import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { environment } from '@env/environment';
import { AuthApi } from './auth.api';
import { HttpAuthApi } from './http-auth.api';
import { MockAuthApi } from './mock-auth.api';

export const provideAuth = (): EnvironmentProviders =>
  makeEnvironmentProviders([{ provide: AuthApi, useClass: environment.useMockAuth ? MockAuthApi : HttpAuthApi }]);
