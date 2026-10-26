import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, authErrorMessage } from '../../core/auth/auth.service';
import { homeFor } from '../../core/auth/guards';

type Mode = 'login' | 'register' | 'reset';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<Mode>('login');
  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly info = signal('');

  readonly title = computed(
    () =>
      ({ login: 'Bienvenido', register: 'Crear cuenta', reset: 'Recuperar contraseña' })[
        this.mode()
      ],
  );
  readonly cta = computed(
    () => ({ login: 'Ingresar', register: 'Registrarme', reset: 'Enviar enlace' })[this.mode()],
  );

  setMode(mode: Mode) {
    this.mode.set(mode);
    this.error.set('');
    this.info.set('');
  }

  google() {
    return this.run(() => this.auth.loginWithGoogle());
  }

  submit(event: Event) {
    event.preventDefault();
    const email = this.email().trim();
    const password = this.password();

    switch (this.mode()) {
      case 'login':
        return this.run(() => this.auth.loginWithEmail(email, password));
      case 'register':
        return this.run(async () => {
          await this.auth.register(email, password);
          this.setMode('login');
          this.info.set(
            'Te enviamos un email para verificar tu cuenta. Verificalo y después ingresá.',
          );
        }, false);
      case 'reset':
        return this.run(async () => {
          await this.auth.resetPassword(email);
          this.info.set(
            'Si el email existe, te enviamos un enlace para restablecer la contraseña.',
          );
        }, false);
    }
  }

  private async run(action: () => Promise<void>, navigate = true) {
    this.loading.set(true);
    this.error.set('');
    this.info.set('');
    try {
      await action();
      const user = this.auth.user();
      if (navigate && user) await this.router.navigateByUrl(homeFor(user));
    } catch (err) {
      this.error.set(authErrorMessage(err));
    } finally {
      this.loading.set(false);
    }
  }
}
