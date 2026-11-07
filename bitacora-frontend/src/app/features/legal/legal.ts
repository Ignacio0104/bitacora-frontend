import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-legal',
  imports: [RouterLink, Logo],
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class Legal {
  readonly page = inject(ActivatedRoute).snapshot.data['page'] as 'terminos' | 'privacidad';
}
