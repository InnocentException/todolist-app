import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, StringSchemaDefinition, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';
import { MailService } from '../mail/mail.service';
import {
  PasswordResetTokenNotValid,
  UserNotFoundError,
} from 'src/utils/errors';
import { Session } from 'src/schemas/session.schema';
import { UserProps } from 'src/utils/types';

@Injectable()
export class UserService {
  private resetPasswordTokens: Map<String, { useruid: string; expires: Date }>;
  constructor(
    @InjectModel('User')
    private userModel: Model<UserProps>,
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
    private authService: AuthService,
    private mailService: MailService,
  ) {
    this.resetPasswordTokens = new Map();
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
      mfa: {
        mail: {
          enabled: false,
        },
        app: {
          enabled: false,
        },
      },
    });
    newUser.save();
  }

  removeUser(uuid: string) {}

  async handleResetPasswordRequest(
    user: Document<unknown, {}, UserProps> &
      UserProps & {
        _id: Types.ObjectId;
      },
  ) {
    const token = this.authService.generateTokenBytes();
    this.resetPasswordTokens.set(token, {
      useruid: user.uuid,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });
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
    const data = this.resetPasswordTokens.get(token);
    if (data) {
      if (data.expires.getTime() > new Date(Date.now()).getTime()) {
        const user = (await this.userModel.find({ uuid: data.useruid }))[0];
        user.password = this.authService.hashPassword(password);
        user.save();
        this.resetPasswordTokens.delete(token);
      } else {
        this.resetPasswordTokens.delete(token);
        throw new PasswordResetTokenNotValid('This Token is not valid!');
      }
      this.resetPasswordTokens.delete(token);
    } else {
      throw new PasswordResetTokenNotValid('This Token is not valid!');
    }
  }

  async changeUser(
    user: Document<unknown, {}, UserProps> &
      UserProps & {
        _id: Types.ObjectId;
      },
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    phonenumber: string,
  ) {
    if (user) {
      if (firstname != '') user.firstname = firstname;
      if (lastname != '') user.lastname = lastname;
      if (username != '') user.username = username;
      if (email != '') user.email = email;
      if (phonenumber != '') user.phonenumber = phonenumber;
      user.save();
    } else {
      throw new UserNotFoundError('This user could not be found!');
    }
  }

  async changeUserPassword(
    user: Document<unknown, {}, UserProps> &
      UserProps & {
        _id: Types.ObjectId;
      },
    password: string,
  ) {
    if (user) {
      user.password = this.authService.hashPassword(password);
      user.save();
    }
  }

  async getUserBySessionToken(token: string): Promise<
    Document<unknown, {}, UserProps> &
      UserProps & {
        _id: Types.ObjectId;
      }
  > {
    const foundSession = (await this.sessionModel.find({ token }))[0];
    if (foundSession) {
      const foundUser = (
        await this.userModel.find({ uuid: foundSession.useruid })
      )[0];
      return foundUser;
    } else {
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<
    Document<unknown, {}, UserProps> &
      UserProps & {
        _id: Types.ObjectId;
      }
  > {
    const foundUser = (await this.userModel.find({ username }))[0];
    if (foundUser) {
      return foundUser;
    } else {
      return null;
    }
  }

  async getUserByUUID(uuid: string): Promise<
    Document<unknown, {}, UserProps> &
      UserProps & {
        _id: Types.ObjectId;
      }
  > {
    const foundUser = (await this.userModel.find({ uuid: uuid }))[0];
    if (foundUser) {
      return foundUser;
    } else {
      return null;
    }
  }

  async changeMailMFA(
    user: Document<unknown, {}, UserProps> &
      UserProps & {
        _id: Types.ObjectId;
      },
    enabled: boolean,
    mail: string,
  ) {
    console.log(
      `Changing Mail MFA for user '${user.uuid}' to ${enabled ? 'enabled' : 'disabled'} with email '${mail}' ...`,
    );
    user.mfa.mail.enabled = enabled;
    user.mfa.mail.mailAddress = mail;
    user.save();
  }
}
