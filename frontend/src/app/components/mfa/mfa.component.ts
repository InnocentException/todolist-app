import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth/auth.service';
import { HttpService } from '../../services/http/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mfa',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './mfa.component.html',
  styleUrl: './mfa.component.scss',
})
export class MfaComponent {
  @Input() method: string | null = null;
  @Input() email?: string = undefined;
  @Input() useruid: string = '';

  constructor(
    private authService: AuthService,
    private httpService: HttpService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  mailForm = new FormGroup({
    code: new FormControl(''),
  });

  async submitMailCode() {
    const response = await this.httpService.post(
      'api/account/mfa/mail/verify',
      {
        code: this.mailForm.get('code')?.value,
      }
    );
    if (response.status == 'success') {
      this.authService.updateSession(response.data.session);
      this.router.navigate(['/todos']);
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  appForm = new FormGroup({
    code: new FormControl(''),
  });

  async submitAppCode() {
    const response = await this.httpService.post(
      'api/account/mfa/app/verify',
      {
        code: this.appForm.get('code')?.value,
        useruid: this.useruid,
      }
    );
    if (response.status == 'success') {
      this.authService.updateSession(response.data.session);
      this.router.navigate(['/todos']);
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  setMethod(method: string) {
    this.method = method;
    if (this.method == 'mail') {
      this.httpService.post('api/account/mfa/mail/send', {
        useruid: this.useruid,
      });
    }
  }
}
