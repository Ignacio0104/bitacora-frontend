import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, SessionUser } from '../../core/auth/auth.service';
import { homeFor } from '../../core/auth/guards';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-complete-profile',
  templateUrl: './complete-profile.html',
  styleUrl: './complete-profile.css',
  imports: [Logo],
})
export class CompleteProfile {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly firstName = signal(this.auth.user()?.firstName ?? '');
  readonly lastName = signal(this.auth.user()?.lastName ?? '');
  readonly loading = signal(false);
  readonly error = signal('');

  async submit(event: Event) {
    event.preventDefault();
    this.loading.set(true);
    this.error.set('');
    try {
      const user = await firstValueFrom(
        this.http.patch<SessionUser>(`${environment.apiUrl}/me`, {
          firstName: this.firstName().trim(),
          lastName: this.lastName().trim(),
        }),
      );
      this.auth.setUser(user);
      await this.router.navigateByUrl(homeFor(user));
    } catch {
      this.error.set('No pudimos guardar tus datos. Intentá de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
