import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

// import classes
import { User } from '../../../shared/models/user.class';
import { Message } from '../../../shared/models/message.class';

// import services
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { Subscription } from 'rxjs';
import { DirectMessageService } from '../../../services/direct-message.service';
import { DirektMessage } from '../../../shared/models/direct-message.class';
import { MessageContainerComponent } from '../../../shared/components/message-container/message-container.component';
import { TextareaContainerComponent } from '../../../shared/components/textarea-container/textarea-container.component';
import { UserlistitemComponent } from '../../../shared/components/userlistitem/userlistitem.component';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';

@Component({
  selector: 'app-direct-message',
  standalone: true,
  imports: [
    FormsModule,
    MessageContainerComponent,
    TextareaContainerComponent,
    UserlistitemComponent,
  ],
  templateUrl: './direct-message.component.html',
  styleUrl: './direct-message.component.scss',
})
export class DirectMessageComponent {
  activeUser: User = new User();
  unsubscripeActiveUser;

  secondUser: User = new User();

  userService = inject(UserService);
  messageService = inject(MessageService);
  directMessagesService = inject(DirectMessageService);
  overlayControlService = inject(OverlaycontrolService);

  directMessage!: DirektMessage;
  unsubDirectMessage: Subscription;

  messages: Message[] = [];
  unsubMessages: Subscription;

  newMessage: Message = new Message();

  constructor() {
    this.unsubscripeActiveUser = this.userService.activeUser$.subscribe(
      (user) => {
        this.activeUser = user;
      }
    );
    this.unsubDirectMessage =
      this.directMessagesService.activeDirectMessage$.subscribe(
        (directMessage) => {
          if (directMessage.users) {
            this.directMessage = directMessage;
            this.secondUser =
              directMessage.users.find(
                (user) => user.id != this.activeUser.id
              ) || this.activeUser;
          }
        }
      );

    this.unsubMessages = this.messageService.messages$.subscribe((messages) => {
      this.messages = messages;
    });
  }

  sendNewMessage() {
    this.newMessage.creator = this.activeUser;
    this.newMessage.date = new Date();
    this.messageService.addMessageToCollection(
      'directMessages',
      this.directMessage.id,
      this.newMessage
    );
    this.newMessage = new Message();
  }

  ngOnDestroy() {
    this.unsubDirectMessage.unsubscribe();
    this.unsubscripeActiveUser.unsubscribe();
  }
}
