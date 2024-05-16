import { Component, inject } from '@angular/core';
import { Subscription } from 'rxjs';

// import services
import { OverlaycontrolService } from '../../../services/overlaycontrol.service';
import { DirectMessageService } from '../../../services/direct-message.service';
import { UserService } from '../../../services/user.service';

// import classes
import { User } from '../../../shared/models/user.class';
import { DirektMessage } from '../../../shared/models/direct-message.class';
import { Message } from '../../../shared/models/message.class';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [],
  templateUrl: './userprofile.component.html',
  styleUrl: './userprofile.component.scss',
})
export class UserprofileComponent {
  overlayCtrlService = inject(OverlaycontrolService);
  directMessageService = inject(DirectMessageService);
  userService = inject(UserService);

  unsubActiveUser: Subscription;
  activeUser!: User;

  user!: User;

  directMessage: DirektMessage = new DirektMessage();

  constructor() {
    this.unsubActiveUser = this.userService.activeUser$.subscribe((user) => {
      this.activeUser = user;
    });

    this.user = this.overlayCtrlService.selectedUser || new User();
  }

  async sendMessage() {
    let directMsg = this.existDirectMessage(this.user);
    let [idDM, msgId] = directMsg
      ? directMsg.id
      : await this.createNewDirectMessage([this.activeUser, this.user]);
    if (idDM) this.addDmToUsers([this.activeUser, this.user], idDM);
    this.overlayCtrlService.showMessageComponent('directMessage', idDM);
    this.overlayCtrlService.hideOverlay();
  }

  addDmToUsers(users: User[], idDM: string) {
    users.forEach((user) => {
      if (!user.directMessagesIDs.includes(idDM)) {
        user.directMessagesIDs.push(idDM);
        this.userService.saveUser(user);
      }
    });
  }

  existDirectMessage(user: User): DirektMessage | undefined {
    let directMsg;
    this.directMessageService.directMessages$.value.forEach((directMessage) => {
      if (directMessage.users.some((aryUser) => user.id == aryUser.id))
        directMsg = directMessage;
    });
    return directMsg;
  }

  async createNewDirectMessage(users: User[]) {
    let id = '';
    let messages: Message[] = [];
    let obj = { users, messages };
    let directMessage = new DirektMessage(obj, id);
    return await this.directMessageService.createNewDirectMessage(
      directMessage
    );
  }
}
