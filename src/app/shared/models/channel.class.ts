
//import classes
import { Message } from "./message.class";
import { User } from "./user.class";

export class Channel {
    id: string;
    name:string;
    description: string;
    members: User[];
    creator: User;
    messages: Message[];

    constructor(obj?: any, id?: string){
        this.id = id? id : '';
        this.name = obj? obj.name : '';
        this.creator = obj? obj.creator : new User();
        this.description = obj? obj.description : '';
        this.members = obj?  obj.members : [];
        this.messages = obj? obj.messages : [];
    }

    getCleanBEJSON(){
        return {
            creatorID: this.creator.id,
            description: this.description,
            name: this.name,
            userID: this.members.map(member => member.id),
        }
    }


}
