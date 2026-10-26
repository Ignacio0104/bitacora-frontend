import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, SessionUser } from './auth.service';

export function homeFor(user: SessionUser): string {
  if (!user.profileCompleted) return '/completar-perfil';
  if (!user.roles.includes('activeStudent')) return '/suscribirse';
  return '/';
}

/** Solo para usuarios sin sesión (login). */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  return user ? router.parseUrl(homeFor(user)) : true;
};

/** Genera un guard que deja pasar solo si el usuario debe estar en `path`. */
function guardFor(path: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.user();
    if (!user) return router.parseUrl('/login');
    const home = homeFor(user);
    return home === path ? true : router.parseUrl(home);
  };
}

export const profileGuard = guardFor('/completar-perfil');
export const subscribeGuard = guardFor('/suscribirse');
export const studentGuard = guardFor('/');
