import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from '../../../services/http/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth/auth.service';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-configure-mail-mfa',
  standalone: true,
  imports: [
    MatDialogContent,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
  ],
  templateUrl: './configure-mail-mfa.component.html',
  styleUrl: './configure-mail-mfa.component.scss',
})
export class ConfigureMailMfaComponent {
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ConfigureMailMfaComponent>,
    @Inject(MAT_DIALOG_DATA) dialogData: {useruid: string}
  ) {
    this.httpService
      .post('api/account/mfa/mail/send', {
        useruid: dialogData.useruid,
      })
      .then((res) => {
        if (res.status == 'success') {
          this.snackBar.open(
            'A email with a 6 digit code was sent to the entered email address!',
            'Close',
            {
              duration: 2000,
            }
          );
        } else {
          this.snackBar.open(res.description, 'Close', {
            duration: 2000,
          });
        }
      });
  }

  codeForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.maxLength(6),
    ]),
  });

  async submitCode() {
    if (this.codeForm.get('code')?.valid) {
      const response = await this.httpService.post(
        'api/account/mfa/mail/verify',
        {
          session: this.authService.getSession(),
          code: this.codeForm.get('code')?.value,
        }
      );

      if (response.status == "success") {
        this.dialogRef.close(true);
      } else {
        this.snackBar.open(response.description, "Close", {
          duration: 2000,
        })
      }
    } else {
      this.snackBar.open("The code has to be 6 digits long!")
    }
  }
}
