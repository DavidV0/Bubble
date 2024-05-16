import { Injectable, inject, signal } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

// import firebase
import { Firestore } from '@angular/fire/firestore';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { Unsubscribe } from 'firebase/auth';

// import classes
import { Channel } from '../shared/models/channel.class';
import { User } from '../shared/models/user.class';

// import services
import { UserService } from './user.service';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  firestore: Firestore = inject(Firestore);
  userService = inject(UserService);
  messageService = inject(MessageService);

  activeUser!: User;
  unsubActiveUser: Subscription;

  channels$: BehaviorSubject<Channel[]> = new BehaviorSubject<Channel[]>([]);
  unsubChannels;

  activeChannel$: BehaviorSubject<Channel> = new BehaviorSubject<Channel>(
    new Channel()
  );
  unsubChannel!: Unsubscribe;

  numberOfThreads$: BehaviorSubject<[{}]> = new BehaviorSubject<[{}]>([{}]);

  constructor() {
    this.unsubActiveUser = this.userService.activeUser$.subscribe(
      (activeUser) => {
        this.activeUser = activeUser;
      }
    );
    this.unsubChannels = this.subChannels();
  }

  subChannels() {
    return onSnapshot(this.getChannelsRef(), (channels) => {
      let channelList: Channel[] = [];
      channels.forEach((channel) => {
        let data = channel.data();
        // if Abfrage in snapshot durch filter integrieren
        if (data['userID'].includes(this.activeUser.id)) {
          let cleanObj = this.setCleanChannelObj(data);
          let newChannel = new Channel(cleanObj, channel.id);
          channelList.push(newChannel);
        }
      });
      this.channels$.next(channelList);
    });
  }

  async subChannel(channelID: string) {
    if (this.unsubChannel) this.unsubChannel();
    this.unsubChannel = onSnapshot(this.getChannelRef(channelID), (channel) => {
      let data = channel.data();
      if (data) {
        let cleanObj = this.setCleanChannelObj(data);
        let activeChannel = new Channel(cleanObj, channel.id);
        this.activeChannel$.next(activeChannel);
      }
    }); 
     
      this.messageService.subMessages('Channels', channelID);
  }

  async createChannel(channel: Channel) {
    let newId;
    await addDoc(this.getChannelsRef(), channel.getCleanBEJSON())
      .catch((err) => {
        alert([
          'Channel konnte nicht erstellt werden aufgrund folgenden Fehlers: ' +
            err,
        ]);
      })
      .then((docRef) => {
        newId = docRef?.id;
      });
    return newId;
  }

  async deleteChannel(channelID: string) {
    await deleteDoc(this.getChannelRef(channelID))
      .catch((err) => {
        alert([
          'Channel konnte nicht gelöscht werden aufgrund folgenden Fehlers: ' +
            err,
        ]);
      })
      .then((docRef) => {
      });
  }

  async updateChannel(channel: Channel) {
    await updateDoc(this.getChannelRef(channel.id), channel.getCleanBEJSON())
      .catch((err) => {
        alert([
          'Channel konnte nicht geupdatet werden aufgrund folgenden Fehlers: ' +
            err,
        ]);
      })
      .then((docRef) => {
      });
  }

  setCleanChannelObj(obj: any) {
    return {
      name: obj.name,
      creator: this.userService.getUser(obj.creatorID),
      description: obj.description,
      members: this.userService.getFilterdUserList(obj.userID),
    };
  }

  getChannelsNameList() {
    return this.channels$.value.map((channel) => channel.name);
  }

  getChannelsRef() {
    return collection(this.firestore, 'Channels');
  }

  getChannelRef(docID: string) {
    return doc(collection(this.firestore, 'Channels'), docID);
  }

  ngOnDestroy() {
    this.unsubChannels();
    this.unsubChannel();
    this.unsubActiveUser.unsubscribe();
  }
}
