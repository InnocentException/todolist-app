import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { TodoListsService } from './services/todo-lists/todo-lists.service';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private todoListsService: TodoListsService,
  ) {}

  createAPIResponse(data: any) {
    return JSON.stringify({
      status: 'success',
      data: data,
    });
  }

  createAPIError(description: string) {
    return JSON.stringify({
      status: 'error',
      description,
    });
  }

  @Post('api/login')
  async login(@Body() body: any): Promise<string> {
    const username = body.username;
    const password = body.password;

    const user = await this.userService.getUserByUsername(username);
    if (user) {
      if (user.password == this.authService.hashPassword(password)) {
        const session = this.authService.createSession(user);
        return this.createAPIResponse({
          session,
        });
      } else {
        return this.createAPIError('The password is not correct!');
      }
    } else {
      return this.createAPIError('This user does not exist!');
    }
  }

  @Post('api/register')
  async register(@Body() body: any): Promise<string> {
    const firstname = body.firstname;
    const lastname = body.lastname;
    const username = body.username;
    const email = body.email;
    const phonenumber = body.phonenumber;
    const password = body.password;
    const repeatPassword = body.repeatPassword;

    if (
      firstname != '' &&
      lastname != '' &&
      username != '' &&
      email != '' &&
      phonenumber != '' &&
      password != ''
    ) {
      if (password == repeatPassword) {
        if (!(await this.userService.getUserByUsername(username))) {
          this.userService.addUser(
            firstname,
            lastname,
            username,
            email,
            phonenumber,
            this.authService.hashPassword(password),
          );
          return this.createAPIResponse(undefined);
        } else {
          return this.createAPIError('This User does already exist!');
        }
      } else {
        return this.createAPIError('The Passwords are not the same!');
      }
    } else {
      return this.createAPIError('You have to fill out all Fields!');
    }
  }

  @Post('api/account')
  async getUser(@Body() body: any): Promise<string> {
    const session = body.session;

    const user = await this.userService.getUserBySessionToken(session);
    if (user) {
      return this.createAPIResponse(user);
    } else {
      return this.createAPIError('This session is not valid!');
    }
  }

  @Post('api/account/change')
  async changeUser(@Body() body: any): Promise<string> {
    const firstname = body.firstname;
    const lastname = body.lastname;
    const username = body.username;
    const email = body.email;
    const phonenumber = body.phonenumber;
    const session = body.session;

    const user = await this.userService.getUserBySessionToken(session);
    if (user) {
      try {
        await this.userService.changeUser(
          user,
          firstname,
          lastname,
          username,
          email,
          phonenumber,
        );
        return this.createAPIResponse(undefined);
      } catch (err) {
        return this.createAPIError(err.message);
      }
    } else {
      return this.createAPIError('This session is not valid!');
    }
  }

  @Post('api/account/change_password')
  async changePassword(@Body() body: any): Promise<string> {
    const password = body.password;
    const newPassword = body.newPassword;
    const repeatNewPassword = body.repeatNewPassword;
    const session = body.session;

    if (password != '' && newPassword != '' && repeatNewPassword != '') {
      const user = await this.userService.getUserBySessionToken(session);
      if (user) {
        if (user.password == this.authService.hashPassword(password)) {
          if (newPassword == repeatNewPassword) {
            try {
              await this.userService.changeUserPassword(user, newPassword);
              return this.createAPIResponse(undefined);
            } catch (err) {
              return this.createAPIError(err.message);
            }
          } else {
            this.createAPIError('The new passwords are not the same!');
          }
        } else {
          return this.createAPIError('This password is not correct!');
        }
      } else {
        return this.createAPIError('This session is not valid!');
      }
    } else {
      return this.createAPIError('Please fill out all Fields!');
    }
  }

  @Post('api/todolists')
  async getTodos(@Body() body: any): Promise<string> {
    const session = body.session;
    const user = await this.userService.getUserBySessionToken(session);
    if (user) {
      return this.createAPIResponse({
        todoLists: await this.todoListsService.getTodoListsByUser(user.uuid),
      });
    }
    return this.createAPIError('This session is not valid!');
  }

  @Post('api/todolists/add')
  async addTodoList(@Body() body: any): Promise<string> {
    const session = body.session;
    const title = body.title;
    const description = body.description;

    const user = await this.userService.getUserBySessionToken(session);
    if (title != '' && description != '') {
      if (user) {
        await this.todoListsService.addTodoList({
          uuid: '',
          description,
          title,
          todos: [],
          useruid: user.uuid,
        });
        return this.createAPIResponse({});
      } else {
        return this.createAPIError('This session is not valid!');
      }
    } else {
      return this.createAPIError('Please fill out all Fields!');
    }
  }

  @Post('api/todolists/:uuid/todos/add')
  async addTodo(
    @Body() body: any,
    @Param('uuid') uuid: string,
  ): Promise<string> {
    const session = body.session;
    const text = body.text;

    const user = await this.userService.getUserBySessionToken(session);
    if (text != '') {
      if (user) {
        const result = await this.todoListsService.addTodoToList(uuid, text);
        if (result) {
          return this.createAPIResponse({});
        } else {
          return this.createAPIError('This Todo List does not exist anymore!');
        }
      } else {
        return this.createAPIError('This session is not valid!');
      }
    } else {
      return this.createAPIError('Please fill out all Fields!');
    }
  }

  @Post('api/todolists/:listuid/remove')
  async removeTodoList(
    @Body() body: any,
    @Param('listuid') listuid: string,
  ): Promise<string> {
    const session = body.session;
    const text = body.text;

    const user = await this.userService.getUserBySessionToken(session);
    if (text != '') {
      if (user) {
        const result = await this.todoListsService.removeTodoList(listuid);
        return this.createAPIResponse({});
      } else {
        return this.createAPIError('This session is not valid!');
      }
    } else {
      return this.createAPIError('Please fill out all Fields!');
    }
  }

  @Post('api/todolists/:listuid/todos/:todouid/change')
  async changeTodo(
    @Body() body: any,
    @Param('listuid') listuid: string,
    @Param('todouid') todouid: string,
  ): Promise<string> {
    const session = body.session;
    const text = body.text;
    const done = body.done;

    const user = await this.userService.getUserBySessionToken(session);
    if (text != '') {
      if (user) {
        try {
          this.todoListsService.changeTodo(listuid, todouid, text, done);
          return this.createAPIResponse({});
        } catch (err) {
          return this.createAPIError(err.message);
        }
      } else {
        return this.createAPIError('This session is not valid!');
      }
    } else {
      return this.createAPIError('Please fill out all Fields!');
    }
  }

  @Post('api/todolists/:listuid/todos/:todouid/remove')
  async removeTodo(
    @Body() body: any,
    @Param('listuid') listuid: string,
    @Param('todouid') todouid: string,
  ): Promise<string> {
    const session = body.session;
    const text = body.text;
    const done = body.done;

    const user = await this.userService.getUserBySessionToken(session);
    if (text != '') {
      if (user) {
        try {
          this.todoListsService.removeTodo(listuid, todouid);
          return this.createAPIResponse({});
        } catch (err) {
          return this.createAPIError(err.message);
        }
      } else {
        return this.createAPIError('This session is not valid!');
      }
    } else {
      return this.createAPIError('Please fill out all Fields!');
    }
  }

  @Post('api/reset_password')
  async resetPassword(@Body() body: any): Promise<string> {
    const token = body.token;
    const username = body.username;
    const password = body.password;
    const repeatPassword = body.repeatPassword;
    if (token) {
      if (repeatPassword == password) {
        try {
          await this.userService.resetPassword(token, password);
          return this.createAPIResponse({});
        } catch (err) {
          return this.createAPIError(err.message);
        }
      } else {
        return this.createAPIError('The passwords are not the same!');
      }
    } else {
      if (username) {
        const user = await this.userService.getUserByUsername(username);
        if (user) {
          try {
            await this.userService.handleResetPasswordRequest(user);
            return this.createAPIResponse({});
          } catch (err) {
            return this.createAPIError(err.message);
          }
        } else {
          return this.createAPIError('This user does not exist!');
        }
      }
    }
  }
}
