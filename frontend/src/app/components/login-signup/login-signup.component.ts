import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
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
import { AuthService } from '../../services/auth/auth.service';
import { HttpService } from '../../services/http/http.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PhoneInputComponent } from '../phone-input/phone-input.component';
import { MfaComponent } from '../mfa/mfa.component';
import { TodolistService } from '../../services/todolist/todolist.service';

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
    MfaComponent,
  ],
  templateUrl: './login-signup.component.html',
  styleUrl: './login-signup.component.scss',
})
export class LoginSignupComponent {
  selectedTabIndex = 0;
  mfaRequired: boolean = false;
  mfaMethod: string | null = null;
  useruid: string = '';

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private todolistsService: TodolistService,
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
      'api/login',
      {
        username: this.usernameInput?.value,
        password: this.passwordInput?.value,
      }
    );

    if (response.status == 'success') {
      const session = response.data.session;
      this.authService.updateSession(session);
      this.router.navigate(['/todos']);
    } else if (response.status == 'mfa') {
      this.mfaRequired = true;
      this.mfaMethod = response.data.method;
      this.useruid = response.data.useruid;
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  async submitRegister() {
    if (
      this.signupFirstNameInput?.valid &&
      this.signupLastNameInput?.valid &&
      this.signupUsernameInput?.valid &&
      this.signupEmailInput?.valid &&
      this.signupPhonenumberInput?.valid &&
      this.signupPasswordInput?.valid &&
      this.signupRepeatPasswordInput?.valid
    ) {
      const response = await this.httpService.post(
        'api/register',
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
    } else {
      this.snackBar.open("The Data you entered is not valid. Please check if you filled out all Fileds and if you wrote the email in the correct form!")
    }
  }
}
