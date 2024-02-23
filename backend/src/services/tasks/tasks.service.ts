import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AuthService } from 'src/services/auth/auth.service';

@Injectable()
export class TasksService {
  constructor(private authService: AuthService) {}

  @Cron('0 0 0 * * *')
  async handleCron() {
    await this.authService.cleanUpSessions();
  }
}
