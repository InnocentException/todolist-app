import { Injectable } from '@angular/core';
import { TodoListProps, TodoProps } from '../../utils/types';
import { HttpService } from '../http/http.service';
import { AuthService } from '../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class TodolistService {
  todoListMode: string = 'owned';

  todoLists: TodoListProps[] = [];
  visualizedTodoLists: TodoListProps[] = [];
  visualizedTodos: TodoProps[] = [];

  selectedTodoList: number = 0;
  selectedTodo: number = 0;

  todoPageIndex: number = 0;
  readonly todoPageSize: number = 16;

  todoListPageIndex: number = 0;
  readonly todoListPageSize: number = 9;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
  }

  updateTodoLists() {
    const todoListsStart = this.todoListPageIndex * this.todoListPageSize;
    const todoListsEnd = todoListsStart + this.todoListPageSize;
    this.visualizedTodoLists = [...this.todoLists].splice(
      todoListsStart,
      todoListsEnd
    );

    const todosStart = this.todoPageIndex * this.todoPageSize;
    const todosEnd = todosStart + this.todoPageSize;
    this.visualizedTodos = [
      ...this.todoLists[this.selectedTodoList].todos,
    ].splice(todosStart, todosEnd);
  }

  updateSharedTodoLists() {
    const sharedTodoListsStart =
      this.sharedTodoListPageIndex * this.todoListPageSize;
    const sharedTodoListsEnd = sharedTodoListsStart + this.todoListPageSize;
    this.sharedVisualizedTodoLists = [...this.sharedTodoLists].splice(
      sharedTodoListsStart,
      sharedTodoListsEnd
    );

    const sharedTodosStart = this.sharedTodoPageIndex * this.todoPageSize;
    const sharedTodosEnd = sharedTodosStart + this.todoPageSize;
    this.sharedVisualizedTodos = [
      ...this.sharedTodoLists[this.sharedSelectedTodoList].todos,
    ].splice(sharedTodosStart, sharedTodosEnd);
  }

  async fetchTodoLists() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/todolists/owned',
      {
        session: this.authService.getSession(),
      }
    );

    if (response.status == 'success') {
      this.todoLists = response.data.todoLists;
      this.updateTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  async fetchSharedTodoLists() {
    const response = await this.httpService.post(
      'http://localhost:3100/api/todolists/shared',
      {
        session: this.authService.getSession(),
      }
    );

    if (response.status == 'success') {
      this.sharedTodoLists = response.data.todoLists;
      this.updateSharedTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  async checkTodo(todouid: string, state: boolean) {
    const response = await this.httpService.post(
      `http://localhost:3100/api/todolist/${
        this.todoListMode == 'owned'
          ? this.todoLists[this.selectedTodoList].uuid
          : this.sharedTodoLists[this.sharedSelectedTodoList].uuid
      }/todos/${todouid}/change`,
      {
        session: this.authService.getSession(),
        done: state,
      }
    );
    if (response.status == 'success') {
      this.fetchTodoLists();
      this.fetchSharedTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  async deleteTodo(listuid: string, todouid: string) {
    const response = await this.httpService.post(
      `http://localhost:3100/api/todolist/${listuid}/todos/${todouid}/remove`,
      {
        session: this.authService.getSession(),
      }
    );

    if (response.status == 'success') {
      this.fetchTodoLists();
      this.fetchSharedTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  async deleteTodoList(listuid: string) {
    const response = await this.httpService.post(
      `http://localhost:3100/api/todolist/${listuid}/remove`,
      {
        session: this.authService.getSession(),
      }
    );

    if (response.status == 'success') {
      this.fetchTodoLists();
      this.fetchSharedTodoLists();
    } else {
      this.snackBar.open(response.description, 'Close', {
        duration: 2000,
      });
    }
  }

  setSelectedTodoList(index: number) {
    this.selectedTodoList = this.getSelectedTodoList(index);
    this.setSelectedTodo(0);
    this.todoPageIndex = 0;
    this.todoListMode = 'owned';
    this.updateTodoLists();
  }

  getSelectedTodoList(index: number) {
    return this.todoListPageIndex * this.todoListPageSize + index;
  }

  setSelectedTodo(index: number) {
    this.selectedTodo = this.getSelectedTodo(index);
    this.updateTodoLists();
  }

  getSelectedTodo(index: number) {
    return this.todoPageIndex * this.todoPageSize + index;
  }

  sharedTodoLists: TodoListProps[] = [];
  sharedVisualizedTodoLists: TodoListProps[] = [];
  sharedVisualizedTodos: TodoProps[] = [];

  sharedSelectedTodoList: number = 0;
  sharedSelectedTodo: number = 0;

  sharedTodoPageIndex: number = 0;
  sharedTodoListPageIndex: number = 0;

  setSharedSelectedTodoList(index: number) {
    this.sharedSelectedTodoList = this.getSharedSelectedTodo(index);
    this.setSharedSelectedTodo(0);
    this.sharedTodoPageIndex = 0;
    this.todoListMode = 'shared';
    this.updateTodoLists();
  }

  getSharedSelectedTodoList(index: number) {
    return this.todoListPageIndex * this.todoListPageSize + index;
  }

  setSharedSelectedTodo(index: number) {
    this.sharedSelectedTodo = this.getSharedSelectedTodo(index);
    this.updateSharedTodoLists();
  }

  getSharedSelectedTodo(index: number) {
    return this.sharedTodoPageIndex * this.todoPageSize + index;
  }
}
