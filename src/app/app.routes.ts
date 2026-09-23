import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    title: 'Connexion · Portail Sinistres',
    canActivate: [guestGuard],
    loadComponent: () => import('@features/auth/feature/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'dashboard',
    title: 'Tableau de bord · Portail Sinistres',
    canActivate: [authGuard],
    loadComponent: () =>
      import('@features/dashboard/feature/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
