import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { QRCodeModule } from 'angularx-qrcode';
import { HttpService } from '../../../services/http/http.service';
import { AuthService } from '../../../services/auth/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogRef } from '@angular/cdk/dialog';

interface DialogData {
  authUrl: string;
  useruid: string;
}

@Component({
  selector: 'app-configurate-app-mfa',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    QRCodeModule,
    MatFormFieldModule
  ],
  templateUrl: './configurate-app-mfa.component.html',
  styleUrl: './configurate-app-mfa.component.scss',
})
export class ConfigurateAppMfaComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private httpService: HttpService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ConfigurateAppMfaComponent>
    ){}

  appForm = new FormGroup({
    code: new FormControl('', [Validators.required]),
  });

  async submitAppMFACode() {
    const response = await this.httpService.post('http://localhost:3100/api/account/mfa/app/verify', {
      session: this.authService.getSession(),
      code: this.appForm.get('code')?.value,
      useruid: this.data.useruid,
    });

    if (response.status == 'success') {
      this.dialogRef.close(true);
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }
}
