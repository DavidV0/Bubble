// import classes

import { Reaction } from './reaction.class';
import { User } from './user.class';

export class Message {
  creator!: User;
  date!: Date;
  id: string;
  content: string = '';
  answers: { amount: number; lastAnswer: Date };
  reactions: Reaction[] = [];
  files: string[] = []; // muss noch geklärt werden was wir hier speichern --> Idee: Link/name auf Datei in store
  messageOfChannel: string;

  constructor(obj?: any, id?: string, channelId?: string) {
    this.id = id ? id : '';
    this.creator = obj ? obj.creator : new User();
    this.date = obj ? this.getDate(obj.date) : new Date();
    this.content = obj ? obj.content : '';
    this.answers = obj ? obj.answers : { amount: 0, lastAnswer: new Date() };
    this.reactions = obj ? obj.reactions : [];
    this.files = obj ? obj.files : [];
    this.messageOfChannel = channelId ? channelId : '';
  }

  private getDate(time: number) {
    return new Date(time);
  }

  getCleanBEJSON(channelId?: string) {
    return {
      creatorId: this.creator.id,
      date: this.date.getTime(),
      content: this.content,
      reaction: this.getReactionArray(),
      files: this.files,
      answers: this.getBEAnswersObj(),
      messageOfChannel: this.messageOfChannel,
    };
  }

  getReactionArray() {
    let reactionAryBE: any = [];
    this.reactions.forEach((reaction) =>
      reactionAryBE.push(reaction.getCleanBEJSON())
    );
    return reactionAryBE;
  }

  getBEAnswersObj() {
    return {
      amount: this.answers.amount,
      lastAnswer: this.answers.lastAnswer.getTime(),
    };
  }

  updateReactions(emoji: string, user: User) {
    let idx = this.reactions.findIndex((reaction) => reaction.emoji == emoji);
    if (idx == -1) {
      this.reactions.push(new Reaction({ emoji, users: [user] }));
    } else {
      this.reactions[idx].toggleUser(user);
      if (this.reactions[idx].users.length == 0) this.reactions.splice(idx, 1);
    }
  }
}
