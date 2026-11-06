import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { loadYouTubeApi } from './youtube-api';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.html',
  styleUrl: './video-player.css',
  host: {
    '(document:fullscreenchange)': 'syncFullscreen()',
    '(document:webkitfullscreenchange)': 'syncFullscreen()',
    '(document:keydown.escape)': 'pseudoFullscreen.set(false)',
  },
})
export class VideoPlayer implements AfterViewInit, OnDestroy {
  readonly youtubeId = input.required<string>();

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');

  readonly ready = signal(false);
  readonly playing = signal(false);
  readonly nativeFullscreen = signal(false);
  readonly pseudoFullscreen = signal(false);

  readonly currentTime = signal(0);
  readonly duration = signal(0);
  private readonly scrubbing = signal(false);

  private player: any;
  private timer?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      document.body.style.overflow = this.pseudoFullscreen() ? 'hidden' : '';
    });
  }

  async ngAfterViewInit() {
    await loadYouTubeApi();
    this.player = new window.YT.Player(this.host().nativeElement, {
      videoId: this.youtubeId(),
      host: 'https://www.youtube-nocookie.com',
      width: '100%',
      height: '100%',
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        disablekb: 1,
        iv_load_policy: 3,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          this.ready.set(true);
          this.duration.set(this.player.getDuration() || 0);
        },
        onStateChange: (e: { data: number }) => {
          this.playing.set(e.data === 1);
          if (!this.duration()) this.duration.set(this.player.getDuration() || 0);
        },
        onError: (e: { data: number }) => console.error('Error del player:', e.data),
      },
    });

    // Actualiza la barra de progreso unas 4 veces por segundo
    this.timer = setInterval(() => {
      if (this.ready() && !this.scrubbing()) {
        this.currentTime.set(this.player.getCurrentTime() || 0);
      }
    }, 250);
  }

  togglePlay() {
    if (!this.ready()) return;
    this.playing() ? this.player.pauseVideo() : this.player.playVideo();
  }

  /** Mientras se arrastra: solo mueve la barra, sin saltar el video. */
  onScrub(event: Event) {
    this.scrubbing.set(true);
    this.currentTime.set(Number((event.target as HTMLInputElement).value));
  }

  /** Al soltar: salta al punto elegido. */
  onSeek(event: Event) {
    const seconds = Number((event.target as HTMLInputElement).value);
    this.player.seekTo(seconds, true);
    this.currentTime.set(seconds);
    this.scrubbing.set(false);
  }

  skip(delta: number) {
    if (!this.ready()) return;
    const target = Math.min(Math.max(this.player.getCurrentTime() + delta, 0), this.duration());
    this.player.seekTo(target, true);
    this.currentTime.set(target);
  }

  format(seconds: number) {
    const s = Math.floor(seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
  }

  toggleFullscreen() {
    const doc = document as any;
    const el = this.container().nativeElement as any;

    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
      return;
    }
    if (this.pseudoFullscreen()) {
      this.pseudoFullscreen.set(false);
      return;
    }

    const request = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!request) {
      this.pseudoFullscreen.set(true);
      return;
    }
    try {
      Promise.resolve(request.call(el)).catch(() => this.pseudoFullscreen.set(true));
    } catch {
      this.pseudoFullscreen.set(true);
    }
  }

  syncFullscreen() {
    const doc = document as any;
    this.nativeFullscreen.set(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    document.body.style.overflow = '';
    this.player?.destroy();
  }
}
