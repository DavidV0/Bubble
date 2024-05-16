import { Component, Input, OnInit, Output, inject } from '@angular/core';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel.service';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

// import classes
import { Channel } from '../../../shared/models/channel.class';
import { User } from '../../../shared/models/user.class';
import { Message } from '../../../shared/models/message.class';
import { MessageContainerComponent } from '../../../shared/components/message-container/message-container.component';
import { TextareaContainerComponent } from '../../../shared/components/textarea-container/textarea-container.component';
import { Datestamp } from '../../../shared/models/datestamp.class';

@Component({
  selector: 'app-channel-message',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MessageContainerComponent,
    TextareaContainerComponent,
    FormsModule,
  ],
  templateUrl: './channel-message.component.html',
  styleUrl: './channel-message.component.scss',
})
export class ChannelMessageComponent implements OnInit {
  overlayCtrlService = inject(OverlaycontrolService);
  channelService = inject(ChannelService);
  userService = inject(UserService);
  messageService = inject(MessageService);

  user!: User;

  numberofThreads: [{}] = [{}];
  activeUser: User = new User();
  unsubscribeActiveUser;
  today: Date = new Date()

  

  @Input() channel: Channel = {} as Channel;
  unsubChannels: Subscription;
  channels: Channel[] = [];

  messages: Message[] = [];
  unsubMessages: Subscription;
  unsubNumberOfThreads: Subscription;

  constructor() {
    this.unsubChannels = this.channelService.channels$.subscribe(
      (channelList) => (this.channels = channelList)
    );
    this.unsubNumberOfThreads = this.channelService.numberOfThreads$.subscribe(
      (array) => {
        this.numberofThreads = array;
      }
    );

    this.unsubscribeActiveUser = this.userService.activeUser$.subscribe(
      (user) => {
        this.activeUser = user;
      }
    );

    this.unsubMessages = this.messageService.messages$.subscribe((messages) => {
      this.messages = messages;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.unsubMessages.unsubscribe();
    this.unsubscribeActiveUser.unsubscribe();
    this.unsubNumberOfThreads.unsubscribe();
  }

  getTimestamp(msg: Message) {
    return new Datestamp(msg.date)
  }

  proofForSameDay(msg: Message) {
      return msg.date.getDate() == new Date().getDate() ? true : false
  }
}
