import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Playback, VideosService } from '../../core/videos/videos.service';
import { VideoPlayer } from '../../video-player/video-player';

@Component({
  selector: 'app-watch',
  imports: [VideoPlayer, RouterLink],
  templateUrl: './watch.html',
  styleUrl: './watch.css',
})
export class Watch implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly videos = inject(VideosService);

  readonly playback = signal<Playback | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);

  async ngOnInit() {
    try {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.playback.set(await firstValueFrom(this.videos.playback(id)));
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
