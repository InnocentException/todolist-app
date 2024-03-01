import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { HttpService } from '../../../services/http/http.service';
import { AuthService } from '../../../services/auth/auth.service';
import { AddTodoListDialogComponent } from '../add-todo-list-dialog/add-todo-list-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TodoListProps } from '../../../utils/types';
import { TodolistService } from '../../../services/todolist/todolist.service';

@Component({
  selector: 'app-add-todo-dialog',
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
  templateUrl: './add-todo-dialog.component.html',
  styleUrl: './add-todo-dialog.component.scss',
})
export class AddTodoDialogComponent {
  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private todoListService: TodolistService,
    public dialogRef: MatDialogRef<AddTodoListDialogComponent>,
    private snackBar: MatSnackBar
  ) {}

  todoForm: FormGroup = new FormGroup({
    text: new FormControl(''),
  });

  get todoListTextInput() {
    return this.todoForm.get('text');
  }

  async submitTodo() {
    const response = await this.httpService.post(
      `api/todolist/${
        this.todoListService.todoListMode == 'owned'
          ? this.todoListService.todoLists[
              this.todoListService.selectedTodoList
            ].uuid
          : this.todoListService.sharedTodoLists[
              this.todoListService.sharedSelectedTodoList
            ].uuid
      }/todos/add`,
      {
        session: this.authService.getSession(),
        text: this.todoListTextInput?.value,
      }
    );

    if (response.status == "success") {
     this.dialogRef.close("success");
    } else {
      this.snackBar.open(response.description, "Close");
    }
  }
}
