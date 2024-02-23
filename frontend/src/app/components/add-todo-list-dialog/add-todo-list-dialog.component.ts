import { Component, Inject } from '@angular/core';
import { HttpService } from '../../services/http/http.service';
import { AuthService } from '../../services/auth/auth.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-todo-list-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './add-todo-list-dialog.component.html',
  styleUrl: './add-todo-list-dialog.component.scss',
})


export class AddTodoListDialogComponent {
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    public dialogRef: MatDialogRef<AddTodoListDialogComponent>,
    private snackBar: MatSnackBar,
  ) {}

  todoListForm: FormGroup = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
  });

  get todoListTitleInput() {
    return this.todoListForm.get('title');
  }
  get todoListDescriptionInput() {
    return this.todoListForm.get('description');
  }

  async submitTodoList() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/todolists/add',
      {
        session: this.authService.getSession(),
        title: this.todoListTitleInput?.value,
        description: this.todoListDescriptionInput?.value,
      }
    );
    console.log(response);
    if (response.status == "error") {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    } else {
      this.dialogRef.close('success');
    }
  }
}
