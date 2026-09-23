import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@env/environment';
import { finalize } from 'rxjs';
import { AuthService } from '../../data-access/auth.service';
import { DEMO_CREDENTIALS } from '../../data-access/mock-auth.api';
import { AuthError, AuthFailureReason } from '../../domain/auth-error';
import { PASSWORD_MIN_LENGTH } from '../../domain/credentials';

const ERROR_MESSAGES: Record<AuthFailureReason, string> = {
  'invalid-credentials': 'Adresse e-mail ou mot de passe incorrect.',
  'account-locked': 'Votre compte est temporairement verrouillé. Contactez votre administrateur.',
  network: 'Impossible de joindre le serveur. Vérifiez votre connexion.',
  unknown: 'Une erreur inattendue est survenue. Veuillez réessayer.',
};

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly passwordMinLength = PASSWORD_MIN_LENGTH;
  protected readonly demo = environment.useMockAuth ? DEMO_CREDENTIALS : null;

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(PASSWORD_MIN_LENGTH)]],
    remember: [false],
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly passwordVisible = signal(false);

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  protected fillDemoCredentials(): void {
    if (this.demo) {
      this.form.patchValue({ email: this.demo.email, password: this.demo.password });
    }
  }

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, remember } = this.form.getRawValue();
    this.errorMessage.set(null);
    this.submitting.set(true);

    this.auth
      .login({ email, password }, remember)
      .pipe(
        finalize(() => this.submitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(this.returnUrl()),
        error: (error: unknown) => {
          this.errorMessage.set(ERROR_MESSAGES[error instanceof AuthError ? error.reason : 'unknown']);
          this.form.controls.password.reset();
        },
      });
  }

  /** Only honours same-app relative URLs to avoid open redirects. */
  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url?.startsWith('/') && !url.startsWith('//') ? url : '/dashboard';
  }
}
