import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { TodoListsService } from './services/todo-lists/todo-lists.service';
import { MfaService } from './services/mfa/mfa.service';
import { model } from 'mongoose';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private todoListsService: TodoListsService,
    private mfaService: MfaService,
  ) {}

  createAPIResponse(data: any) {
    return JSON.stringify({
      status: 'success',
      data,
    });
  }

  createAPIResponseWithCustomStatus(status: string, data: any) {
    return JSON.stringify({
      status,
      data,
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

    console.log(
      `Someone tries to log into a user with the username '${username}'`,
    );

    const user = await this.userService.getUserByUsername(username);
    if (user) {
      if (user.password == this.authService.hashPassword(password)) {
        const session = this.authService.createSession(user);

        if (user.mfa.mail.enabled && !user.mfa.app.enabled) {
          const code = this.mfaService.generateMFACode(user);
          this.mfaService.sendMFACode(user, code);
          return this.createAPIResponseWithCustomStatus('mfa', {
            method: 'mail',
            useruid: user.uuid,
          });
        } else if (user.mfa.app.enabled && !user.mfa.mail.enabled) {
          return this.createAPIResponseWithCustomStatus('mfa', {
            method: 'app',
            useruid: user.uuid,
          });
        }

        if (user.mfa.mail.enabled && user.mfa.app.enabled) {
          return this.createAPIResponseWithCustomStatus('mfa', {
            useruid: user.uuid,
          });
        }
        console.log('Login success!');
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

  @Post('api/account/mfa/mail/:mode')
  async MailMFA(
    @Body() body: any,
    @Param('mode') mode: string,
  ): Promise<string> {
    if (mode == 'send') {
      const useruid = body.useruid;
      const user = await this.userService.getUserByUUID(useruid);

      this.mfaService.sendMFACode(
        user.toObject(),
        this.mfaService.generateMFACode(user.toObject()),
      );
    } else if (mode == 'setup') {
      const session = body.session;
      const emailAddress = body.mailAddress;
      const enabled = body.enabled;

      const user = await this.userService.getUserBySessionToken(session);
      if (user) {
        if (emailAddress != '') {
          try {
            await this.userService.changeMailMFA(
              user,
              enabled,
              emailAddress ? emailAddress : user.email,
            );
            return this.createAPIResponse(undefined);
          } catch (err) {
            return this.createAPIError(err.message);
          }
        } else {
          return this.createAPIError('The Email cannot be empty!');
        }
      } else {
        return this.createAPIError('This session is not valid!');
      }
    } else if (mode == 'verify') {
      const code = body.code;
      try {
        const user = this.mfaService.getUserFromCode(code);
        return this.createAPIResponse({
          session: this.authService.createSession(user),
        });
      } catch (err) {
        return this.createAPIError(err.message);
      }
    }
  }

  @Post('api/account/mfa/app/:mode')
  async AppMFA(
    @Body() body: any,
    @Param('mode') mode: string,
  ): Promise<string> {
    if (mode == 'setup') {
      const enabled = body.enabled;
      const session = body.session;
      const user = await this.userService.getUserBySessionToken(session);
      if (user) {
        try {
          user.mfa.app.enabled = enabled;
          if (enabled) {
            return this.createAPIResponse(this.mfaService.generateSecret(user));
          } else {
            user.save();
            return this.createAPIResponse({});
          }
        } catch (err) {
          return this.createAPIError(err.message);
        }
      } else {
        return this.createAPIError('This session is not valid!');
      }
    } else if (mode == 'verify') {
      const useruid = body.useruid;
      const code = body.code;
      const session = body.session;
      if (useruid) {
        const user = await this.userService.getUserByUUID(useruid);
        if (user) {
          if (code) {
            try {
              if (this.mfaService.verifyCode(user.toObject(), code)) {
                if (session) {
                  return this.createAPIResponse({});
                } else {
                  return this.createAPIResponse({
                    session: this.authService.createSession(user),
                  });
                }
              } else {
                return this.createAPIError('This Code is not valid!');
              }
            } catch (err) {
              return this.createAPIError(err.message);
            }
          } else {
            return this.createAPIError('Please enter the code!');
          }
        } else {
          return this.createAPIError('This user does not exist!');
        }
      }
    } else {
      this.createAPIError('Wrong Request!');
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
}
