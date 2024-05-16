import { Injectable, OnInit, inject } from '@angular/core';
import { FirebaseInitService } from './firebase-init.service';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Firestore,
  doc,
  collection,
  onSnapshot,
  addDoc,
  collectionData,
} from '@angular/fire/firestore';
import { DirektMessage } from '../shared/models/direct-message.class';
import { QuerySnapshot, deleteDoc, updateDoc } from 'firebase/firestore';
import { UserService } from './user.service';
import { User } from '../shared/models/user.class';
import { Message } from '../shared/models/message.class';
import { Unsubscribe } from 'firebase/auth';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class DirectMessageService implements OnInit {
  userService = inject(UserService);
  messageService = inject(MessageService);

  firestore: Firestore = inject(Firestore);

  unsubDirectMessagesList;
  directMessages$: BehaviorSubject<DirektMessage[]> = new BehaviorSubject<
    DirektMessage[]
  >([]);

  unsubActiveDirectMessage!: Unsubscribe;
  activeDirectMessage$: BehaviorSubject<DirektMessage> =
    new BehaviorSubject<DirektMessage>(new DirektMessage([], ''));

  constructor() {
    this.unsubDirectMessagesList = this.subDirectMessagesList();
  }

  ngOnInit(): void {}

  ngOnDestroy() {
    this.unsubDirectMessagesList();
  }

  getDirectMessagesRef() {
    return collection(this.firestore, 'directMessages');
  }
  getSingleDocRef(id: string) {
    return doc(this.getDirectMessagesRef(), id);
  }

  subDirectMessagesList() {
    return onSnapshot(this.getDirectMessagesRef(), (list) => {
      let directMessagesList: DirektMessage[] = [];
      list.forEach((directMsg) => {
        let messageData = directMsg.data();
        // if Abfrage in snapshot durch filter integrieren
        if (
          messageData['userIds'].includes(this.userService.activeUser$.value.id)
        ) {
          let cleanDirectMsgObj = this.setCleanDirectMsgObject(messageData);
          directMessagesList.push(
            new DirektMessage(cleanDirectMsgObj, directMsg.id)
          );
        }
      });
      this.directMessages$.next(directMessagesList);
    });
  }

  async createNewDirectMessage(directMessage: DirektMessage) {
    let newDirectMessageId;
    let newMsgId;
    try {
      const docRef = await addDoc(
        this.getDirectMessagesRef(),
        directMessage.toCleanBEJSON()
      );
      newDirectMessageId = docRef.id;
      if (directMessage.messages.length > 0)
        newMsgId = await this.messageService.addMessageToCollection(
          'directMessages',
          newDirectMessageId,
          directMessage.messages[0]
        );
    } catch (error) {
      console.error('Error adding direct message: ', error);
    }
    return [newDirectMessageId, newMsgId];
  }

  setCleanDirectMsgObject(obj: any) {
    return {
      users: this.userService.getFilterdUserList(obj.userIds),
    };
  }

  subDirectMessage(directMsgId: string) {
    if (this.unsubActiveDirectMessage) this.unsubActiveDirectMessage();
    this.unsubActiveDirectMessage = onSnapshot(
      this.getSingleDocRef(directMsgId),
      (directMessage) => {
        let data = directMessage.data();
        if (data) {
          let cleanDirectMsgObj = this.setCleanDirectMsgObject(data);
          let directMsg: DirektMessage = new DirektMessage(
            cleanDirectMsgObj,
            directMessage.id
          );
          this.activeDirectMessage$.next(directMsg);
        }
      }
    );
    this.messageService.subMessages('directMessages', directMsgId);
  }

  async checkForRightMessage(user: User): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      onSnapshot(this.getDirectMessagesRef(), (list) => {
        let rightMessageID: string = '';
        list.forEach((directMsg) => {
          let messageData = directMsg.data();
          if (
            messageData['userIds'].includes(
              this.userService.activeUser$.value.id
            ) &&
            messageData['userIds'].includes(user.id)
          ) {
            rightMessageID = directMsg.id;
          }
        });
        resolve(rightMessageID);
      });
    });
  }
}
