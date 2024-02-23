import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MatListModule } from '@angular/material/list';
import { HttpService } from '../../services/http/http.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
} from '@angular/material/dialog';
import { AddTodoListDialogComponent } from '../add-todo-list-dialog/add-todo-list-dialog.component';
import { CommonModule } from '@angular/common';
import { MatDivider, MatDividerModule } from '@angular/material/divider';
import { AddTodoDialogComponent } from '../add-todo-dialog/add-todo-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface TodoProps {
  uuid: string;
  text: string;
  done: boolean;
}

export interface TodoListProps {
  uuid: string;
  title: string;
  description: string;
  todos: TodoProps[]
}

@Component({
  selector: 'app-todo-lists',
  standalone: true,
  imports: [
    MatListModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatDividerModule,
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
  ],
  templateUrl: './todo-lists.component.html',
  styleUrl: './todo-lists.component.scss',
})
export class TodoListsComponent {
  todoLists: TodoListProps[];
  selectedTodoList: number;

  async fetchTodoLists() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/todolists',
      {
        session: this.authService.getSession(),
      }
    );

    if (response.status == 'success') {
      this.todoLists = response.data.todoLists;
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
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.todoLists = [];
    this.selectedTodoList = 0;
    this.fetchTodoLists();
  }

  showAddTodoListDialog() {
    const dialogRef = this.dialog.open(AddTodoListDialogComponent, {
      width: '40%',
      height: '40%',
      exitAnimationDuration: 500,
      enterAnimationDuration: 500,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result == 'success') {
        this.fetchTodoLists();
      }
    });
  }

  showAddTodoDialog() {
    if (this.todoLists[this.selectedTodoList]) {
      const dialogRef = this.dialog.open(AddTodoDialogComponent, {
        width: '30%',
        height: '30%',
        exitAnimationDuration: 500,
        enterAnimationDuration: 500,
        data: {
          selectedTodoList: this.todoLists[this.selectedTodoList],
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result == 'success') {
          this.fetchTodoLists();
        }
      });
    } else {
      this.snackBar.open('The selected todo list does not exist!', 'Close', {
        duration: 2000,
      });
    }
  }

  async checkTodo(todouid: string, state: boolean) {
    const response = await this.httpService.post(
      `http://localhost:3100/api/todolists/${
        this.todoLists[this.selectedTodoList].uuid
      }/todos/${todouid}/change`,
      {
        session: this.authService.getSession(),
        done: state,
      }
    );
    if (response.status == 'success') {
      this.fetchTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  async deleteTodo(todouid: string) {
    const response = await this.httpService.post(
      `http://localhost:3100/api/todolists/${
        this.todoLists[this.selectedTodoList].uuid
      }/todos/${todouid}/remove`,
      {
        session: this.authService.getSession(),
      }
    );

    if (response.status == 'success') {
      this.fetchTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  async deleteTodoList() {
    const response = await this.httpService.post(
      `http://localhost:3100/api/todolists/${
        this.todoLists[this.selectedTodoList].uuid
      }/remove`,
      {
        session: this.authService.getSession(),
      }
    );

    if (response.status == 'success') {
      this.fetchTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  logout() {
    this.authService.updateSession({
      token: '',
      expires: new Date(Date.now()),
    });
    this.router.navigate(['/login']);
  }

  showAccountSettings() {
    this.router.navigate(["/account"]);
  }
}
