import { Injectable, OnInit, inject } from '@angular/core';
import { FirebaseInitService } from './firebase-init.service';
import { BehaviorSubject } from 'rxjs';
import { doc, collection, onSnapshot, addDoc } from '@angular/fire/firestore';
import { deleteDoc, updateDoc } from 'firebase/firestore';
import { UserService } from './user.service';
import { Message } from '../shared/models/message.class';
import { Unsubscribe } from 'firebase/auth';
import { Reaction } from '../shared/models/reaction.class';
import { User } from '../shared/models/user.class';

@Injectable({
  providedIn: 'root',
})
export class MessageService implements OnInit {
  firebaseInitService = inject(FirebaseInitService);

  userService = inject(UserService);

  messages$: BehaviorSubject<Message[]> = new BehaviorSubject<Message[]>([]);
  unsubMessages!: Unsubscribe;

  constructor() {}

  ngOnDestroy() {
    this.unsubMessages();
  }

  ngOnInit(): void {}

  async addMessageToCollection(
    colId: 'directMessages' | 'Channels' | undefined,
    docId: string,
    message: Message
  ) {
    let newId;
    if (colId) {
      await addDoc(
        this.getMessageRef(colId, docId),
        message.getCleanBEJSON(docId)
      )
        .then((docRef) => {
          newId = docRef?.id;
        })
        .catch((err) => {
          console.error('Error adding message: ', err);
        });
    }
    return newId;
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

  getSingleMessageRef(colId: string, docId: string, msgId: string) {
    return doc(this.getMessageRef(colId, docId), msgId);
  }

  async updateMessage(
    colId: string,
    docId: string,
    msgId: string,
    msg: Message
  ) {
    await updateDoc(
      this.getSingleMessageRef(colId, docId, msgId),
      msg.getCleanBEJSON()
    ).catch((error) => {
      console.log(
        'Es ist ein Fehler aufgetreten bei updaten der Nachricht:',
        error
      );
    });
  }

  async deleteMessage(colId: string, docId: string, msgId: string) {
    await deleteDoc(this.getSingleMessageRef(colId, docId, msgId)).catch(
      (error) => {
        console.log(
          'Es ist ein Fehler aufgetreten bei löschen der Nachricht:',
          error
        );
      }
    );
  }

  subMessages(colId: string, docId: string) {
    if (this.unsubMessages) this.unsubMessages();
    this.unsubMessages = onSnapshot(
      this.getMessageRef(colId, docId),
      (msgList) => {
        let messages: Message[] = [];
        msgList.forEach((msg) => {
          const MESSAGE = new Message(
            this.getCleanMessageObj(msg.data()),
            msg.id
          );
          MESSAGE.messageOfChannel = docId;
          messages.push(MESSAGE);

          // get thread amount and time and save to message object
        });
        messages = this.sortMessagesChronologically(messages);

        this.messages$.next(messages);
      }
    );
  }

  sortMessagesChronologically(massageArray: Message[]) {
    return massageArray.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  getCleanMessageObj(obj: any) {
    return {
      creator: this.userService.getUser(obj.creatorId),
      date: obj.date,
      content: obj.content,
      answers: this.getCleanAnswersObj(obj.answers),
      reactions: this.getCleanReactionArray(obj.reaction),
      files: obj.files,
      messageOfChannelID: obj.messageOfChannel,
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
