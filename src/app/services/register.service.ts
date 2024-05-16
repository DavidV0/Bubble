import { Injectable, inject, signal } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { BehaviorSubject } from 'rxjs';
import { FirebaseInitService } from './firebase-init.service';
import { User } from '../shared/models/user.class';
import { Router } from '@angular/router';
import { UserService } from './user.service';
import { DirectMessageService } from './direct-message.service';
import { ChannelService } from './channel.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  googleProvider = new GoogleAuthProvider();
  userToCreate$: BehaviorSubject<User> = new BehaviorSubject<User>(new User());
  directMessageService = inject(DirectMessageService);
  channelService = inject(ChannelService);
  loginError = signal(false)

  constructor(
    private firebaseInitService: FirebaseInitService,
    private router: Router,
    private userService: UserService
  ) {}

  async createAcc(email: string, password: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.firebaseInitService.getAuth(),
        email,
        password
      );
      this.userToCreate$.value.id = userCredential.user.uid;
      await this.userService.saveUser(this.userToCreate$.value);
    } catch (error: any) {
      alert(
        'Es ist bei der Erstellung des Kontos etwas schief gelaufen. Folgender Fehler trat auf: ' +
          error.message
      );
    }
  }

  async logInWithGoogle() {
    await signInWithPopup(
      this.firebaseInitService.getAuth(),
      this.googleProvider
    )
      .then( async (result) => {
        let user = new User({
          id: result.user.uid,
          name: result.user.displayName,
          channelIDs: [],
          directMessagesIDs: [],
          email: result.user.email,
          imgPath: result.user.photoURL,
          status: 'Aktiv',
          password: '',
          isAuth: true,
        });
        let userData: any = ''
        setTimeout(() => {
            userData =  this.userService.getUserRef(user.id);
        }, 500);
        if (userData) {
          if ( userData.id == user.id) {
           await this.userService.loadUser(userData.id);
          }
        } else {
          this.userService.activeUser$.next(user);
          setTimeout(() => {
            
            this.userService.saveUser(user)
            }, 500);
            this.directMessageService.subDirectMessagesList();
            this.channelService.subChannels();
          this.router.navigate(['/generalView']);
          ;
        }
      })
      .catch((error) => {    
      });
  }

  async logUserIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.firebaseInitService.getAuth(),
        email,
        password
      );
      await this.userService.loadUser(userCredential.user.uid);
      this.userService.saveIdToLocalStorate(userCredential.user.uid);
    } catch (error: any) {
        this.loginError.set(true)
    }
    await this.directMessageService.subDirectMessagesList();
    await this.channelService.subChannels();
  }

  async logInTestUser() {
    await this.logUserIn('TestEmail@test.de', '123456Test!');
  }
}
