import { Component, Inject } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { TodolistService } from '../../../services/todolist/todolist.service';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { TodoListProps, UserProps } from '../../../utils/types';
import { HttpService } from '../../../services/http/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { DialogModule, DialogRef } from '@angular/cdk/dialog';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../services/auth/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-configure-share-todolist-dialog',
  standalone: true,
  imports: [
    MatListModule,
    CommonModule,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './configure-share-todolist-dialog.component.html',
  styleUrl: './configure-share-todolist-dialog.component.scss',
})
export class ConfigureShareTodolistDialogComponent {
  sharedUsers: string[];

  constructor(
    private todolistService: TodolistService,
    @Inject(MAT_DIALOG_DATA) private dialogData: { todoList: TodoListProps },
    private httpService: HttpService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: DialogRef
  ) {
    this.sharedUsers = [];

    for (const useruid of dialogData.todoList.sharedUsers) {
      this.fetchAccountUsernameByUUID(useruid).then((uname) => {
        this.sharedUsers.push(uname);
      });
    }
  }

  async fetchAccountUsernameByUUID(uuid: string): Promise<string> {
    const response = await this.httpService.get(
      `http://localhost:3100/api/account/${uuid}`
    );
    if (response.status == 'success') {
      return response.data.username;
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
    return '';
  }

  addSharedUserForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
  });

  async applySharedUsers() {
    const response = await this.httpService.post(
      `http://localhost:3100/api/todolist/${this.dialogData.todoList.uuid}/share`,
      {
        session: this.authService.getSession(),
        sharedUsers: this.sharedUsers,
      }
    );
    if (response.status == 'success') {
      this.dialogRef.close();
      this.todolistService.fetchTodoLists();
      this.todolistService.fetchSharedTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
    return '';
  }

  addNewSharedUser() {
    const username = this.addSharedUserForm.get('username')?.value;

    if (username && username != '') {
      if (!this.sharedUsers.includes(username)) {
        this.sharedUsers.push(username);
      } else {
        this.snackBar.open(
          'You already shared this todolist with a user that has this username!',
          'Close',
          {
            duration: 2000,
          }
        );
      }
    } else {
      this.snackBar.open(
        'Please enter a username!',
        'Close',
        {
          duration: 2000,
        }
      );
    }
  }

  removeSharedUser(sharedUser: string) {
    this.sharedUsers = this.sharedUsers.filter((username) => username != sharedUser);
  }
}
