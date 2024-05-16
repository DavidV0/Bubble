import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dev-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dev-header.component.html',
  styleUrl: './dev-header.component.scss'
})
export class DevHeaderComponent implements OnInit {
  overlayCtrlService = inject(OverlaycontrolService)
  userService = inject(UserService)

  activeUser!: User;
  unsubActiveUser: Subscription;


  constructor(){
    this.unsubActiveUser = this.userService.activeUser$.subscribe((userData) => {
      this.activeUser = userData;
    });
  }

  ngOnInit(): void {
    
  }

  ngOnDestroy(){
    this.unsubActiveUser.unsubscribe();
  }

  goBack() {
    if (this.overlayCtrlService.showingRight() == false) {
      this.overlayCtrlService.showingMiddle.set(false)
      this.overlayCtrlService.showingRight.set(true)
      this.overlayCtrlService.showingHeader.set(false)
    } else {
      this.overlayCtrlService.showingLeft.set(false)
      this.overlayCtrlService.showingMiddle.set(true)
      this.overlayCtrlService.showingRight.set(true)
      if (this.overlayCtrlService.showingSearch() == true) {
        this.overlayCtrlService.showingSearch.set(false)
      }
      if (this.overlayCtrlService.showingHeader() == true) {
        this.overlayCtrlService.showingHeader.set(false)
      }
    }
  }
}
