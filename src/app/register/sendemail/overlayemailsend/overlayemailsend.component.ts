import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-overlayemailsend',
  standalone: true,
  imports: [],
  templateUrl: './overlayemailsend.component.html',
  styleUrl: './overlayemailsend.component.scss',
})
export class OverlayemailsendComponent {
  @Input() onIptChangeShowOverlay: boolean = true;
  showOverlay: boolean = false;

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['onIptChangeShowOverlay'].isFirstChange()) {
      this.showOverlay = true;
      setTimeout(() => (this.showOverlay = false), 4000);
    }
  }
}
