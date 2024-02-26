import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TodoListNotFoundError, TodoListRemovalError } from 'src/utils/errors';
import { createTodoListSchema } from 'src/schemas/todolists/todolist.schema';
import { ObjectId } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { TodoListProps, TodoProps } from 'src/utils/types';

@Injectable()
export class TodoListsService {
  constructor(
    @InjectModel('TodoList')
    private todoListModel: Model<TodoListProps>,
  ) {}

  async getTodoListsByUser(useruid: string): Promise<TodoListProps[]> {
    const foundTodoLists = await this.todoListModel.find({ useruid });
    const todoLists = foundTodoLists.map((todoList) => {
      return {
        uuid: todoList.uuid,
        useruid: todoList.useruid,
        title: todoList.title,
        description: todoList.description,
        todos: todoList.todos,
      };
    });
    return todoLists;
  }

  async getTodoListByUUID(uuid: string) {
    const foundTodoList = (await this.todoListModel.find({ uuid }))[0];
    return foundTodoList;
  }

  async addTodoList(todoList: TodoListProps) {
    todoList.uuid = uuidv4();
    while (await this.getTodoListByUUID(todoList.uuid))
      todoList.uuid = uuidv4();
    todoList.todos = [
      // This is required, becaus the Mongoose Module needs at least one Todo to store the Todolist
      {
        uuid: uuidv4(),
        text: 'First Todo',
        done: false,
      },
    ];
    const newTodoList = new this.todoListModel(todoList);
    newTodoList.save();
  }

  async getTodoByUUID(uuid: string): Promise<TodoProps> {
    const todoLists = await this.todoListModel.find({});
    for (const list of todoLists) {
      const todos = list.todos;
      for (const todo of todos) {
        if (todo.uuid == uuid) {
          return todo;
        }
      }
    }
    return null;
  }

  async removeTodoList(listuid: string) {
    await this.todoListModel.findOneAndDelete({ uuid: listuid }).exec();
  }

  async addTodoToList(listuid: string, text: string): Promise<boolean> {
    let uuid = uuidv4();
    while (await this.getTodoByUUID(uuid)) uuid = uuidv4();

    const foundTodoList = (await this.todoListModel.find({ uuid: listuid }))[0];
    if (foundTodoList) {
      foundTodoList.todos.push({
        uuid,
        text,
        done: false,
      });
      foundTodoList.save();
      return true;
    } else {
      return false;
    }
  }

  async changeTodo(
    listuid: string,
    todouid: string,
    text: string,
    done: boolean,
  ) {
    const foundTodoList = (await this.todoListModel.find({ uuid: listuid }))[0];
    if (foundTodoList) {
      let todoIndex = foundTodoList.todos.findIndex(
        (todo) => todo.uuid === todouid,
      );

      if (text != undefined) foundTodoList.todos[todoIndex].text = text;
      if (done != undefined) foundTodoList.todos[todoIndex].done = done;

      foundTodoList.save();
    } else {
      throw new TodoListNotFoundError('This todo list does not exist anymore!');
    }
  }

  async removeTodo(listuid: string, todouid: string) {
    const foundTodoList = (await this.todoListModel.find({ uuid: listuid }))[0];
    if (foundTodoList) {
      let todoIndex = foundTodoList.todos.findIndex(
        (todo) => todo.uuid === todouid,
      );

      foundTodoList.todos.splice(todoIndex, 1);

      foundTodoList.save();
    } else {
      throw new TodoListNotFoundError('This todo list does not exist anymore!');
    }
  }
}
