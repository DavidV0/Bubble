import { Injectable, inject, signal } from '@angular/core';
import { FirebaseInitService } from './firebase-init.service';
import { UserService } from './user.service';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { ChannelService } from './channel.service';
import { MessageService } from './message.service';
import { Message } from '../shared/models/message.class';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../shared/models/user.class';
import { Reaction } from '../shared/models/reaction.class';

@Injectable({
  providedIn: 'root',
})
export class ThreadsService {
  channelService = inject(ChannelService);
  messagesService = inject(MessageService);

  currentChannel: string = '';
  activeUser!: User;
  idOfThisThreads!: string;
  unsubUser!: Subscription;
  unsubMessage!: Subscription;
  isShowingSig = signal(false);
  messages: Message[] = [];
  threadMessages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>(
    []
  );
  threadAmount: [{}] = [{}];
  activeChannel: string = '';

  constructor(
    private firebaseInitService: FirebaseInitService,
    private userService: UserService
  ) {
    this.unsubUser = this.userService.activeUser$.subscribe((user) => {
      this.activeUser = user;
    });
  }

  async getThread(messageId: string) {
    this.currentChannel = messageId;
    let firstMessage: Message = new Message();
    this.idOfThisThreads = messageId;
    this.unsubMessage = this.messagesService.messages$.subscribe((messages) => {
      firstMessage = messages.filter((message) => message.id == messageId)[0];
    });
    await onSnapshot(
      collection(this.getThreadColRef(messageId), 'threads'),
      (messages) => {
        this.messages = [];
        this.messages.push(firstMessage);
        messages.forEach(async (message) => {
          let msg = new Message(
            this.getCleanMessageObj(message.data()),
            message.id
          );
          this.messages.push(msg);
        });
        this.messages = this.messagesService.sortMessagesChronologically(
          this.messages
        );
        this.threadMessages$.next(this.messages);
      }
    );
  }

  getChannelColRef() {
    return collection(this.firebaseInitService.getDatabase(), 'Channels');
  }

  getChannelDocRef() {
    return doc(
      this.getChannelColRef(),
      this.channelService.activeChannel$.value.id
    );
  }

  getChannelMessagesColRef() {
    return collection(this.getChannelDocRef(), 'messages');
  }

  getThreadColRef(messageID: string) {
    return doc(this.getChannelMessagesColRef(), messageID);
  }

  getThreadMsgRef(messageID: string, threadMsgID: string) {
    return doc(
      collection(this.getThreadColRef(messageID), 'threads'),
      threadMsgID
    );
  }

  async updateThreadMessage(threadMsgID: string, message: Message) {
    await updateDoc(
      this.getThreadMsgRef(this.idOfThisThreads, threadMsgID),
      message.getCleanBEJSON()
    );
  }

  async deleteThreadMessage(threadMsgID: string) {
    if (this.messages[0].answers.amount > 0) this.messages[0].answers.amount--;
    if (threadMsgID == this.messages.slice(-1)[0].id) {
      this.messages[0].answers.lastAnswer =
        this.messages[this.messages.length - 2].answers.lastAnswer;
    }
    this.messagesService.updateMessage(
      'Channels',
      this.activeChannel,
      this.idOfThisThreads,
      this.messages[0]
    );
    await deleteDoc(this.getThreadMsgRef(this.idOfThisThreads, threadMsgID));
  }

  async saveThread(message: Message) {
    let newId;
    await addDoc(
      collection(this.getThreadColRef(this.idOfThisThreads), 'threads'),
      message.getCleanBEJSON()
    ).then((msgId) => (newId = msgId.id));
    this.messages[0].answers.amount++;
    this.messages[0].answers.lastAnswer = new Date();
    this.messagesService.updateMessage(
      'Channels',
      this.activeChannel,
      this.idOfThisThreads,
      this.messages[0]
    );

    return newId;
  }

  ngOnDestroy(): void {
    this.unsubUser.unsubscribe();
    this.unsubMessage.unsubscribe();
  }

  getCleanMessageObj(obj: any) {
    return {
      creator: this.userService.getUser(obj.creatorId),
      date: obj.date,
      content: obj.content,
      answers: this.getCleanAnswersObj(obj.answers),
      reactions: this.getCleanReactionArray(obj.reaction),
      files: obj.files,
      messageOfChannel: obj.messageOfChannel,
    };
  }

  getCleanAnswersObj(obj: any) {
    return { amount: obj.amount, lastAnswer: new Date(obj.lastAnswer) };
  }

  getCleanReactionArray(obj: any) {
    let reactions: Reaction[] = [];
    obj.forEach((reactionBEObject: any) => {
      let users: User[] = this.userService.getFilterdUserList(
        reactionBEObject.users
      );
      reactions.push(new Reaction({ emoji: reactionBEObject['emoji'], users }));
    });
    return reactions;
  }
}
