import { Injectable, OnModuleInit} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { Session } from 'src/schemas/session.schema';
import { User } from 'src/schemas/user.schema';
import { UserProps, UserService } from 'src/services/user/user.service';

export interface SessionProps {
  useruid: string;
  token: string;
  expires: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
  ) {
    this.cleanUpSessions();
  }

  hashPassword(password: string) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  generateTokenBytes() {
    return crypto.randomBytes(32).toString('hex');
  }

  createSession(user: UserProps): SessionProps {
    const timestamp = Date.now().toString();
    const randomBytes = this.generateTokenBytes();
    const userInformation = `${user.uuid}-${user.username}`;

    const token = crypto
      .createHash('sha256')
      .update(`${timestamp}-${randomBytes}-${userInformation}`)
      .digest('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const session = {
      useruid: user.uuid,
      token,
      expires,
    };
    const newSession = new this.sessionModel(session);
    newSession.save();
    return session;
  }

  async cleanUpSessions() {
    console.log("Cleaning Up Sessions ...");
    let cleanedSessions = 0;
    const sessions = await this.sessionModel.find({});
    for (const session of sessions) {
      if (new Date(session.expires).getTime() < new Date(Date.now()).getTime()) {
        session.deleteOne().exec();
        cleanedSessions++;
      }
    }
    console.log(`${cleanedSessions} sessions cleaned.`);
  }
}
