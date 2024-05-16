import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// import services
import { DirectMessageService } from '../../../services/direct-message.service';
import { UserService } from '../../../services/user.service';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { MessageService } from '../../../services/message.service';
import { ChannelService } from '../../../services/channel.service';

// import classes
import { DirektMessage } from '../../../shared/models/direct-message.class';
import { User } from '../../../shared/models/user.class';
import { Channel } from '../../../shared/models/channel.class';
import { Message } from '../../../shared/models/message.class';
import { TextareaContainerComponent } from '../../../shared/components/textarea-container/textarea-container.component';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [CommonModule, FormsModule, TextareaContainerComponent],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent {
  directMessageService = inject(DirectMessageService);
  userService = inject(UserService);
  overlayCtrlService = inject(OverlaycontrolService);
  messageService = inject(MessageService);
  channelService = inject(ChannelService);

  unsubUsersList: Subscription;
  sendTo!: Channel | User | undefined;
  searchPrompt: string = '';
  users!: User[]; //
  filteredUsers: User[] = [];
  unsubChannels: Subscription;

  channels: Channel[] = [];
  filteredChannels: Channel[] = [];

  constructor() {
    this.unsubUsersList = this.userService.usersList$.subscribe((data) => {
      this.users = data;
    });

    this.unsubChannels = this.channelService.channels$.subscribe(
      (channels) => (this.channels = channels)
    );
  }

  filterUsersAndChannels() {
    this.sendTo = undefined;
    this.filteredUsers = [];
    this.filteredChannels = [];
    let firstCharacter = this.searchPrompt[0];
    if (firstCharacter) {
      let prompt = this.searchPrompt.substring(1).toLowerCase();
      switch (firstCharacter) {
        case '@':
          this.filteredUsers = this.filterUsers(prompt);
          break;
        case '#':
          this.filteredChannels = this.filterChannels(prompt);
          break;
        default:
          this.filteredUsers = this.filterUsers(prompt);
          this.filteredChannels = this.filterChannels(prompt);
          break;
      }
    }
  }

  filterChannels(prompt: string): Channel[] {
    return this.channels.filter((channel) =>
      channel.name.toLowerCase().includes(prompt)
    );
  }

  filterUsers(prompt: string): User[] {
    return this.users.filter((user) =>
      user.name.toLowerCase().includes(prompt)
    );
  }

  setSendTo(item: 'channel' | 'user', idx: number) {
    if (item == 'user') {
      this.sendTo = this.filteredUsers[idx];
      this.searchPrompt = '@' + this.filteredUsers[idx].name;
    } else {
      this.sendTo = this.filteredChannels[idx];
      this.searchPrompt = '# ' + this.filteredChannels[idx].name;
    }
  }

  ngOnDestroy() {
    this.unsubChannels.unsubscribe();
    this.unsubUsersList.unsubscribe();
  }
}
