import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SessionStore } from '@core/services/session.store';
import { AuthApi } from '../../data-access/auth.api';
import { DEMO_CREDENTIALS, MockAuthApi } from '../../data-access/mock-auth.api';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jasmine.clock().install();
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthApi, useClass: MockAuthApi }],
    });
  });

  afterEach(() => jasmine.clock().uninstall());

  const setup = () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const type = (selector: string, value: string) => {
      const input = el.querySelector<HTMLInputElement>(selector)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };
    return { fixture, el, type, submit };
  };

  it('shows validation errors when submitting an empty form', () => {
    const { el, submit } = setup();
    submit();
    expect(el.querySelector('#email-error')?.textContent).toContain('obligatoire');
    expect(el.querySelector('#password-error')?.textContent).toContain('obligatoire');
  });

  it('opens a session and navigates to the dashboard on valid credentials', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    const { type, submit } = setup();
    type('#email', DEMO_CREDENTIALS.email);
    type('#password', DEMO_CREDENTIALS.password);
    submit();
    jasmine.clock().tick(1000);

    expect(TestBed.inject(SessionStore).user()?.fullName).toBe('Sophie Dubois');
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error on invalid credentials', () => {
    const { fixture, el, type, submit } = setup();
    type('#email', DEMO_CREDENTIALS.email);
    type('#password', 'wrong-password');
    submit();
    jasmine.clock().tick(1000);
    fixture.detectChanges();

    expect(el.querySelector('[role="alert"]')?.textContent).toContain('incorrect');
    expect(TestBed.inject(SessionStore).isAuthenticated()).toBeFalse();
  });
});
