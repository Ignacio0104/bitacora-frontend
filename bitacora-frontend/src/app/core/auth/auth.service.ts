import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  roles: string[];
  profileCompleted: boolean;
}

interface SessionResponse {
  accessToken: string;
  user: SessionUser;
}

export function authErrorMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 409) return 'Cuenta ya registrada';
    if (err.error?.message === 'EMAIL_NOT_VERIFIED') return 'Verificá tu email antes de ingresar';
    return 'No pudimos iniciar sesión. Intentá de nuevo.';
  }
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'auth/email-already-in-use':
    case 'auth/account-exists-with-different-credential':
      return 'Cuenta ya registrada';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email o contraseña incorrectos';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Probá más tarde.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return '';
    default:
      return (err as Error)?.message === 'EMAIL_NOT_VERIFIED'
        ? 'Verificá tu email antes de ingresar'
        : 'Ocurrió un error. Intentá de nuevo.';
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly fb = getAuth(initializeApp(environment.firebase));
  private readonly api = environment.apiUrl;
  private refreshPromise?: Promise<string>;

  readonly accessToken = signal<string | null>(null);
  readonly user = signal<SessionUser | null>(null);
  readonly status = signal<'loading' | 'authenticated' | 'anonymous'>('loading');
  readonly isAuthenticated = computed(() => this.status() === 'authenticated');

  hasRole(role: string) {
    return this.user()?.roles.includes(role) ?? false;
  }

  /** Se ejecuta al arrancar la app: recupera la sesión con la cookie de refresh. */
  async init() {
    await this.refreshAccessToken().catch(() => this.clear());
  }

  refreshAccessToken(): Promise<string> {
    this.refreshPromise ??= firstValueFrom(
      this.http.post<SessionResponse>(`${this.api}/auth/refresh`, {}),
    )
      .then((res) => {
        this.setSession(res);
        return res.accessToken;
      })
      .finally(() => (this.refreshPromise = undefined));
    return this.refreshPromise;
  }

  async loginWithGoogle() {
    const cred = await signInWithPopup(this.fb, new GoogleAuthProvider());
    await this.createSession(cred.user);
  }

  async loginWithEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.fb, email, password);
    if (!cred.user.emailVerified) {
      await signOut(this.fb);
      throw new Error('EMAIL_NOT_VERIFIED');
    }
    await this.createSession(cred.user);
  }

  async register(email: string, password: string) {
    const cred = await createUserWithEmailAndPassword(this.fb, email, password);
    await sendEmailVerification(cred.user);
    await signOut(this.fb);
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.fb, email);
  }

  async logout() {
    await firstValueFrom(this.http.post(`${this.api}/auth/logout`, {})).catch(() => {});
    this.clear();
  }

  clear() {
    this.accessToken.set(null);
    this.user.set(null);
    this.status.set('anonymous');
  }

  setUser(user: SessionUser) {
    this.user.set(user);
  }

  private async createSession(fbUser: User) {
    try {
      const idToken = await fbUser.getIdToken();
      const res = await firstValueFrom(
        this.http.post<SessionResponse>(`${this.api}/auth/session`, { idToken }),
      );
      this.setSession(res);
    } finally {
      // Desde acá manda nuestro JWT; Firebase ya no mantiene sesión propia
      await signOut(this.fb);
    }
  }

  private setSession(res: SessionResponse) {
    this.accessToken.set(res.accessToken);
    this.user.set(res.user);
    this.status.set('authenticated');
  }
}
