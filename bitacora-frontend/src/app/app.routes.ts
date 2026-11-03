import { Routes } from '@angular/router';
import {
  guestGuard,
  profileGuard,
  studentAreaGuard,
  studentGuard,
  subscribeGuard,
} from './core/auth/guards';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'completar-perfil',
    canActivate: [profileGuard],
    loadComponent: () =>
      import('./features/complete-profile/complete-profile').then((m) => m.CompleteProfile),
  },
  {
    path: 'video/:id',
    canActivate: [studentAreaGuard],
    loadComponent: () => import('./features/watch/watch').then((m) => m.Watch),
  },
  {
    path: 'suscribirse',
    canActivate: [subscribeGuard],
    loadComponent: () => import('./features/subscribe/subscribe').then((m) => m.Subscribe),
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [studentGuard],
    loadComponent: () => import('./features/feed/feed').then((m) => m.Feed),
  },
  { path: '**', redirectTo: '' },
];
