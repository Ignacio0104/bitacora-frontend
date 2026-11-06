import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/auth/auth.service';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-subscribe',
  templateUrl: './subscribe.html',
  styleUrl: './subscribe.css',
  imports: [Logo],
})
export class Subscribe {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly instagramUrl = `https://instagram.com/${environment.instagramHandle}`;
  readonly instagramHandle = `@${environment.instagramHandle}`;

  readonly whatsappUrl = computed(() => {
    const u = this.auth.user();
    const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ');
    const text =
      `Hola! Quiero inscribirme a las clases.` +
      (name ? ` Soy ${name}.` : '') +
      (u?.email ? ` Mi email de registro es ${u.email}.` : '');
    return `https://wa.me/${environment.whatsappNumber}?text=${encodeURIComponent(text)}`;
  });

  async logout() {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
