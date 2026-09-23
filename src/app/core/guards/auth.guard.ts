import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStore } from '../services/session.store';

/** Lets authenticated users through; sends everyone else to the login page. */
export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(SessionStore).isAuthenticated()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Keeps already authenticated users away from guest-only pages such as login. */
export const guestGuard: CanActivateFn = () =>
  inject(SessionStore).isAuthenticated() ? inject(Router).createUrlTree(['/dashboard']) : true;
