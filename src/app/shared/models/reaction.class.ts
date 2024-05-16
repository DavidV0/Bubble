//import classes
import { User } from './user.class';

export class Reaction {
  emoji: string;
  users: User[] = [];

  constructor(obj: any) {
    this.emoji = obj ? obj.emoji : '';
    this.users = obj ? obj.users : [];
  }

  addUser(user: User) {
    let userExist = this.users.find((element) => element == user);
    if (!userExist) this.users.push(user);
  }

  deleteUser(user: User) {
    let idx = this.users.findIndex((element) => element == user);
    this.users.splice(idx, 1);
  }

  toggleUser(user: User) {
    let idx = this.users.findIndex((element) => element.id == user.id);
    idx == -1 ? this.users.push(user) : this.users.splice(idx, 1);
  }

  getCleanBEJSON() {
    return {
      emoji: this.emoji,
      users: this.users.map((user) => user.id),
    };
  }
}
