import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { RegisterService } from '../../services/register.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  lgnDisabled: boolean = true;
  @Output() isPwForgotten = new EventEmitter();
  @Output() isShowen = new EventEmitter();
  loginError = this.registerService.loginError

  constructor(
    private router: Router,
    private registerService: RegisterService
  ) {}

  onSubmit(f: NgForm) {
    this.registerService.logUserIn(f.value.userEmail, f.value.password);
  }


  logInTestUser() {
    this.registerService.logInTestUser();
  }

  forgotPw() {
    this.isPwForgotten.emit(true);
  }

  googleLogIn() {
    this.registerService.logInWithGoogle();
  }
}
