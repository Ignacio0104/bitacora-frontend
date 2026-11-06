import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `<img src="/assets/images/logo.jpg" alt="Bitacora Vital" [style.width]="width()" />`,
  styles: `
    :host {
      display: block;
    }
    img {
      display: block;
      max-width: 100%;
      height: auto;
      margin-inline: auto;
    }
  `,
})
export class Logo {
  readonly width = input('200px');
}
