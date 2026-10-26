import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-subscribe',
  template: `
    <h1>Suscribite</h1>
    <button (click)="logout()">Salir</button>
  `,
})
export class Subscribe {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async logout() {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
