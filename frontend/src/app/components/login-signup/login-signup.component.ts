import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { WebsocketService } from '../../services/websocket/websocket.service';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { HttpService } from '../../services/http/http.service';
import { Router } from '@angular/router';
import {
  MatSnackBar,
} from '@angular/material/snack-bar';
import { PhoneInputComponent } from '../phone-input/phone-input.component';

@Component({
  selector: 'app-login-signup',
  standalone: true,
  imports: [
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    ReactiveFormsModule,
    CommonModule,
    PhoneInputComponent,
  ],
  templateUrl: './login-signup.component.html',
  styleUrl: './login-signup.component.scss',
})
export class LoginSignupComponent {
  selectedTabIndex = 0;

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    if (this.router.url == '/login') {
      this.selectedTabIndex = 0;
    } else if (this.router.url == '/register') {
      this.selectedTabIndex = 1;
    }
  }

  hideLoginPassword: boolean = true;
  hideRegisterPassword: boolean = true;
  hideRegisterRepeatPassword: boolean = true;

  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  signupForm: FormGroup = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phonenumber: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.min(4)]),
    repeatPassword: new FormControl('', [Validators.required]),
  });

  get usernameInput() {
    return this.loginForm.get('username');
  }
  get passwordInput() {
    return this.loginForm.get('password');
  }

  get signupFirstNameInput() {
    return this.signupForm.get('firstname');
  }
  get signupLastNameInput() {
    return this.signupForm.get('lastname');
  }
  get signupUsernameInput() {
    return this.signupForm.get('username');
  }
  get signupEmailInput() {
    return this.signupForm.get('email');
  }
  get signupPhonenumberInput() {
    return this.signupForm.get('phonenumber');
  }
  get signupRepeatPasswordInput() {
    return this.signupForm.get('repeatPassword');
  }
  get signupPasswordInput() {
    return this.signupForm.get('password');
  }

  async submitLogin() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/login',
      {
        username: this.usernameInput?.value,
        password: this.passwordInput?.value,
      }
    );

    if (response.status == 'success') {
      const session = response.data.session;
      this.authService.updateSession(response.data.session);
      this.router.navigate(['/todos']);
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }

    // this.wsService.send({
    //   cmd: 'login',
    //   username: this.usernameInput?.value,
    //   password: this.passwordInput?.value,
    // });
  }

  async submitRegister() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/register',
      {
        firstname: this.signupFirstNameInput?.value,
        lastname: this.signupLastNameInput?.value,
        username: this.signupUsernameInput?.value,
        email: this.signupEmailInput?.value,
        phonenumber: this.signupPhonenumberInput?.value,
        password: this.signupPasswordInput?.value,
        repeatPassword: this.signupRepeatPasswordInput?.value,
      }
    );

    if (response.status == 'success') {
      this.router.navigate(['/todos']);
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }

    // this.wsService.send({
    //   cmd: 'register',
    //   firstname: this.signupFirstNameInput?.value,
    //   lastname: this.signupLastNameInput?.value,
    //   username: this.signupUsernameInput?.value,
    //   password: this.signupPasswordInput?.value,
    //   repeatPassword: this.signupRepeatPasswordInput?.value,
    // });
  }
}
