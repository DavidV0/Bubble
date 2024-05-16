import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { environment } from '../../environment/environment';
import { getFirestore } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirebaseInitService {
  private app: any;
  private auth: any;
  private database: any;

  constructor() {
    this.initializeApp();
  }

  private initializeApp() {
    const firebaseConfig = environment.firebase;
    this.app = initializeApp(firebaseConfig);
    this.database = getFirestore(this.app);
    this.auth = getAuth(this.app);
  }

  getAuth() {
    return this.auth;
  }

  getDatabase() {
    return this.database; // greift nur auf die datenbank zu. es müsste hier noch der name der datenbank angefügt werden, die geladen werden soll
  }
}
