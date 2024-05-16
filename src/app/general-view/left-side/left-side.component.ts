import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Output,
  EventEmitter,
  OnInit,
  Input,
} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

// customer components
import { UserlistitemComponent } from '../../shared/components/userlistitem/userlistitem.component';

//services
import { MessageService } from '../../services/message.service';
import { OverlaycontrolService } from '../../services/overlaycontrol.service';
import { StorageService } from '../../services/storage.service';
import { ChannelService } from '../../services/channel.service';
import { UserService } from '../../services/user.service';
import { DirectMessageService } from '../../services/direct-message.service';

// import classes
import { User } from '../../shared/models/user.class';
import { Channel } from '../../shared/models/channel.class';
import { DirektMessage } from '../../shared/models/direct-message.class';
import { ThreadsService } from '../../services/ThreadsService';

// impoort types

@Component({
  selector: 'app-left-side',
  standalone: true,
  imports: [CommonModule, UserlistitemComponent],
  templateUrl: './left-side.component.html',
  styleUrl: './left-side.component.scss',
})
export class LeftSideComponent {
  dropdownCollapsed: { channels: boolean; directMessages: boolean } = {
    channels: false,
    directMessages: false,
  };

  overlayCtrlService = inject(OverlaycontrolService);
  messageService = inject(MessageService);
  channelService = inject(ChannelService);
  storageService = inject(StorageService);
  directMessageService = inject(DirectMessageService);

  activeUser!: User;
  unsubActiveUser: Subscription;

  channels: Channel[] = [];
  unsubChannels: Subscription;

  directMessages: DirektMessage[] = [];
  unsubDirectMessages: Subscription;
  threadService = inject(ThreadsService);

  constructor(private userService: UserService) {
    this.unsubActiveUser = this.userService.activeUser$.subscribe(
      (activeUser) => (this.activeUser = activeUser)
    );
    this.unsubChannels = this.channelService.channels$.subscribe(
      (channelList) => (this.channels = channelList)
    );

    this.unsubDirectMessages =
      this.directMessageService.directMessages$.subscribe(
        (directMessagesList) => {
          this.directMessages = directMessagesList;
        }
      );
  }

  isChecked(chanelId: string) {
    return chanelId == this.channelService.activeChannel$.value.id;
  }

  toggleDropdown(dropdownType: 'channels' | 'directMessages') {
    this.dropdownCollapsed[dropdownType] =
      !this.dropdownCollapsed[dropdownType];
  }

  getUser(users: User[]): User {
    return users.length > 1
      ? users.find((user) => user.id != this.activeUser.id) || new User()
      : users[0];
  }

  selectDirectMessage(directMsg: DirektMessage) {
    this.overlayCtrlService.selectUser(this.getUser(directMsg.users));
    this.overlayCtrlService.showMessageComponent('directMessage', directMsg.id);
  }

  ngOnDestroy() {
    this.unsubChannels.unsubscribe();
    this.unsubDirectMessages.unsubscribe();
    this.unsubActiveUser.unsubscribe();
  }

  showMiddleThroughChannelSelect() {
    this.overlayCtrlService.showingLeft.set(true)
    this.overlayCtrlService.showingMiddle.set(false)
    this.overlayCtrlService.messageComponentType = 'channel'
    this.overlayCtrlService.showingSearch.set(true)
  }


  showMiddle() {
    this.overlayCtrlService.showingLeft.set(true)
    this.overlayCtrlService.showingMiddle.set(false)
    this.overlayCtrlService.showingSearch.set(true)
  }
}
