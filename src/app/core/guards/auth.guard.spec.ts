import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { SessionStore } from '../services/session.store';
import { authGuard, guestGuard } from './auth.guard';

describe('auth guards', () => {
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/dashboard' } as RouterStateSnapshot;
  const run = (guard: typeof authGuard) => TestBed.runInInjectionContext(() => guard(route, state));

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('redirects anonymous users to login with a returnUrl', () => {
    const result = run(authGuard) as UrlTree;
    expect(result.toString()).toBe('/login?returnUrl=%2Fdashboard');
    expect(run(guestGuard)).toBeTrue();
  });

  it('lets authenticated users through and keeps them off the login page', () => {
    TestBed.inject(SessionStore).start(
      { accessToken: 't', expiresAt: Date.now() + 60_000, user: { id: '1', fullName: 'A B', email: 'a@b.c', role: 'r' } },
      false,
    );
    expect(run(authGuard)).toBeTrue();
    expect((run(guestGuard) as UrlTree).toString()).toBe('/dashboard');
  });

  it('treats an expired session as anonymous', () => {
    TestBed.inject(SessionStore).start(
      { accessToken: 't', expiresAt: Date.now() - 1, user: { id: '1', fullName: 'A B', email: 'a@b.c', role: 'r' } },
      false,
    );
    expect(run(authGuard)).toBeInstanceOf(UrlTree);
  });
});
