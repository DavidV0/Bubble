import { Injectable, inject, signal } from '@angular/core';
import { FirebaseInitService } from './firebase-init.service';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { UserService } from './user.service';
import { ThreadsService } from './ThreadsService';
import { MessageService } from './message.service';
import { ChannelService } from './channel.service';
import { Subscription } from 'rxjs';
import { User } from '../shared/models/user.class';
import { Channel } from '../shared/models/channel.class';
import { Message } from '../shared/models/message.class';
import { OverlaycontrolService } from './overlaycontrol.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  firebaseInitService = inject(FirebaseInitService);
  userService = inject(UserService);
  threadsService = inject(ThreadsService);
  messageService = inject(MessageService);
  channelService = inject(ChannelService);
  overlayCtrService = inject(OverlaycontrolService);

  searchUserResult: User[] = [];
  searchChannelsResult: Channel[] = [];
  searchMessageResult: Message[] = [];
  searchThreadResult: Message[] = [];
  listOfAllUsers: User[] = [];
  listOfAllChannels: Channel[] = [];
  listOfAllMessages: Message[] = [];
  listOfAllThreads: Message[] = [];

  unsubUsers: Subscription;
  unsubChannel: Subscription;
  unsubMessages!: Subscription;

  constructor() {
    this.unsubUsers = this.userService.usersList$.subscribe((list) => {
      this.listOfAllUsers = list;
    });
    this.unsubChannel = this.channelService.channels$.subscribe((list) => {
      this.listOfAllChannels = list;
    });
  }

  ngOnDestroy(): void {
    this.unsubUsers.unsubscribe();
    this.unsubChannel.unsubscribe();
    this.unsubMessages.unsubscribe();
  }

  searchUsers(input: string) {
    this.searchUserResult = [];
    this.listOfAllUsers.forEach((user) => {
      let nameToCompareWith = user.name.toLowerCase();
      if (input.startsWith('@')) {
        if (nameToCompareWith.startsWith(input.slice(1).toLowerCase())) {
          this.searchUserResult.push(user);
        }
      } else if (nameToCompareWith.includes(input.toLowerCase())) {
        this.searchUserResult.push(user);
      }
    });
  }

  searchChannels(input: string) {
    this.searchChannelsResult = [];
    this.listOfAllChannels.forEach((channel) => {
      let channelToCompareWith = channel.name.toLowerCase();
      if (input.startsWith('#')) {
        if (channelToCompareWith.includes(input.slice(1).toLowerCase()))
          this.searchChannelsResult.push(channel);
      } else if (channelToCompareWith.includes(input.toLowerCase())) {
        this.searchChannelsResult.push(channel);
      }
    });
  }

  async loadAllMessages() {
    this.listOfAllMessages = [];

    for (let i = 0; i < this.listOfAllChannels.length; i++) {
      let messages: Message[] = [];
      let channelId = this.listOfAllChannels[i].id;
      let querySnapshotMessages = await getDocs(
        this.getMessageRef('Channels', channelId)
      );
      querySnapshotMessages.forEach((msg) => {
        const MESSAGE = new Message(
          this.messageService.getCleanMessageObj(msg.data()),
          msg.id
        );
        MESSAGE.messageOfChannel = channelId;
        messages.push(MESSAGE);
      });
      this.listOfAllMessages = [...this.listOfAllMessages, ...messages];
    }
  }

  async searchMessages(input: string) {
    await this.loadAllMessages();
    this.searchMessageResult = [];
    this.listOfAllMessages.forEach((message) => {
      let messageToCompareWith = message.content.toLowerCase();
      if (messageToCompareWith.includes(input.toLowerCase())) {
        this.searchMessageResult.push(message);
      }
    });
  }

  async loadAllThreads() {
    this.listOfAllThreads = [];

    for (let i = 0; i < this.listOfAllMessages.length; i++) {
      let threads: Message[] = [];
      let messageId = this.listOfAllMessages[i].id;
      let channelId = this.listOfAllMessages[i].messageOfChannel;
      let querySnapshotThread = await getDocs(
        collection(this.getThreadColRef(messageId, channelId), 'threads')
      );

      querySnapshotThread.forEach((threadMsg) => {
        let msg = new Message(
          this.threadsService.getCleanMessageObj(threadMsg.data()),
          threadMsg.id,
          messageId
        );
        threads.push(msg);
      });
      this.listOfAllThreads = [...this.listOfAllThreads, ...threads];
    }
  }

  async searchThreads(input: string) {
    await this.loadAllThreads();
    this.searchThreadResult = [];
    this.listOfAllThreads.forEach((thread) => {
      let threadToCompareWith = thread.content.toLowerCase();
      if (threadToCompareWith.includes(input.toLowerCase())) {
        this.searchThreadResult.push(thread);
        this.addMsg2SearchMsgResult(thread.messageOfChannel);
      }
    });
  }

  addMsg2SearchMsgResult(msgId: string) {
    if (!this.searchMessageResult.some((msg) => msg.id == msgId)) {
      this.searchMessageResult.push(
        this.listOfAllMessages.filter((msg) => msg.id == msgId)[0]
      );
    }
  }

  showChannelName(message: Message): string | undefined {
    const channelId = message.messageOfChannel;
    const foundChannel = this.listOfAllChannels.find(
      (channel) => channel.id === channelId
    );
    return foundChannel ? foundChannel.name : undefined;
  }

  getChannelColRef() {
    return collection(this.firebaseInitService.getDatabase(), 'Channels');
  }

  getChannelDocRef(messageId: string) {
    return doc(this.getChannelColRef(), messageId);
  }

  getChannelMessagesColRef(messageId: string) {
    return collection(this.getChannelDocRef(messageId), 'messages');
  }

  getThreadColRef(messageID: string, channelId: string) {
    return doc(this.getChannelMessagesColRef(channelId), messageID);
  }

  noResultFound() {
    if (
      this.searchChannelsResult.length === 0 &&
      this.searchUserResult.length === 0 &&
      this.searchMessageResult.length === 0
    ) {
      return true;
    } else {
      return false;
    }
  }
  getMessageRef(colId: string, docId: string) {
    return collection(this.getSingleDocRef(colId, docId), 'messages');
  }

  getCollectionRef(colId: string) {
    return collection(this.firebaseInitService.getDatabase(), colId);
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(this.getCollectionRef(colId), docId);
  }

  async searchForChannel(message: Message) {
    let channelId = message.messageOfChannel;
    this.overlayCtrService.showMessageComponent('channel', channelId);
    await this.threadsService.getThread(message.id);
    this.threadsService.isShowingSig.set(true);
    this.overlayCtrService.showingMiddle.set(true);
    this.overlayCtrService.showingRight.set(false);
    this.overlayCtrService.showingHeader.set(true);
  }
}
