import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpService } from '../../../services/http/http.service';
import { AuthService } from '../../../services/auth/auth.service';
import { DialogRef } from '@angular/cdk/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-configure-profile-picture-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogContent,
    MatDialogClose,
    MatDialogActions,
  ],
  templateUrl: './configure-profile-picture-dialog.component.html',
  styleUrl: './configure-profile-picture-dialog.component.scss',
})
export class ConfigureProfilePictureDialogComponent {
  profile_picture: string = '';

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private dialogRef: DialogRef,
    private snackBar: MatSnackBar,
  ) {}

  handleProfilePicture(event: any) {
    const reader = new FileReader();
    reader.onload = () => {
      this.profile_picture = String(reader.result);
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  async submitProfilePicture() {
    const response = await this.httpService.post(
      'api/account/change',
      {
        session: this.authService.getSession(),
        profile_picture: this.profile_picture,
      }
    );

    if (response.status == "success") {
      this.dialogRef.close();
    } else {
      this.snackBar.open(response.description, "Clos", {
        duration: 2000,
      })
    }
  }
}
