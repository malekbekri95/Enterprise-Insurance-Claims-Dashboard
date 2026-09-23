import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionStore } from '@core/services/session.store';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly user = this.session.user;

  protected logout(): void {
    this.session.clear();
    void this.router.navigate(['/login']);
  }
}
