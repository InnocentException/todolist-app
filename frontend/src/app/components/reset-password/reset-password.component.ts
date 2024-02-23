import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../services/http/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  token: string;
  email_sent: boolean;

  hidePassword: boolean;
  hideRepeatPassword: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private httpService: HttpService
  ) {
    this.token = route.snapshot.params['token'];
    this.email_sent = false;
    this.hidePassword = true;
    this.hideRepeatPassword = true;
  }

  usernameForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
  });

  resetPasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.min(4)]),
    repeatPassword: new FormControl('', [Validators.required]),
  });

  get usernameInput() {
    return this.usernameForm.get('username');
  }

  get passwordInput() {
    return this.resetPasswordForm.get('password');
  }

  get repeatPasswordInput() {
    return this.resetPasswordForm.get('repeatPassword');
  }

  async submitResetPassword() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/reset_password',
      {
        token: this.token,
        password: this.passwordInput?.value,
        repeatPassword: this.repeatPasswordInput?.value,
      }
    );

    if (response.status == 'success') {
      this.router.navigate(['/login']);
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  async submitResetPasswordRequest() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/reset_password',
      {
        username: this.usernameInput?.value,
      }
    );

    if (response.status == 'success') {
      this.email_sent = true;
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }
}
