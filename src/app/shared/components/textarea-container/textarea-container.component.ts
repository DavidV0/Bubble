import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  inject,
} from '@angular/core';
import { MessageService } from '../../../services/message.service';
import { ChannelService } from '../../../services/channel.service';
import { Message } from '../../models/message.class';
import { Channel } from '../../models/channel.class';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { User } from '../../models/user.class';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { UserlistitemComponent } from '../userlistitem/userlistitem.component';
import { StorageService } from '../../../services/storage.service';
import { StorageReference } from 'firebase/storage';
import { DirektMessage } from '../../models/direct-message.class';
import { DirectMessageService } from '../../../services/direct-message.service';
import { ThreadsService } from '../../../services/ThreadsService';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';

@Component({
  selector: 'app-textarea-container',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    PickerComponent,
    EmojiComponent,
    UserlistitemComponent,
  ],
  templateUrl: './textarea-container.component.html',
  styleUrls: ['./textarea-container.component.scss'],
})
export class TextareaContainerComponent {
  messageService = inject(MessageService);
  channelService = inject(ChannelService);
  userService = inject(UserService);
  storageService = inject(StorageService);
  directMessagesService = inject(DirectMessageService);
  threadsService = inject(ThreadsService);
  overlayControlService = inject(OverlaycontrolService);

  activeUser: User = new User();
  unsubscribeActiveUser: Subscription;

  @Input({ required: true }) type:
    | 'Channels'
    | 'directMessages'
    | 'newMessage'
    | 'thread' = 'Channels';
  @Input() sendTo!: Channel | User | undefined;

  newMessage: Message = new Message();

  showEmojiPicker: boolean = false;

  files: File[] = [];

  selectMember: boolean = false;
  unsubUsersList: Subscription;
  userList: User[] = [];

  @ViewChild('textarea') private textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('emojiPicker') emojiPicker!: ElementRef<HTMLDivElement>;
  @ViewChild('userListDiv') userListDiv!: ElementRef<HTMLDivElement>;

  constructor(private elementRef: ElementRef) {
    this.unsubscribeActiveUser = this.userService.activeUser$.subscribe(
      (user) => {
        this.activeUser = user;
      }
    );

    this.unsubUsersList = this.userService.usersList$.subscribe((data) => {
      this.userList = data;
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (
      this.emojiPicker &&
      !this.emojiPicker.nativeElement.contains(event.target as Node)
    ) {
      this.showEmojiPicker = false;
    }
    if (
      this.userListDiv &&
      !this.userListDiv.nativeElement.contains(event.target as Node)
    ) {
      this.selectMember = false;
    }
  }

  addEmoji(event: any) {
    let textareaElement = this.textarea.nativeElement;
    let [caretStart, caretEnd] = [
      textareaElement.selectionStart,
      textareaElement.selectionEnd,
    ];
    this.newMessage.content =
      this.newMessage.content.substring(0, caretStart) +
      this.getEmoji(event) +
      this.newMessage.content.substring(caretEnd);
    this.toggleEmojiPicker();
  }

  getEmoji(event: any) {
    return event['emoji'].native;
  }

  toggleEmojiPicker(event?: Event) {
    if (event) event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  async sendNewMessage() {
    this.fullfillMsgData();
    let newMsgId: string | undefined;

    if (this.type == 'thread') {
      newMsgId = await this.threadsService.saveThread(this.newMessage);
    } else if (this.type == 'newMessage') {
      newMsgId = await this.createNewMessage();
    } else {
      newMsgId = await this.createDirectMessageOrChannelMessage();
    }
    if (newMsgId) this.uploadFile(newMsgId);
    this.files = [];
    this.newMessage.content = '';
  }

  uploadFile(msgId: string) {
    let storageRef: StorageReference | undefined;
    if (this.type == 'thread') {
      storageRef = this.storageService.getThreadMsgRef(
        this.channelService.activeChannel$.value.id,
        this.threadsService.idOfThisThreads,
        msgId
      );
    } else if (this.sendTo instanceof User || this.type == 'directMessages') {
      storageRef = this.storageService.getDirectMessagesMsgRef(
        this.directMessagesService.activeDirectMessage$.value.id,
        msgId
      );
    } else if (this.sendTo instanceof Channel || this.type == 'Channels') {
      storageRef = this.storageService.getChannelMsgRef(
        this.channelService.activeChannel$.value.id,
        msgId
      );
    }

    this.files.forEach((file) => {
      if (storageRef) this.storageService.uploadFile(storageRef, file);
    });
  }

  fullfillMsgData() {
    this.newMessage.creator = this.activeUser;
    this.newMessage.date = new Date();
    if (this.type == 'Channels')
      this.newMessage.messageOfChannel =
        this.channelService.activeChannel$.value.id;
    this.files.forEach((file) => this.newMessage.files.push(file.name));
  }

  async createNewMessage(): Promise<string | undefined> {
    let msgId: string | undefined;
    if (this.sendTo instanceof User) {
      let directMsg = this.existDirectMessage(this.sendTo);
      let idDM;
      [idDM, msgId] = directMsg
        ? await this.addNewMessageToDirectMessage(directMsg)
        : await this.createNewDirectMessage([this.activeUser, this.sendTo]);
      this.overlayControlService.showMessageComponent('directMessage', idDM);
      if (idDM) this.addDmToUsers([this.activeUser, this.sendTo], idDM);
    } else if (this.sendTo instanceof Channel) {
      let channelID = this.sendTo?.id;
      if (channelID) {
        msgId = await this.messageService.addMessageToCollection(
          'Channels',
          channelID,
          this.getMessageObj()
        );
        this.overlayControlService.showMessageComponent('channel', channelID);
      }
    }
    return msgId;
  }

  existDirectMessage(user: User): DirektMessage | undefined {
    let directMsg: DirektMessage | undefined;
    if (user.id == this.activeUser.id) {
      this.directMessagesService.directMessages$.value.forEach(
        (directMessage) => {
          if (
            directMessage.users.length == 1 &&
            directMessage.users[0].id == user.id
          )
            directMsg = directMessage;
        }
      );
    } else {
      this.directMessagesService.directMessages$.value.forEach(
        (directMessage) => {
          if (directMessage.users.some((aryUser) => user.id == aryUser.id))
            directMsg = directMessage;
        }
      );
    }
    return directMsg;
  }

  addDmToUsers(users: User[], idDM: string) {
    users.forEach((user) => {
      if (!user.directMessagesIDs.includes(idDM)) {
        user.directMessagesIDs.push(idDM);
        this.userService.saveUser(user);
      }
    });
  }

  async createNewDirectMessage(users: User[]) {
    let id = '';
    let messages = [this.getMessageObj()];
    let obj = { users, messages };
    let directMessage = new DirektMessage(obj, id);
    return await this.directMessagesService.createNewDirectMessage(
      directMessage
    );
  }

  async addNewMessageToDirectMessage(directMessage: DirektMessage) {
    let msgId = await this.messageService.addMessageToCollection(
      'directMessages',
      directMessage.id,
      this.getMessageObj()
    );
    return [directMessage.id, msgId];
  }

  getMessageObj() {
    let message = new Message();
    message.creator = this.activeUser;
    message.content = this.newMessage.content;
    message.date = new Date();
    for (let i = 0; i < this.files.length; i++) {
      message.files.push(this.files[i].name);
    }
    message.reactions = [];
    return message;
  }

  async createDirectMessageOrChannelMessage() {
    let msgId = await this.messageService.addMessageToCollection(
      this.getCollection(),
      this.getDocId(),
      this.newMessage
    );
    return msgId;
  }

  getDocId(): string {
    return this.type == 'Channels'
      ? this.channelService.activeChannel$.value.id
      : this.directMessagesService.activeDirectMessage$.value.id;
  }

  getCollection(): 'Channels' | 'directMessages' {
    return this.type == 'Channels' ? 'Channels' : 'directMessages';
  }

  addUser(user: User) {
    let textareaElement = this.textarea.nativeElement;
    let [caretStart, caretEnd] = [
      textareaElement.selectionStart,
      textareaElement.selectionEnd,
    ];
    this.newMessage.content =
      this.newMessage.content.substring(0, caretStart) +
      '@' +
      user.name +
      this.newMessage.content.substring(caretEnd);
  }

  toggleUserList() {
    this.selectMember = !this.selectMember;
  }

  openFileExplorer() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.click();
    fileInput.addEventListener('change', (event) => {
      const fileList: any = (event.target as HTMLInputElement).files;
      if (fileList && fileList.length > 0) {
        const file: File = fileList[0];

        if (this.checkFileType(file)) {
          this.files.push(file);
        } else {
          alert(
            'Es werden nur folgende Dokumente akzeptiert (png. jpg, jpeg, svg, tif, bmp emf, gif, png, pdf, excel, word, zip, ppt'
          );
        }
      }
    });
  }

  checkFileType(file: File): boolean {
    let type = this.getFileType(file.name);
    return (
      type === 'img' ||
      type === 'pdf' ||
      type === 'excel' ||
      type === 'word' ||
      type === 'zip' ||
      type === 'ppt'
    );
  }

  getFileImgPath(fileName: string) {
    let imgPath = 'assets/img/fileType/document.png';
    let fileType = this.getFileType(fileName);
    switch (fileType) {
      case 'img':
        imgPath = 'assets/img/fileType/image.png';
        break;
      case 'pdf':
        imgPath = 'assets/img/fileType/pdf.png';
        break;
      case 'word':
        imgPath = 'assets/img/fileType/word.png';
        break;
      case 'zip':
        imgPath = 'assets/img/fileType/zip.png';
        break;
      case 'ppt':
        imgPath = 'assets/img/fileType/ppt.png';
        break;
      case 'excel':
        imgPath = 'assets/img/fileType/excel.png';
        break;
      default:
        break;
    }
    return imgPath;
  }

  getFileType(fileName: string) {
    let type = fileName.split('.').splice(-1)[0].toLocaleLowerCase();
    if (
      ['png', 'jpg', 'jpeg', 'svg', 'tif', 'bmp', 'emf', 'gif'].includes(type)
    ) {
      type = 'img';
    }
    return type;
  }

  deleteFile(idx: any) {
    this.files.splice(idx, 1);
  }

  ngOnDestroy() {
    this.unsubscribeActiveUser.unsubscribe();
    this.unsubUsersList.unsubscribe();
  }
}
