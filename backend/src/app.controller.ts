import { Controller, Get, Post, Body, Param, Ip, Logger } from '@nestjs/common';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { TodoListsService } from './services/todo-lists/todo-lists.service';
import { MfaService } from './services/mfa/mfa.service';
import { model } from 'mongoose';

@Controller()
export class AppController {
  private logger: Logger;
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private todoListsService: TodoListsService,
    private mfaService: MfaService,
  ) {
    this.logger = new Logger(AppController.name);
  }

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
  async login(@Body() body: any, @Ip() ip: string): Promise<string> {
    const username = body.username;
    const password = body.password;

    const user = await this.userService.getUserByUsername(username);
    if (user) {
      if (user.password == this.authService.hashPassword(password)) {
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

        const session = this.authService.createSession(user);
        this.logger.log(`${ip} logged in successful!`);
        return this.createAPIResponse({
          session,
        });
      } else {
        this.logger.log(
          `${ip} The login request was blocked: the password is not correct!`,
        );
        return this.createAPIError('The password is not correct!');
      }
    } else {
      this.logger.log(
        `${ip} The login request was blocked: the user does not exist!`,
      );
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

    let errormsg = '';
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
          try {
            const newUser = await this.userService.addUser(
              firstname,
              lastname,
              username,
              email,
              phonenumber,
              this.authService.hashPassword(password),
            );
            this.logger.log(`Created new account with uuid '${newUser.uuid}'`);
            return this.createAPIResponse({});
          } catch (err) {
            errormsg = err.message;
          }
        } else {
          errormsg = 'This user does already exist!';
        }
      } else {
        errormsg = 'The Passwords are not the same!';
      }
    } else {
      errormsg = 'You have to fill out all Fields!';
    }
    this.logger.error(`Unable to create new user: ${errormsg}`);
    return this.createAPIError(errormsg);
  }

  @Post('api/reset_password')
  async resetPassword(@Body() body: any): Promise<string> {
    const token = body.token;
    const username = body.username;
    const password = body.password;
    const repeatPassword = body.repeatPassword;

    let errormsg = '';
    if (token) {
      if (repeatPassword == password) {
        try {
          await this.userService.resetPassword(token, password);
          return this.createAPIResponse({});
        } catch (err) {
          errormsg = err.message;
        }
      } else {
        errormsg = 'The passwords are not the same!';
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

  @Get('api/account/:useruid')
  async getUserByUUID(
    @Body() body: any,
    @Param('useruid') useruid: string,
  ): Promise<string> {
    const session = body.session;

    const user = await this.userService.getUserByUUID(useruid);
    if (user) {
      return this.createAPIResponse({
        uuid: user.uuid,
        username: user.username,
      });
    } else {
      return this.createAPIError('This session is not valid!');
    }
  }

  @Post('api/account/:action')
  async changeUser(
    @Body() body: any,
    @Param('action') action: string,
  ): Promise<string> {
    let errormsg = '';
    const session = body.session;
    const user = await this.userService.getUserBySessionToken(session);
    if (user) {
      if (action == 'change') {
        const firstname = body.firstname;
        const lastname = body.lastname;
        const username = body.username;
        const email = body.email;
        const phonenumber = body.phonenumber;
        const profile_picture = body.profile_picture;
        try {
          await this.userService.changeUser(
            user,
            firstname,
            lastname,
            username,
            email,
            phonenumber,
            profile_picture,
          );
          this.logger.log(`Changed user with uuid '${user.uuid}'`);
          return this.createAPIResponse({});
        } catch (err) {
          errormsg = err.message;
        }
      } else if (action == 'delete') {
        try {
          this.logger.log(`Deleted user with uuid '${user.uuid}'`);
          await this.userService.removeUser(user);
          return this.createAPIResponse({});
        } catch (err) {
          errormsg = err.message;
        }
      }
    } else {
      errormsg = 'This session is not valid!';
    }
    this.logger.error(`Unable to ${action} user with uuid '${user.uuid}'`);
    return this.createAPIError(errormsg);
  }

  @Post('api/account/mfa/mail/:mode')
  async MailMFA(
    @Body() body: any,
    @Param('mode') mode: string,
    @Ip() ip: string,
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
            return this.createAPIResponse({});
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
        this.logger.log(`${ip} logged in successful!`);
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
    @Ip() ip: string,
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
                  this.logger.log(`${ip} logged in successful!`);

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

  @Post('api/todolists/:type')
  async getTodoListsByType(
    @Body() body: any,
    @Param('type') type: string,
  ): Promise<string> {
    const session = body.session;
    const user = await this.userService.getUserBySessionToken(session);
    if (user) {
      if (type == 'owned') {
        return this.createAPIResponse({
          todoLists: await this.todoListsService.getTodoListsByUser(user.uuid),
        });
      } else if (type == 'shared') {
        return this.createAPIResponse({
          todoLists: await this.todoListsService.getSharedTodolistsByUseruid(
            user.uuid,
          ),
        });
      } else if (type == 'add') {
        const title = body.title;
        const description = body.description;
        const deadline = body.deadline;

        if (title != '' && description != '') {
          if (user) {
            await this.todoListsService.addTodoList(
              user.toObject(),
              title,
              description,
              deadline,
            );
            return this.createAPIResponse({});
          } else {
            return this.createAPIError('This session is not valid!');
          }
        } else {
          return this.createAPIError('Please fill out all Fields!');
        }
      } else {
        return this.createAPIError('Wrong request');
      }
    }
    return this.createAPIError('This session is not valid!');
  }

  @Post('api/todolist/:listuid/:action?')
  async handleTodoLists(
    @Body() body: any,
    @Param('listuid') listuid: string,
    @Param('action') action?: string,
  ): Promise<string> {
    const session = body.session;

    let errormsg = '';
    if (action == 'share') {
      const sharedUsers = body.sharedUsers;
      try {
        const user = await this.userService.getUserBySessionToken(session);
        if (user) {
          if (this.todoListsService.userOwnsTodoList(listuid, user.uuid)) {
            const todoList =
              await this.todoListsService.getTodoListByUUID(listuid);
            todoList.sharedUsers = [];
            for (const username of sharedUsers) {
              const sharedUser =
                await this.userService.getUserByUsername(username);
              if (username != user.username) {
                if (sharedUser) {
                  todoList.sharedUsers.push(sharedUser.uuid);
                } else {
                  errormsg = `The user with the username '${username}' does not exist`;
                  break;
                }
              } else {
                errormsg = 'You cannot share your todolist with yourself';
                break;
              }
            }
            if (errormsg == '') {
              todoList.save();
              this.logger.log(
                `Shared todolist with uuid '${listuid}' with users ${JSON.stringify(sharedUsers)}`,
              );
              return this.createAPIResponse({});
            }
          } else {
            errormsg =
              'You do not have the permission to change the todo of this todolist';
          }
        } else {
          errormsg = 'This session is invalid';
        }
      } catch (err) {
        errormsg = err.message;
      }
      this.logger.error(
        `Unable to share todolist with uuid '${listuid}': ${errormsg}`,
      );
      return this.createAPIError(errormsg);
    } else if (action == 'remove') {
      let errormsg = '';
      const user = await this.userService.getUserBySessionToken(session);
      if (user) {
        if (
          this.todoListsService.userOwnsTodoList(listuid, user.uuid) ||
          this.todoListsService.userCanAccessTodoList(listuid, user.uuid)
        ) {
          try {
            await this.todoListsService.removeTodoList(listuid);
            this.logger.log(`Removed todolist with uuid ${listuid}`);
            return this.createAPIResponse({});
          } catch (err) {
            errormsg = err.message;
          }
        } else {
          return this.createAPIResponse(
            'You do not have the permission to change the todo of this todolist',
          );
        }
      } else {
        errormsg = 'This session is not valid';
      }
      this.logger.error(
        `Unable to remove todolist with uuid '${listuid}': ${errormsg}`,
      );
      return this.createAPIError(errormsg);
    }
  }

  // Remove and Change a Todo from a Todolist
  @Post('api/todolist/:listuid/todos/:todouid/:action?')
  async handleTodo(
    @Body() body: any,
    @Param('listuid') listuid: string,
    @Param('todouid') todouid: string,
    @Param('action') action?: string,
  ): Promise<string> {
    const session = body.session;

    if (todouid == 'add') {
      const text = body.text;

      const user = await this.userService.getUserBySessionToken(session);
      if (text != '') {
        if (user) {
          if (
            this.todoListsService.userOwnsTodoList(listuid, user.uuid) ||
            this.todoListsService.userCanAccessTodoList(listuid, user.uuid)
          ) {
            try {
              await this.todoListsService.addTodoToList(listuid, text);
              return this.createAPIResponse({});
            } catch (err) {
              return this.createAPIError(err.message);
            }
          } else {
            return this.createAPIResponse(
              'You do not have the permission to change the todo of this todolist',
            );
          }
        } else {
          return this.createAPIError('This session is not valid!');
        }
      } else {
        return this.createAPIError('Please fill out all Fields!');
      }
    } else if (action == 'change') {
      // Change the Todo
      const text = body.text; // New Text of the Todo
      const done = body.done; // New State of the Todo

      const user = await this.userService.getUserBySessionToken(session);
      if (text != '') {
        // If Text isn't empty
        if (user) {
          // If the user does exist
          if (
            this.todoListsService.userOwnsTodoList(listuid, user.uuid) ||
            this.todoListsService.userCanAccessTodoList(listuid, user.uuid)
          ) {
            try {
              this.todoListsService.changeTodo(listuid, todouid, text, done);
              return this.createAPIResponse({});
            } catch (err) {
              return this.createAPIError(err.message);
            }
          } else {
            return this.createAPIResponse(
              'You do not have the permission to change the todo of this todolist',
            );
          }
        } else {
          return this.createAPIError('This session is not valid');
        }
      } else {
        return this.createAPIError('Please fill out all Fields');
      }
    } else if (action == 'remove') {
      // Removing Todo
      const user = await this.userService.getUserBySessionToken(session);
      if (user) {
        if (
          this.todoListsService.userOwnsTodoList(listuid, user.uuid) ||
          this.todoListsService.userCanAccessTodoList(listuid, user.uuid)
        ) {
          try {
            this.todoListsService.removeTodo(listuid, todouid);
            return this.createAPIResponse({});
          } catch (err) {
            return this.createAPIError(err.message);
          }
        } else {
          return this.createAPIResponse(
            'You do not have the permission to change the todo of this todolist',
          );
        }
      } else {
        return this.createAPIError('This session is not valid!');
      }
    }
    return this.createAPIError('Wrong Request');
  }
}
