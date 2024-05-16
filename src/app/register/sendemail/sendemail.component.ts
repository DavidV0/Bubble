import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

// import firebase
import { sendPasswordResetEmail } from 'firebase/auth';

// import customer components
import { OverlayemailsendComponent } from './overlayemailsend/overlayemailsend.component';

// import services
import { FirebaseInitService } from '../../services/firebase-init.service';

@Component({
  selector: 'app-sendemail',
  standalone: true,
  imports: [FormsModule, OverlayemailsendComponent],
  templateUrl: './sendemail.component.html',
  styleUrl: './sendemail.component.scss',
})
export class SendemailComponent {
  eMail!: string;
  @Output() isShowen = new EventEmitter();
  toggleOverlay: boolean = true;

  private actionCodeSettings = {
    url: 'https://christian-westrich.developerakademie.net/Angular/DABubble/#/resetPW/',
    handleCodeInApp: true,
  };

  authService = inject(FirebaseInitService);

  onSubmit(form: NgForm) {
    if (form.valid) this.sendMail(form);
  }

  goBack() {
    this.isShowen.emit(false);
  }

  sendMail(form: NgForm) {
    sendPasswordResetEmail(
      this.authService.getAuth(),
      this.eMail,
      this.actionCodeSettings
    )
      .then(() => {
        this.toggleOverlay = !this.toggleOverlay;
        setTimeout(() => {
          form.reset();
          this.isShowen.emit(true);
        }, 4000);
      })
      .catch((err) => {
        alert([
          'eMail konnte nicht gesendet werden aufgrund folgendem Fehler:' + err,
        ]);
      });
  }
}
