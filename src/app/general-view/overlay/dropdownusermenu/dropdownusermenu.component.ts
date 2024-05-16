import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// import services
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../shared/models/user.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dropdownusermenu',
  standalone: true,
  imports: [],
  templateUrl: './dropdownusermenu.component.html',
  styleUrl: './dropdownusermenu.component.scss',
})
export class DropdownusermenuComponent {
  overlayCtrlService = inject(OverlaycontrolService);
  userService = inject(UserService);
  user!: User;
  unsubscribeUser: Subscription;

  constructor() {
    this.unsubscribeUser = this.userService.activeUser$.subscribe(
      (userData) => {
        this.user = userData;
      }
    );
  }

  async logOut() {
    localStorage.removeItem('user');
    await this.userService.userLogOut();
    this.overlayCtrlService.hideOverlay();
  }

  ngOnDestroy() {
    this.unsubscribeUser.unsubscribe();
  }
}
