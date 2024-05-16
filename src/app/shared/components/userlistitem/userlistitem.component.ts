import { Component, Input, inject } from '@angular/core';
import { Subscription } from 'rxjs';

// import services
import { UserService } from '../../../services/user.service';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';

// import classes
import { User } from '../../models/user.class';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';

@Component({
  selector: 'app-userlistitem',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './userlistitem.component.html',
  styleUrl: './userlistitem.component.scss',
})
export class UserlistitemComponent {
  userService = inject(UserService);
  channelService = inject(ChannelService)
  overlayCtrlService = inject(OverlaycontrolService);

  @Input({ required: true }) user!: User;
  @Input() checked: boolean = true;

  unsubActiveUser: Subscription;
  activeUser!: User;

  constructor() {
    this.unsubActiveUser = this.userService.activeUser$.subscribe(
      (user) => (this.activeUser = user)
    );
  }

  isChecked() {
    if (this.checked) {
      return (
        this.user.id == this.overlayCtrlService.selectedUser?.id &&
        this.overlayCtrlService.messageComponentType == 'directMessage' 
      );
    } else {
      return false;
    }
  }

  showMiddle() {
    this.overlayCtrlService.showingMiddle.set(false)
    this.overlayCtrlService.showingLeft.set(true)
    this.overlayCtrlService.showingSearch.set(true)
  }


}
