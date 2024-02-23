import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, StringSchemaDefinition, Types } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import {
  PasswordResetTokenNotValid,
  UserNotFoundError,
} from 'src/utils/errors';
import { Session } from 'src/schemas/session.schema';

export interface UserProps {
  uuid: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phonenumber;
  password: string;
}

@Injectable()
export class UserService {
  private resetPasswordTokens: Map<String, String>;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
    private authService: AuthService,
    private mailService: MailService,
  ) {
    this.resetPasswordTokens = new Map<String, String>();
  }

  convertModel(
    model: Document<unknown, {}, User> &
      User & {
        _id: Types.ObjectId;
      },
  ): UserProps {
    return {
      uuid: model.uuid,
      firstname: model.firstname,
      lastname: model.lastname,
      username: model.username,
      email: model.email,
      phonenumber: model.phonenumber,
      password: model.password,
    };
  }

  async addUser(
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    phonenumber: string,
    password: string,
  ) {
    let uuid = uuidv4();
    while (await this.getUserByUUID(uuid)) uuid = uuidv4();

    const newUser = new this.userModel({
      uuid,
      firstname,
      lastname,
      username,
      email,
      phonenumber,
      password,
    });
    newUser.save();
  }

  removeUser(uuid: string) {}

  async getUserByUsername(username: string): Promise<UserProps> {
    const foundUser = (await this.userModel.find({ username }))[0];
    if (foundUser) {
      return this.convertModel(foundUser);
    } else {
      return null;
    }
  }

  async getUserByUUID(uuid: string): Promise<UserProps> {
    const foundUser = (await this.userModel.find({ uuid: uuid }))[0];
    if (foundUser) {
      return this.convertModel(foundUser);
    } else {
      return null;
    }
  }

  async handleResetPasswordRequest(user: UserProps) {
    const token = this.authService.generateTokenBytes();
    this.resetPasswordTokens.set(token, user.uuid);
    await this.mailService.sendEmail(
      user.email,
      'Password Reset',
      `<p>Hey ${user.firstname} ${user.lastname},</p>` +
        '<p>Someone requested to reset the password of your account!</p>' +
        '<p>To reset your password klick the Linkt below:</p>' +
        `<p><a href="http://localhost:4200/reset_password/${token}">Reset Password</a></p>` +
        '' +
        '<p>If you didnt send this request to reset the password of your Account you can ignore this email.</p>' +
        '' +
        `<a href="http://localhost:4200/reset_password/${token}">http://localhost:4200/reset_password/${token}</a>`,
    );
  }

  async resetPassword(token: string, password: string) {
    const useruid = this.resetPasswordTokens.get(token);
    if (useruid) {
      const user = (await this.userModel.find({ uuid: useruid }))[0];
      user.password = this.authService.hashPassword(password);
      user.save();
      this.resetPasswordTokens.delete(token);
    } else {
      throw new PasswordResetTokenNotValid('This Token is not valid!');
    }
  }

  async getUserBySessionToken(token: string): Promise<UserProps> {
    const foundSession = (await this.sessionModel.find({ token }))[0];
    if (foundSession) {
      const foundUser = (
        await this.userModel.find({ uuid: foundSession.useruid })
      )[0];
      return this.convertModel(foundUser);
    } else {
      return null;
    }
  }

  async changeUser(
    user: UserProps,
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    phonenumber: string,
  ) {
    const foundUser = (await this.userModel.find({ uuid: user.uuid }))[0];
    if (foundUser) {
      if (firstname != '') foundUser.firstname = firstname;
      if (lastname != '') foundUser.lastname = lastname;
      if (username != '') foundUser.username = username;
      if (email != '') foundUser.email = email;
      if (phonenumber != '') foundUser.phonenumber = phonenumber;
      foundUser.save();
    } else {
      throw new UserNotFoundError('This user could not be found!');
    }
  }

  async changeUserPassword(user: UserProps, password: string) {
    const foundUser = (await this.userModel.find({ uuid: user.uuid }))[0];
    if (foundUser) {
      foundUser.password = this.authService.hashPassword(password);
      foundUser.save();
    }
  }
}
