import { Injectable, inject, signal } from '@angular/core';

// import interfaces
import { MessageComponent, OverlayType } from '../shared/interfaces/interfaces';

// import services
import { DirectMessageService } from './direct-message.service';
import { ChannelService } from './channel.service';
import { UserService } from './user.service';

// import classes
import { User } from '../shared/models/user.class';
import { Message } from '../shared/models/message.class';
import { Channel } from '../shared/models/channel.class';
import { MessageService } from './message.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ThreadsService } from './ThreadsService';

@Injectable({
  providedIn: 'root',
})
export class OverlaycontrolService {
  overlayType: OverlayType = 'hide';
  threadService = inject(ThreadsService);

  messageComponentType: MessageComponent = 'channel';

  directMessageService = inject(DirectMessageService);
  channelService = inject(ChannelService);
  userService = inject(UserService);
  messageService = inject(MessageService);

  selectedUser: User | undefined;
  activeMessage: Message = new Message();
  activeChannel: Channel = new Channel();
  showingLeft = signal(false)
  showingRight = signal(true)
  showingMiddle = signal(true)
  showingSearch = signal(false)
  showingDirectMsg = signal(false)
  showingHeader = signal(false)

  private showHideLeftSide = new BehaviorSubject<boolean>(false);
  showHideLeftSide$ = this.showHideLeftSide.asObservable();

  unsubUsersList: Subscription;
  usersList!: User[];
  showHideRightSide = this.threadService.isShowingSig;

  showLeftSideMenu() {
    this.showHideLeftSide.next(!this.showHideLeftSide.value);
  }

  constructor() {
    this.unsubUsersList = this.userService.usersList$.subscribe((data) => {
      this.usersList = data;
    });
  }

  hideOverlay() {
    this.overlayType = 'hide';
  }

  showOverlay(ovlyName: OverlayType, event?: Event) {
    if (event) event.stopPropagation();
    this.overlayType = ovlyName;
  }

  showMessageComponent(componentType: MessageComponent, id?: string) {
    this.messageComponentType = componentType;
    if (this.threadService.currentChannel != id) {
      this.threadService.isShowingSig.set(false);
    }
    if (id) this.subscripeMessageComponentContent(componentType, id);
  }

  ngOnDestroy() {
    this.unsubUsersList.unsubscribe();
  }

  subscripeMessageComponentContent(
    componentType: MessageComponent,
    id: string
  ) {
    if (componentType == 'directMessage') {
      this.directMessageService.subDirectMessage(id);
    } else {
      this.channelService.subChannel(id);
    }
  }

  selectUser(user: User) {
    this.usersList.forEach((userListElement) => {
      if (userListElement.id == user.id) this.selectedUser = userListElement;
    });
  }

  openThread(channel: Channel, message: Message) {
    this.activeMessage = message;
    this.activeChannel = channel;
  }

  getChannel(): Channel {
    return this.activeChannel;
  }

  getMessage(): Message {
    return this.activeMessage;
  }
}
