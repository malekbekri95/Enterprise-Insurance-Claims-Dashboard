import { computed, Injectable, signal } from '@angular/core';
import { Session } from '../models/session.model';

const STORAGE_KEY = 'app.session';

/**
 * Holds the authenticated session. Persisted in localStorage when the user
 * asked to be remembered, otherwise in sessionStorage (cleared with the tab).
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly state = signal<Session | null>(this.restore());

  readonly session = this.state.asReadonly();
  readonly user = computed(() => this.state()?.user ?? null);
  readonly accessToken = computed(() => this.state()?.accessToken ?? null);

  isAuthenticated(): boolean {
    const session = this.state();
    if (session && session.expiresAt <= Date.now()) {
      this.clear();
      return false;
    }
    return session !== null;
  }

  start(session: Session, remember: boolean): void {
    this.clearStorage();
    (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session));
    this.state.set(session);
  }

  clear(): void {
    this.clearStorage();
    this.state.set(null);
  }

  private restore(): Session | null {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const session = JSON.parse(raw) as Session;
      return session.expiresAt > Date.now() ? session : null;
    } catch {
      return null;
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
