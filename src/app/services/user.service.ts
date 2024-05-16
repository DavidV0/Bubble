import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FirebaseInitService } from './firebase-init.service';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { User } from '../shared/models/user.class';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  enteredPassword!: string;
  // usersList: User[] = [];
  usersList$: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  unsubUserList: any;
  unsubUser: any;
  activeUser$: BehaviorSubject<User> = new BehaviorSubject<User>(new User());

  constructor(
    private firebaseInitService: FirebaseInitService,
    private router: Router
  ) {
    this.getUsersList();
    if (!this.activeUser$.value.isAuth) {
      this.loadingUserFromStorage();
    }
  }

  ngOnInit() {
    if (!this.activeUser$.value.isAuth) {
      this.loadingUserFromStorage();
    }
  }

  getUserListRef() {
    return collection(this.firebaseInitService.getDatabase(), 'users');
  }

  getUserRef(id: string) {
    return doc(this.getUserListRef(), id);
  }

  async getUsersList() {
    this.unsubUserList = await onSnapshot(this.getUserListRef(), (list) => {
      let listOfUsers: any = [];
      list.forEach((element) => {
        let userData = { ...element.data(), ...{ id: element.id } };
        let user = new User(userData);
        listOfUsers.push(user);
      });
      this.usersList$.next(listOfUsers);
    });
  }

  getUser(userID: string): User | undefined {
    return this.usersList$.value.find((user) => user.id == userID);
  }

  getFilterdUserList(userIDs: string[]): User[] {
    let list: User[] = [];
    userIDs.forEach((userID) => {
      let user = this.getUser(userID);
      if (user) list.push(user);
    });
    return list;
  }

  ngOnDestroy(): void {
    this.unsubUserList.unsubscribe();
    this.unsubUser.unsubscribe();
  }

  async loadUser(userID: string) {
    let userRef = this.getUserRef(userID);
    await getDoc(userRef).then((data) => {
      const userData = data.data();
      const user = new User(userData);
      this.activeUser$.next(user);
      this.activeUser$.value.isAuth = true;
      this.activeUser$.value.status = 'Aktiv';
      this.router.navigate(['generalView']);
      this.saveUser(this.activeUser$.value);
    });
    this.unsubUser = onSnapshot(userRef, (data: any) => {
      const userData = data.data();
      const user = new User(userData);
      this.activeUser$.next(user);
    });
  }

  async saveUser(user: User) {
    await setDoc(
      doc(this.firebaseInitService.getDatabase(), 'users', user.id),
      user.toJSON()
    );
  }

  saveIdToLocalStorate(userId: string) {
    localStorage.setItem('user', userId);
  }

  getUserImgPath(user: User) {
    // Pfad des User img setzten wenn ein custom IMG verwendet wird. Sonst keine Änderung nötig. Erkennung durch 'assets' im Pfad. custom img pfad beinhalet nur den IMG-Namen
  }

  async loadingUserFromStorage() {
    let currentUserId = localStorage.getItem('user');
    if (currentUserId) {
      await this.loadUser(currentUserId);
    } else {
      return undefined;
    }
  }

  async userLogOut() {
    await this.firebaseInitService.getAuth().signOut();
    this.activeUser$.value.isAuth = false;
    this.activeUser$.value.status = 'Abwesend';
    await this.saveUser(this.activeUser$.value).then(() => {
      this.router.navigate(['/']);
    });
  }
}
