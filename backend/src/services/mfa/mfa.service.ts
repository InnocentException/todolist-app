import { Injectable } from '@nestjs/common';
import { UserProps } from 'src/utils/types';
import { MailService } from '../mail/mail.service';
import * as speakeasy from 'speakeasy';
import { Document, Types } from 'mongoose';
import { MailMFACodeNotValidError } from 'src/utils/errors';

@Injectable()
export class MfaService {
  private mfaCodes: Map<String, { user: UserProps; expires: Date }>;

  constructor(private mailService: MailService) {
    this.mfaCodes = new Map();
  }

  generateMFACode(user: UserProps) {
    let code = '';
    const minCeiled = Math.ceil(0);
    const maxFloored = Math.floor(9);
    for (let i = 0; i < 6; i++)
      code += String(
        Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled),
      );
    this.mfaCodes.set(code, {
      user,
      expires: new Date(Date.now() + 5 * 60 * 1000),
    });
    return code;
  }

  getUserFromCode(code: string) {
    const data = this.mfaCodes.get(code);
    if (data) {
      this.mfaCodes.delete(code);
      if (data.expires.getTime() > new Date().getTime()) {
        return data.user;
      } else {
        throw new MailMFACodeNotValidError('This code is not valid!');
      }
    } else {
      throw new MailMFACodeNotValidError('This code is not valid!');
    }
  }

  sendMFACode(user: UserProps, code: string) {
    this.mailService.sendEmail(
      user.mfa.mail.mailAddress,
      'Mail MFA',
      `<p>Hey ${user.firstname} ${user.lastname}</p>` +
        `<p>Here is your MFA Code: ${code}</p>`,
    );
    +`<p>If you didn't try to login, you can ignore and delete this email!</p>`;
  }

  generateSecret(
    user: Document<unknown, {}, UserProps> &
      UserProps & {
        _id: Types.ObjectId;
      },
  ) {
    const secret = speakeasy.generateSecret({
      length: 10,
      name: user.username,
      issuer: 'Todolist App',
    });

    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.username,
      issuer: 'Todolist App',
      encoding: 'base32',
    });

    user.mfa.app.secret = secret.base32;
    user.save();

    return {
      secret: secret.base32,
      tfaURL: url,
    };
  }

  verifyCode(user: UserProps, code: string): boolean {
    return speakeasy.totp.verify({
      secret: user.mfa.app.secret,
      encoding: 'base32',
      token: code,
    });
  }
}
