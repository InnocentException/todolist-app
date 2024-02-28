import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { MatListModule } from '@angular/material/list';
import { HttpService } from '../../services/http/http.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { AddTodoListDialogComponent } from '../dialogs/add-todo-list-dialog/add-todo-list-dialog.component';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { AddTodoDialogComponent } from '../dialogs/add-todo-dialog/add-todo-dialog.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TodoListProps, TodoProps } from '../../utils/types';
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { TodolistService } from '../../services/todolist/todolist.service';
import { ConfigureShareTodolistDialogComponent } from '../dialogs/configure-share-todolist-dialog/configure-share-todolist-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatPaginatorModule,
    MatTooltipModule,
  ],
  templateUrl: './todo-lists.component.html',
  styleUrl: './todo-lists.component.scss',
})
export class TodoListsComponent {
  constructor(
    protected router: Router,
    protected authService: AuthService,
    protected todolistService: TodolistService,
    protected httpService: HttpService,
    protected snackBar: MatSnackBar,
    protected dialog: MatDialog
  ) {
    if (this.authService.hasSession()) {
      todolistService.fetchTodoLists();
      todolistService.fetchSharedTodoLists();
    }
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
        this.todolistService.fetchTodoLists();
        this.todolistService.fetchSharedTodoLists();
      }
    });
  }

  showAddTodoDialog() {
    if (this.todolistService.todoLists[this.todolistService.selectedTodoList]) {
      const dialogRef = this.dialog.open(AddTodoDialogComponent, {
        width: '30%',
        height: '30%',
        exitAnimationDuration: 500,
        enterAnimationDuration: 500,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result == 'success') {
          this.todolistService.fetchTodoLists();
          this.todolistService.fetchSharedTodoLists();
        }
      });
    } else {
      this.snackBar.open('The selected todo list does not exist!', 'Close', {
        duration: 2000,
      });
    }
  }

  logout() {
    this.authService.updateSession({
      token: '',
      expires: new Date(Date.now()),
    });
    document.location.reload();
  }

  showShareTodoListDialog(todoList: TodoListProps) {
    this.dialog.open(ConfigureShareTodolistDialogComponent, {
      exitAnimationDuration: 500,
      enterAnimationDuration: 500,
      data: {
        todoList,
      },
    });
  }

  showAccountSettings() {
    this.router.navigate(['/account']);
  }

  isDeadlineReached(deadline: string): boolean {
    if (deadline && deadline != '') {
      if (new Date(deadline).getTime() < new Date().getTime()) {
        return true;
      }
    }
    return false;
  }

  handleTodoPageEvent(e: PageEvent) {
    this.todolistService.todoPageIndex = e.pageIndex;
    this.todolistService.fetchTodoLists();
    this.todolistService.fetchSharedTodoLists();
  }

  handleTodoListPageEvent(e: PageEvent) {
    this.todolistService.todoListPageIndex = e.pageIndex;
    this.todolistService.fetchTodoLists();
    this.todolistService.fetchSharedTodoLists();
  }

  handleSharedTodoListPageEvent(e: PageEvent) {
    this.todolistService.sharedTodoPageIndex = e.pageIndex;
    this.todolistService.fetchSharedTodoLists();
  }

  handleSharedTodoPageEvent(e: PageEvent) {
    this.todolistService.sharedTodoPageIndex = e.pageIndex;
    this.todolistService.fetchSharedTodoLists();
  }

  onDeleteTodo() {
    const listuid =
      this.todolistService.todoListMode == 'owned'
        ? this.todolistService.todoLists[this.todolistService.selectedTodoList]
            .uuid
        : this.todolistService.sharedTodoLists[
            this.todolistService.sharedSelectedTodoList
          ].uuid;
    const todouid =
      this.todolistService.todoListMode == 'owned'
        ? this.todolistService.todoLists[this.todolistService.selectedTodoList]
            .todos[this.todolistService.selectedTodo].uuid
        : this.todolistService.sharedTodoLists[
            this.todolistService.sharedSelectedTodoList
          ].todos[this.todolistService.sharedSelectedTodo].uuid;
    this.todolistService.deleteTodo(listuid, todouid);
  }
}
