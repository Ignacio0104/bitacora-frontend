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

  private player: any;

  constructor() {
    // En el fallback (iPhone) bloqueamos el scroll de la página de fondo
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
        onReady: () => this.ready.set(true),
        onStateChange: (e: { data: number }) => this.playing.set(e.data === 1),
        onError: (e: { data: number }) => console.error('Error del player:', e.data),
      },
    });
  }

  togglePlay() {
    if (!this.ready()) return;
    this.playing() ? this.player.pauseVideo() : this.player.playVideo();
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
      this.pseudoFullscreen.set(true); // iPhone: pantalla completa por CSS
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
    document.body.style.overflow = '';
    this.player?.destroy();
  }
}
