import { Component, inject } from '@angular/core';
import { Subscription } from 'rxjs';

// import services
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';

// import classes
import { Channel } from '../../../shared/models/channel.class';
import { User } from '../../../shared/models/user.class';

// import costum components
import { UserlistitemComponent } from '../../../shared/components/userlistitem/userlistitem.component';
import { UserSelectComponent } from '../../../shared/components/user-select/user-select.component';

@Component({
  selector: 'app-add-members',
  standalone: true,
  imports: [UserlistitemComponent, UserSelectComponent],
  templateUrl: './add-members.component.html',
  styleUrl: './add-members.component.scss',
})
export class AddMembersComponent {
  overlayCtrlService = inject(OverlaycontrolService);
  channelService = inject(ChannelService);
  userService = inject(UserService);

  channel!: Channel;
  unsubActiveChanenl: Subscription;

  newUsers: User[] = [];

  constructor() {
    this.unsubActiveChanenl = this.channelService.activeChannel$.subscribe(
      (activeChannel) => {
        this.channel = activeChannel;
      }
    );
  }

  setNewUsers(newUsers: User[]) {
    this.newUsers = [];
    newUsers.forEach((user) => {
      this.newUsers.push(user);
    });
  }

  joinChannel() {
    this.newUsers.forEach((user) => {
      if (!this.channel.members.find((member) => member.id == user.id)) {
        this.addUser2Channel(user);
        this.addChannel2User(user);
      }
    });
    this.overlayCtrlService.hideOverlay();
  }

  addUser2Channel(user: User) {
    this.channel.members.push(user);
    this.channelService.updateChannel(this.channel);
  }

  addChannel2User(user: User) {
    user.channelIDs.push(this.channel.id);
    this.userService.saveUser(user);
  }
}
