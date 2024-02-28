import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { TodoListNotFoundError, TodoListRemovalError, TodoNotFoundError } from 'src/utils/errors';
import { v4 as uuidv4 } from 'uuid';
import { TodoListProps, TodoProps, UserProps } from 'src/utils/types';

@Injectable()
export class TodoListsService {
  private logger: Logger;
  constructor(
    @InjectModel('TodoList')
    private todoListModel: Model<TodoListProps>,
  ) {
    this.logger = new Logger(TodoListsService.name);
  }

  async getTodoListsByUser(useruid: string): Promise<
    (Document<unknown, {}, TodoListProps> &
      TodoListProps & {
        _id: Types.ObjectId;
      })[]
  > {
    const foundTodoLists = await this.todoListModel.find({ useruid });
    return foundTodoLists;
  }

  async getSharedTodolistsByUseruid(useruid: string) {
    const foundTodoLists = await this.todoListModel.find({
      sharedUsers: { $elemMatch: { $eq: useruid } },
    });
    return foundTodoLists;
  }

  async getTodoListByUUID(uuid: string) {
    const foundTodoList = (await this.todoListModel.find({ uuid }))[0];
    return foundTodoList;
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

  async addTodoList(
    user: UserProps,
    title: string,
    description: string,
    deadline: string,
  ) {
    try {
      const todos = [
        // This is required, becaus the Mongoose Module needs at least one Todo to store the Todolist
        {
          uuid: uuidv4(),
          text: 'First Todo',
          done: false,
        },
      ];
      let uuid = uuidv4();
      while (await this.getTodoListByUUID(uuid)) uuid = uuidv4();

      const todoList: TodoListProps = {
        uuid,
        useruid: user.uuid,
        title,
        description,
        deadline,
        todos,
        sharedUsers: [],
      };

      const newTodoList = new this.todoListModel(todoList);
      newTodoList.save();
      this.logger.log(
        `Successfully created todolist for user '${user.username}' with uuid '${uuid}'`,
      );
    } catch (err) {
      this.logger.error(`Failed to create Todolist: ${err.message}`);
    }
  }

  async removeTodoList(listuid: string) {
    await this.todoListModel.findOneAndDelete({ uuid: listuid }).exec();
  }

  async addTodoToList(listuid: string, text: string) {
    let uuid = uuidv4();
    while (await this.getTodoByUUID(uuid)) uuid = uuidv4();

    const foundTodoList = (await this.todoListModel.find({ uuid: listuid }))[0];
    if (foundTodoList) {
      foundTodoList.todos.push({
        uuid,
        text,
        done: false,
      });
      this.logger.log(`Added todo to todolist with uuid '${listuid}'`);
      foundTodoList.save();
    } else {
      const msg = 'This todolist does not exist';
      this.logger.log(
        `Failed to add todo to todolist with uuid '${listuid}': ${msg}`,
      );
      throw new TodoListNotFoundError(msg);
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

      if (todoIndex != -1) {
        if (text != undefined) foundTodoList.todos[todoIndex].text = text;
        if (done != undefined) foundTodoList.todos[todoIndex].done = done;
        foundTodoList.save();
      } else {
        const errormsg = "This todo does not exist";
        this.logger.log(
          `Failed to change todo from todolist with uuid '${listuid}': ${errormsg}`,
        );  
        throw new TodoNotFoundError(errormsg);
      }
    } else {
      const errormsg = 'This todo list does not exist';
      this.logger.log(
        `Failed to change todo from todolist with uuid '${listuid}': ${errormsg}`,
      );
      throw new TodoListNotFoundError(errormsg);
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

  async userOwnsTodoList(listuid: string, useruid: string): Promise<boolean> {
    const foundTodoList = await this.todoListModel.find({
      uuid: listuid,
      useruid,
    });
    return foundTodoList.length != 0;
  }

  async userCanAccessTodoList(
    listuid: string,
    useruid: string,
  ): Promise<boolean> {
    const foundTodoList = await this.todoListModel.find({
      uuid: listuid,
      sharedUsers: { $elemMatch: { $eq: useruid } },
    });
    return foundTodoList.length != 0;
  }
}
