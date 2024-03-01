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
import { MatListModule } from '@angular/material/list';
import { UserProps } from '../../utils/types';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurateAppMfaComponent } from '../dialogs/configurate-app-mfa/configurate-app-mfa.component';
import { ConfigureProfilePictureDialogComponent } from '../dialogs/configure-profile-picture-dialog/configure-profile-picture-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { ConfigureMailMfaComponent } from '../dialogs/configure-mail-mfa/configure-mail-mfa.component';

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
    MatListModule,
    MatAccordion,
    MatExpansionModule,
  ],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss',
})
export class AccountSettingsComponent {
  editUser = false;
  account: UserProps | null = null;

  async fetchAccountInfo() {
    const response = await this.httpService.post(
      'api/account',
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

      this.emailMFAForm
        .get('email')
        ?.setValue(this.account?.mfa.mail.mailAddress);
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
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
    if (
      this.firstnameInput?.valid &&
      this.lastnameInput?.valid &&
      this.usernameInput?.valid &&
      this.emailInput?.valid &&
      this.phonenumberInput?.valid
    ) {
      const response = await this.httpService.post(
        'api/account/change',
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
    } else {
      this.snackBar.open(
        'The input is not vaild. Please check if you filled out all fields and if you wrote the email correct!'
      );
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
    if (
      this.passwordInput?.valid &&
      this.newPasswordInput?.valid &&
      this.repeatNewPasswordInput?.valid
    ) {
      const response = await this.httpService.post(
        'api/account/change_password',
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
    } else {
      this.snackBar.open(
        'The input is not valid. Please check if you filled out all fields and if the new password is more than 4 character long!'
      );
    }
  }

  emailMFAForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required]),
  });

  async toggleMailMFA() {
    const response = await this.httpService.post(
      'api/account/mfa/mail/setup',
      {
        session: this.authService.getSession(),
        enabled: !this.account?.mfa?.mail?.enabled,
        mailAddress: this.emailMFAForm.get('email')?.value,
      }
    );

    if (response.status == 'success') {
      if (!this.account?.mfa.mail.enabled) {
        const dialogRef = this.dialog.open(ConfigureMailMfaComponent, {
          exitAnimationDuration: 500,
          enterAnimationDuration: 500,
          data: { useruid: this.account?.uuid },
        });
        dialogRef.afterClosed().subscribe(async (done) => {
          if (done) {
            this.fetchAccountInfo();
          } else {
            const response = await this.httpService.post(
              'api/account/mfa/mail/setup',
              {
                session: this.authService.getSession(),
                enabled: false,
                mailAddress: this.emailMFAForm.get('email')?.value,
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
        });
      }
      this.fetchAccountInfo();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  authUrl: string = '';

  async toggleAppMFA() {
    const response = await this.httpService.post(
      'api/account/mfa/app/setup',
      {
        session: this.authService.getSession(),
        enabled: !this.account?.mfa.app.enabled,
      }
    );
    if (!this.account?.mfa?.app?.enabled) {
      if (response.status == 'success') {
        this.authUrl = response.data.tfaURL;
        const dialogRef = this.dialog.open(ConfigurateAppMfaComponent, {
          exitAnimationDuration: 500,
          enterAnimationDuration: 500,
          data: { authUrl: this.authUrl, useruid: this.account?.uuid },
        });

        dialogRef.afterClosed().subscribe(async (done) => {
          if (done) {
            this.fetchAccountInfo();
          } else {
            const response = await this.httpService.post(
              'api/account/mfa/app/setup',
              {
                session: this.authService.getSession(),
                enabled: false,
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
        });
      } else {
        this.snackBar.open(response.description, 'Close', {
          duration: 2000,
        });
      }
    } else {
      if (response.status == 'success') {
        this.fetchAccountInfo();
      } else {
        this.snackBar.open(response.description, 'Close', {
          duration: 2000,
        });
      }
    }
  }

  openUploadProfilePictureDialog() {
    const dialogRef = this.dialog.open(ConfigureProfilePictureDialogComponent, {
      exitAnimationDuration: 500,
      enterAnimationDuration: 500,
    });

    dialogRef.afterClosed().subscribe(() => {
      this.fetchAccountInfo();
    });
  }

  deleteAccount() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      exitAnimationDuration: 500,
      enterAnimationDuration: 500,
    });

    dialogRef.afterClosed().subscribe(async (data: any) => {
      if (data == true) {
        const response = await this.httpService.post(
          'api/account/delete',
          {
            session: this.authService.getSession(),
          }
        );

        if (response.status == 'success') {
          this.authService.logout();
        }
      }
    });
  }
}
