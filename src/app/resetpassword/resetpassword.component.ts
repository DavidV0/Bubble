import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';

// import firebase
import { confirmPasswordReset } from 'firebase/auth';

// import custom components
import { OverlayanmeldenComponent } from './overlayanmelden/overlayanmelden.component';

// import services
import { FirebaseInitService } from '../services/firebase-init.service';

@Component({
  selector: 'app-resetpassword',
  standalone: true,
  imports: [FormsModule, OverlayanmeldenComponent, RouterLink],
  templateUrl: './resetpassword.component.html',
  styleUrl: './resetpassword.component.scss',
})
export class ResetpasswordComponent {
  newPassword!: string;
  confirmPassword!: string;

  oobCode!: string;

  authService = inject(FirebaseInitService);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      this.oobCode = params['oobCode'];
    });
  }

  toggleOverlay: boolean = true;

  onSubmit(form: NgForm) {
    if (form.valid) {
      confirmPasswordReset(
        this.authService.getAuth(),
        this.oobCode,
        this.newPassword
      )
        .then(() => {
          this.toggleOverlay = !this.toggleOverlay;
          setTimeout(() => {
            form.reset();
            this.router.navigate(['']);
          }, 4000);
        })
        .catch((err) => {
          alert(
            'Passwort zurücksetzten hat nicht funktioniert aufgrund folgendem Fehler:' +
              err
          );
        });
    }
  }
}
