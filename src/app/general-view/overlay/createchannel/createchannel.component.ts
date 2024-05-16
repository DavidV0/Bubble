import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

// import customer component
import { UserlistitemComponent } from '../../../shared/components/userlistitem/userlistitem.component';
import { UserSelectComponent } from '../../../shared/components/user-select/user-select.component';

// import classes
import { Channel } from '../../../shared/models/channel.class';
import { User } from '../../../shared/models/user.class';

// import services
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-createchannel',
  standalone: true,
  imports: [FormsModule, UserlistitemComponent, UserSelectComponent],
  templateUrl: './createchannel.component.html',
  styleUrl: './createchannel.component.scss',
})
export class CreatechannelComponent {
  channel: Channel = new Channel();

  formState: 'channelName' | 'addMember' = 'channelName';
  memberSelection: 'all' | 'select' = 'all';
  unsubUsersList!: Subscription;
  overlayCtrlService = inject(OverlaycontrolService);
  channelService = inject(ChannelService);
  userService = inject(UserService);

  users!: User[];

  constructor() {
    this.unsubUsersList = this.userService.usersList$.subscribe((data) => {
      this.users = data;
    });
  }

  onSubmitName(form: NgForm) {
    if (form.valid) {
      this.formState = 'addMember';
    }
  }

  ngOnDestroy(): void {
    this.unsubUsersList.unsubscribe();
  }

  async onSubmitCreateChannel(form: NgForm) {
    if (form.valid) {
      if (this.memberSelection == 'all') this.addAllUsers2Channel();
      this.addCreator2Channel();
      let id = await this.channelService.createChannel(this.channel);
      if (typeof id === 'string') this.addChannelId2Users(id);
      this.overlayCtrlService.hideOverlay();
    }
  }

  addMembers2Channel(members: User[]) {
    this.channel.members = [];
    members.forEach((member) => {
      this.channel.members.push(member);
    });
  }

  addCreator2Channel() {
    let activeUser = this.userService.activeUser$.value;
    if (!this.channel.members.find((user) => user.id == activeUser.id)) {
      this.channel.members.push(activeUser);
    }
    this.channel.creator = activeUser;
  }

  addAllUsers2Channel() {
    this.channel.members = [];
    this.users.forEach((user) => this.channel.members.push(user));
  }

  addChannelId2Users(channelId: string) {
    this.channel.members.forEach((user) => {
      user.channelIDs.push(channelId);
      this.userService.saveUser(user);
    });
  }

  channelNameExists() {
    return this.channelService
      .getChannelsNameList()
      .includes(this.channel.name);
  }
}
