import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { HttpService } from '../../services/http/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface UserProps {
  uuid: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phonenumber: string;
}

@Component({
  selector: 'app-account-settings',
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
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent {
  editUser = false;
  account: UserProps | null = null;

  async fetchAccountInfo() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/account',
      {
        session: this.authService.getSession(),
      }
    );
    if (response.status == 'success') {
      this.account = response.data;
      this.firstnameInput?.setValue(this.account?.firstname);
      this.lastnameInput?.setValue(this.account?.lastname);
      this.usernameInput?.setValue(this.account?.username);
      this.emailInput?.setValue(this.account?.email);
      this.phonenumberInput?.setValue(this.account?.phonenumber);
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private httpService: HttpService,
    private snackBar: MatSnackBar
  ) {
    this.fetchAccountInfo();

    this.hidePassword = true;
    this.hideNewPassword = true;
    this.hideRepeatNewPassword = true;
  }

  accountInfoForm: FormGroup = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phonenumber: new FormControl('', [Validators.required]),
  });

  get firstnameInput() {
    return this.accountInfoForm.get('firstname');
  }
  get lastnameInput() {
    return this.accountInfoForm.get('lastname');
  }
  get usernameInput() {
    return this.accountInfoForm.get('username');
  }
  get emailInput() {
    return this.accountInfoForm.get('email');
  }
  get phonenumberInput() {
    return this.accountInfoForm.get('phonenumber');
  }

  async submitAccountInfoChanges() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/account/change',
      {
        session: this.authService.getSession(),
        firstname: this.firstnameInput?.value,
        lastname: this.lastnameInput?.value,
        username: this.usernameInput?.value,
        email: this.emailInput?.value,
        phonenumber: this.phonenumberInput?.value,
      }
    );

    if (response.status == 'success') {
      this.fetchAccountInfo();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  hidePassword: boolean;
  hideNewPassword: boolean;
  hideRepeatNewPassword: boolean;

  changePasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.min(4)]),
    repeatNewPassword: new FormControl('', [Validators.required]),
  });

  get passwordInput() {
    return this.changePasswordForm.get('password');
  }
  get newPasswordInput() {
    return this.changePasswordForm.get('newPassword');
  }
  get repeatNewPasswordInput() {
    return this.changePasswordForm.get('repeatNewPassword');
  }

  async submitPasswordChange() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/account/change_password',
      {
        session: this.authService.getSession(),
        password: this.passwordInput?.value,
        newPassword: this.newPasswordInput?.value,
        repeatNewPassword: this.repeatNewPasswordInput?.value,
      }
    );

    if (response.status == 'success') {
      this.fetchAccountInfo();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }
}
