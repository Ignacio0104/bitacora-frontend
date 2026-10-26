import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-feed',
  template: `
    <h1>Feed</h1>
    <p>Hola {{ auth.user()?.email }}</p>
    <button (click)="logout()">Salir</button>
  `,
})
export class Feed {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async logout() {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
