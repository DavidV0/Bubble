import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

// import classes
import { Message } from '../../models/message.class';
import { User } from '../../models/user.class';
import { Reaction } from '../../models/reaction.class';

// import services
import { ThreadsService } from '../../../services/ThreadsService';
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { ChannelService } from '../../../services/channel.service';
import { DirectMessageService } from '../../../services/direct-message.service';
import { StorageService } from '../../../services/storage.service';

// imort customer components
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { EmojiComponent } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-message-container',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent, EmojiComponent],
  templateUrl: './message-container.component.html',
  styleUrl: './message-container.component.scss',
})
export class MessageContainerComponent {
  threadService = inject(ThreadsService);
  overlayCtrlService = inject(OverlaycontrolService);
  userService = inject(UserService);
  timeStamp!: Date;
  messageService = inject(MessageService);
  channelService = inject(ChannelService);
  directMessageService = inject(DirectMessageService);
  storageService = inject(StorageService);

  @Input() message: Message = new Message();
  @Input({ required: true }) msgType: 'channel' | 'directMsg' | 'thread' =
    'channel';

  private textarea!: ElementRef;
  @ViewChild('textarea') set content(content: ElementRef) {
    if (content) this.textarea = content;
  }

  @Input() threadIndex!: any;
  lastThreadMsgTime: Date = new Date();

  newMsgContent!: string;
  editMsg: boolean = false;
  showMsgMenu: boolean = false;

  showEmojiPickerEditMsg: boolean = false;
  showEmojiPickerReaction: boolean = false;

  constructor() {}
  createTime(time: number) {
    return new Date(time);
  }

  toggleThreads() {
    this.threadService.isShowingSig.set(true);
    this.threadService.getThread(this.message.id);
    this.threadService.activeChannel =
      this.channelService.activeChannel$.value.id;
  }

  toggleMsgMenu(event: Event) {
    event.stopPropagation();
    this.showEmojiPickerReaction = false;
    this.showMsgMenu = !this.showMsgMenu;
  }

  selectUser(user: User) {
    this.overlayCtrlService.selectUser(user);
    user.id == this.userService.activeUser$.value.id
      ? this.overlayCtrlService.showOverlay('registeredUserProfile')
      : this.overlayCtrlService.showOverlay('userProfile');
  }

  isMessageFromActiveUser() {
    return this.userService.activeUser$.value.id == this.message.creator.id;
  }

  openEditMsgField(event: Event) {
    event.stopPropagation();
    this.newMsgContent = this.message.content;
    this.editMsg = true;
  }

  deleteMessage(event: Event) {
    event.stopPropagation();
    if (this.msgType == 'thread') {
      this.threadService.deleteThreadMessage(this.message.id);
      this.deleteFiles();
    } else {
      this.messageService.deleteMessage(
        this.getCollectionID(),
        this.getDocId(),
        this.message.id
      );
      this.deleteFiles();
    }
  }

  deleteFiles() {
    this.message.files.forEach((fileName) => {
      let storageRef = this.getStorageRef();
      if (storageRef) this.storageService.deleteFile(storageRef, fileName);
    });
  }

  updateMessage() {
    this.message.content = this.newMsgContent;
    if (this.msgType == 'thread') {
      this.threadService.updateThreadMessage(this.message.id, this.message);
    } else {
      this.messageService.updateMessage(
        this.getCollectionID(),
        this.getDocId(),
        this.message.id,
        this.message
      );
    }
    this.editMsg = false;
  }

  getCollectionID() {
    return this.msgType == 'channel' ? 'Channels' : 'directMessages';
  }

  getDocId() {
    return this.msgType == 'channel' || this.msgType == 'thread'
      ? this.channelService.activeChannel$.value.id
      : this.directMessageService.activeDirectMessage$.value.id;
  }

  resizeTextarea() {
    this.textarea.nativeElement.style.height = '0';
    this.textarea.nativeElement.style.height =
      this.textarea.nativeElement.scrollHeight + 'px';
  }

  addEmoji(event: any) {
    let textareaElement = this.textarea.nativeElement as HTMLTextAreaElement;
    let [caretStart, caretEnd] = [
      textareaElement.selectionStart,
      textareaElement.selectionEnd,
    ];
    this.newMsgContent =
      this.newMsgContent.substring(0, caretStart) +
      this.getEmoji(event) +
      this.newMsgContent.substring(caretEnd);
    this.toggleEmojiPicker('editMsg');
  }

  addReaction(emoji: string) {
    let user = this.userService.activeUser$.value;
    this.message.updateReactions(emoji, user);
    if (this.msgType == 'thread') {
      this.threadService.updateThreadMessage(this.message.id, this.message);
    } else {
      this.messageService.updateMessage(
        this.getCollectionID(),
        this.getDocId(),
        this.message.id,
        this.message
      );
    }
  }

  selectReaction(event: any) {
    let emoji = this.getEmoji(event);
    this.addReaction(emoji);
    this.toggleEmojiPicker('reaction');
  }

  getEmoji(event: any) {
    return event['emoji'].native;
  }

  toggleEmojiPicker(picker: 'editMsg' | 'reaction', event?: Event) {
    if (event) event.stopPropagation();
    this.showMsgMenu = false;
    if (picker == 'editMsg') {
      this.showEmojiPickerEditMsg = !this.showEmojiPickerEditMsg;
    } else {
      this.showEmojiPickerReaction = !this.showEmojiPickerReaction;
    }
  }

  hidePupUps() {
    this.showMsgMenu = false;
    this.showEmojiPickerEditMsg = false;
    this.showEmojiPickerReaction = false;
  }

  getReactionNames(emoji: string) {
    let names = '';
    let users = this.message.reactions.filter(
      (reaction) => reaction.emoji == emoji
    )[0].users;
    if (users.length > 2) {
      if (
        users.find((user) => user.id == this.userService.activeUser$.value.id)
      ) {
        names = users.length - 1 + 'Personen' + 'und Du';
      } else {
        names = users.length - 1 + 'Personen';
      }
    } else {
      users.forEach((user, idx, array) => {
        names += idx == array.length - 1 ? user.name : user.name + ' und ';
      });
    }
    return names;
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
      type == 'png' ||
      type == 'jpg' ||
      type == 'jpeg' ||
      type == 'svg' ||
      type == 'tif' ||
      type == 'bmp' ||
      type == 'emf' ||
      type == 'gif' ||
      type == 'png'
    )
      type = 'img';
    return type;
  }

  deleteFile(idx: number) {
    let fileName = this.message.files[idx];
    let storageRef = this.getStorageRef();
    if (storageRef) this.storageService.deleteFile(storageRef, fileName);

    this.message.files.splice(idx, 1);
    if (this.msgType == 'thread') {
      this.threadService.updateThreadMessage(this.message.id, this.message);
    } else {
      this.messageService.updateMessage(
        this.getCollectionID(),
        this.getDocId(),
        this.message.id,
        this.message
      );
    }
  }

  downloadFile(idx: number) {
    let fileName = this.message.files[idx];
    let storageRef = this.getStorageRef();
    if (storageRef) this.storageService.downloadFile(storageRef, fileName);
  }

  async openFile(idx: number) {
    let fileName = this.message.files[idx];
    let storageRef = this.getStorageRef();
    let url = storageRef
      ? await this.storageService.getFileURL(storageRef, fileName)
      : undefined;
    if (url) window.open(url, '_blank')?.focus();
  }

  getStorageRef() {
    let ref;
    switch (this.msgType) {
      case 'channel':
        ref = this.storageService.getChannelMsgRef(
          this.channelService.activeChannel$.value.id,
          this.message.id
        );
        break;
      case 'directMsg':
        ref = this.storageService.getDirectMessagesMsgRef(
          this.directMessageService.activeDirectMessage$.value.id,
          this.message.id
        );
        break;
      case 'thread':
        ref = this.storageService.getThreadMsgRef(
          this.channelService.activeChannel$.value.id,
          this.threadService.idOfThisThreads,
          this.message.id
        );
        break;
    }
    return ref;
  }

  showThread() {
    this.overlayCtrlService.showingMiddle.set(true)
    this.overlayCtrlService.showingRight.set(false)
    this.overlayCtrlService.showingHeader.set(true)
  }
}
