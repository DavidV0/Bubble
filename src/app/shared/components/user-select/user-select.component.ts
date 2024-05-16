import { Component, EventEmitter, Input, Output, inject } from '@angular/core';

// import services
import { UserService } from '../../../services/user.service';

// import customer comonents
import { UserlistitemComponent } from '../userlistitem/userlistitem.component';

// import classes
import { User } from '../../models/user.class';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-select',
  standalone: true,
  imports: [UserlistitemComponent],
  templateUrl: './user-select.component.html',
  styleUrl: './user-select.component.scss',
})
export class UserSelectComponent {
  @Input() selectedUsers: User[] = [];
  @Output() selectedUsersOut = new EventEmitter<User[]>();

  userService = inject(UserService);

  unsubUsersList: Subscription
  userList: User[] = [];
  filteredUserList: User[] = [];

  constructor() {
    this.unsubUsersList = this.userService.usersList$.subscribe(data => {
      this.userList = data
    });
    this.filteredUserList = this.userList;
  }

  removeUser(idx: number) {
    this.selectedUsers.splice(idx, 1);
    this.selectedUsersOut.emit(this.selectedUsers);
  }

  filterUsers(prompt: string) {
    if (prompt[0] == '@') {
      this.filteredUserList = this.userList
    } else {
      
      this.filteredUserList = this.userList.filter((user) =>
        user.name.toLowerCase().includes(prompt.toLowerCase())
    );
    }
  }

  addUser(idx: number) {
    if (
      !this.selectedUsers.find((user) => user == this.filteredUserList[idx])
    ) {
      this.selectedUsers.push(this.filteredUserList[idx]);
      this.selectedUsersOut.emit(this.selectedUsers);
    }
  }
  ngOnDestroy(): void {
    this.unsubUsersList.unsubscribe()
  }
}
