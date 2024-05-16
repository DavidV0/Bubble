import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-overlayaccountcreated',
  standalone: true,
  imports: [],
  templateUrl: './overlayaccountcreated.component.html',
  styleUrl: './overlayaccountcreated.component.scss'
})
export class OverlayaccountcreatedComponent {
  @Input() onIptChangeShowOverlay:boolean = true;
  showOverlay:boolean = false;

  ngOnChanges(changes:SimpleChanges){
    if ( !changes['onIptChangeShowOverlay'].isFirstChange() ) {
      this.showOverlay = true;
      setTimeout(() => this.showOverlay = false, 4000)
    }
  }
}
