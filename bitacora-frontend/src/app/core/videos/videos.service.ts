import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface VideoItem {
  id: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

export interface Playback {
  id: string;
  title: string;
  youtubeId: string;
}

@Injectable({ providedIn: 'root' })
export class VideosService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  list() {
    return this.http.get<VideoItem[]>(`${this.api}/videos`);
  }

  playback(id: string) {
    return this.http.get<Playback>(`${this.api}/videos/${id}/playback`);
  }
}
