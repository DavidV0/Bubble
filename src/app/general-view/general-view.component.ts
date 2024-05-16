import { Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// import services
import { UserService } from '../services/user.service';
import { OverlaycontrolService } from '../services/overlaycontrol.service';
import { ChannelService } from '../services/channel.service';
import { RegisterService } from '../services/register.service';

// import customer components
import { OverlayComponent } from './overlay/overlay.component';
import { LeftSideComponent } from './left-side/left-side.component';
import { NewMessageComponent } from './messages/new-message/new-message.component';
import { DirectMessageComponent } from './messages/direct-message/direct-message.component';
import { ChannelMessageComponent } from './messages/channel-message/channel-message.component';
import { ThreadComponent } from './thread/thread.component';

// import classes
import { User } from '../shared/models/user.class';

// import types
import { Channel } from '../shared/models/channel.class';
import { Message } from '../shared/models/message.class';
import { MessageService } from '../services/message.service';
import { WorkspaceMenuComponent } from './overlay/workspace-menu/workspace-menu.component';
import { SearchService } from '../services/search.service';
import { DirectMessageService } from '../services/direct-message.service';
import { DirektMessage } from '../shared/models/direct-message.class';
import { ThreadsService } from '../services/ThreadsService';
import { DevHeaderComponent } from '../shared/components/dev-header/dev-header.component';

@Component({
  selector: 'app-general-view',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OverlayComponent,
    LeftSideComponent,
    NewMessageComponent,
    DirectMessageComponent,
    ChannelMessageComponent,
    ThreadComponent,
    WorkspaceMenuComponent,
    DevHeaderComponent
  ],
  templateUrl: './general-view.component.html',
  styleUrl: './general-view.component.scss',
})
export class GeneralViewComponent {
  activeUser!: User;
  searchInput!: string;

  activeChannelId: string = '';
  channels?: Channel[];
  activeChannel!: Channel;
  unsubChannel: Subscription;

  messages: Message[] = [];
  unsubMessages: Subscription;
  isSearchFieldEmptySig = signal(false);

  overlayCtrlService = inject(OverlaycontrolService);
  channelService = inject(ChannelService);
  messageService = inject(MessageService);
  registerService = inject(RegisterService);
  directMessageService = inject(DirectMessageService);
  threadService = inject(ThreadsService)


  isLeftShowing = this.overlayCtrlService.showingLeft
  isMiddleShowing = this.overlayCtrlService.showingMiddle
  isRightShowing = this.overlayCtrlService.showingRight
  isSearchShowing = this.overlayCtrlService.showingSearch
  isDirectMsgShowing = this.overlayCtrlService.showingDirectMsg
  isShwoginHeader = this.overlayCtrlService.showingHeader

  subscription: Subscription;

  constructor(
    private userService: UserService,
    public searchService: SearchService
  ) {
    this.subscription = this.userService.activeUser$.subscribe((userData) => {
      this.activeUser = userData;
    });

    this.channelService.subChannel(this.activeUser.channelIDs[0]);
    this.unsubChannel = this.channelService.activeChannel$.subscribe(
      (channel) => {
        if (channel) {
          this.activeChannel = channel;
        }
      }
    );

    this.unsubMessages = this.messageService.messages$.subscribe((messages) => {
      this.messages = messages;
    });
    this.searchService.loadAllMessages();
    this.searchService.loadAllThreads();
  }
  @HostListener('window:beforeunload', ['$event'])
  async beforeUnload(event: Event) {
    this.activeUser.status = 'Abwesend';
    this.userService.activeUser$.next(this.activeUser);
    await this.userService.saveUser(this.userService.activeUser$.value);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

 

  async onInputChange() {
    this.isSearchFieldEmpty();
    this.searchService.searchUsers(this.searchInput);
    this.searchService.searchChannels(this.searchInput);
    await this.searchService.searchMessages(this.searchInput);
    await this.searchService.searchThreads(this.searchInput);
  }

  onResultClick() {
    if (this.searchInput) {
      this.searchInput = '';
      this.isSearchFieldEmptySig.set(false);
    }
  }

  isSearchFieldEmpty() {
    this.searchInput.length > 0
      ? this.isSearchFieldEmptySig.set(true)
      : this.isSearchFieldEmptySig.set(false);
  }

  getUser(users: User[]): User {
    return users.length > 1
      ? users.find((user) => user.id != this.activeUser.id) || new User()
      : users[0];
  }

  async openDirectMessage(user: User) {
    this.overlayCtrlService.selectUser(user);
    let messageId = await this.directMessageService.checkForRightMessage(user);
    this.overlayCtrlService.showMessageComponent('directMessage', messageId);
  }

  async initSearch() {
    await this.searchService.loadAllMessages();
    setTimeout(() => {
      this.searchService.loadAllThreads();
    }, 1000);
  }

  
  showMiddle() {
    this.overlayCtrlService.showingMiddle.set(false)
    this.overlayCtrlService.showingLeft.set(true)
    this.overlayCtrlService.showingSearch.set(true)
  }

}
