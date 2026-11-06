import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { VideoItem, VideosService } from '../../core/videos/videos.service';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-feed',
  imports: [RouterLink, Logo],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly videosService = inject(VideosService);
  private readonly router = inject(Router);

  readonly videos = signal<VideoItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  async ngOnInit() {
    try {
      this.videos.set(await firstValueFrom(this.videosService.list()));
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  duration(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }

  async logout() {
    await this.auth.logout();
    await this.router.navigate(['/login']);
  }
}
