import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { Session } from 'src/schemas/session.schema';
import { SessionProps, UserProps } from 'src/utils/types';

@Injectable()
export class AuthService {
  private logger: Logger;

  constructor(
    @InjectModel(Session.name)
    private sessionModel: Model<Session>,
  ) {
    this.logger = new Logger(AuthService.name);
    this.cleanUpSessions();
  }

  hashPassword(password: string) {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  generateTokenBytes() {
    return crypto.randomBytes(32).toString('hex');
  }

  createSession(user: UserProps): SessionProps {
    try {
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
      this.logger.log(`Session successfully created for user '${user.username}' with uuid ${user.uuid}`);
      return session;
    } catch (err) {
      this.logger.error(
        `An error occoured while creating a new session: ${err.message}`,
      );
    }
  }

  async cleanUpSessions() {
    try {
      let cleanedSessions = 0;
      const sessions = await this.sessionModel.find({});
      for (const session of sessions) {
        if (
          new Date(session.expires).getTime() < new Date(Date.now()).getTime()
        ) {
          session.deleteOne().exec();
          cleanedSessions++;
        }
      }
      this.logger.log(
        `${cleanedSessions} expired sessions removed.`,
      );
    } catch (err) {
      this.logger.error(
        `An error occoured while cleaning up sessions: ${err.message}`,
      );
    }
  }
}
