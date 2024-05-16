import { Component, Input, inject, signal } from '@angular/core';
import { Message } from '../../shared/models/message.class';
import { CommonModule } from '@angular/common';
import { Channel } from '../../shared/models/channel.class';
import { MessageContainerComponent } from '../../shared/components/message-container/message-container.component';
import { ThreadsService } from '../../services/ThreadsService';
import { FirebaseInitService } from '../../services/firebase-init.service';

import { MessageService } from '../../services/message.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { TextareaContainerComponent } from '../../shared/components/textarea-container/textarea-container.component';
import { ChannelService } from '../../services/channel.service';
import { OverlaycontrolService } from '../../services/overlaycontrol.service';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [
    CommonModule,
    MessageContainerComponent,
    MessageContainerComponent,
    FormsModule,
    TextareaContainerComponent,
  ],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  threadService = inject(ThreadsService);
  firebaseInitService = inject(FirebaseInitService);
  messageService = inject(MessageService);
  userService = inject(UserService);
  channelService = inject(ChannelService)
  overlayCtrlService = inject(OverlaycontrolService)

  message: Message = new Message();
  @Input() channel: Channel = new Channel();
  messages: Message[] = [];
  unsubMessage!: Subscription;
  messageContent: string = '';

  constructor() {}

  ngOnDestroy(): void {
    this.unsubMessage.unsubscribe();
  }

  async getMessages() {
    this.unsubMessage = await this.threadService.threadMessages$.subscribe(
      (messages) => {
        this.messages = messages;
      }
    );
  }

  ngOnInit(): void {
    this.getMessages();
  }

  saveThreadMessage() {
    this.threadService.saveThread(this.getMessageObj());
    this.messageContent = '';
  }

  getMessageObj() {
    let message = new Message();
    message.creator = this.userService.activeUser$.value;
    message.content = this.messageContent;
    message.date = new Date();
    message.files = []; // add files if function is available
    message.reactions = [];
    return message;
  }

  goBack(){
    this.threadService.isShowingSig.set(false)
    this.overlayCtrlService.showingMiddle.set(false)
    this.overlayCtrlService.showingRight.set(true)
  }
}
