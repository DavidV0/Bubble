import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

// import services
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';

// import Classes
import { Channel } from '../../../shared/models/channel.class';
import { User } from '../../../shared/models/user.class';
import { Message } from '../../../shared/models/message.class';

@Component({
  selector: 'app-editchannel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './editchannel.component.html',
  styleUrl: './editchannel.component.scss',
})
export class EditchannelComponent {
  overlayCtrlService = inject(OverlaycontrolService);
  channelService = inject(ChannelService);
  userService = inject(UserService);
  messageService = inject(MessageService);

  channel!: Channel;

  newName: string;
  editName: boolean = false;
  editDetails: boolean = false;

  activeUser!: User;
  unsubActiveUser: Subscription;

  @ViewChild('textarea') private textarea!: ElementRef<HTMLElement>;

  constructor() {
    this.channel = this.channelService.activeChannel$.value;
    this.newName = this.channel.name;

    this.unsubActiveUser = this.userService.activeUser$.subscribe(
      (activeUser) => (this.activeUser = activeUser)
    );
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTextarea();
    }, 10);
  }

  resizeTextarea() {
    this.textarea.nativeElement.style.height = '1px';
    this.textarea.nativeElement.style.height =
      this.textarea.nativeElement.scrollHeight + 'px';
  }

  async updateChannelName() {
    this.channel.name = this.newName;
    await this.updateChannelOnServer();
  }

  async updateChannelDescription() {
    await this.updateChannelOnServer();
  }

  async leaveChannel() {
    await this.removeUserFromChannel();
    await this.removeChannelFromUser();
    this.overlayCtrlService.hideOverlay();
  }

  async removeUserFromChannel() {
    this.channel.members = this.channel.members.filter(
      (member) => this.activeUser.id != member.id
    );
    if (this.channel.members.length == 0) {
      await this.channelService.deleteChannel(this.channel.id);
    } else {
      await this.updateChannelOnServer();
      this.addLeaveMessageToChannel();
    }
  }

  addLeaveMessageToChannel() {
    let leaveMessage = new Message();
    leaveMessage.content = this.activeUser.name + ' hat den Channel verlassen.';
    leaveMessage.creator = this.activeUser;
    this.messageService.addMessageToCollection(
      'Channels',
      this.channel.id,
      leaveMessage
    );
  }

  async removeChannelFromUser() {
    this.activeUser.channelIDs = this.activeUser.channelIDs.filter(
      (channelId) => this.channel.id != channelId
    );
    await this.userService.saveUser(this.activeUser);
  }

  async updateChannelOnServer() {
    await this.channelService.updateChannel(this.channel);
  }
}
