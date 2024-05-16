import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-overlayanmelden',
  standalone: true,
  imports: [],
  templateUrl: './overlayanmelden.component.html',
  styleUrl: './overlayanmelden.component.scss',
})
export class OverlayanmeldenComponent {
  @Input() onIptChangeShowOverlay: boolean = true;
  showOverlay: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['onIptChangeShowOverlay'].isFirstChange()) {
      this.showOverlay = true;
      setTimeout(() => (this.showOverlay = false), 4000);
    }
  }
}
