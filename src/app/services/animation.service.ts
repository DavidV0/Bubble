import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  animationPlayed = signal(true);

  constructor() {
    sessionStorage.setItem('animationPlayed', 'false');
    setTimeout(() => {
      sessionStorage.setItem('animationPlayed', 'true');
    }, 2000);
  }
}
