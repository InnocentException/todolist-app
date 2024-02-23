import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
  exports: [ScheduleModule]
})
export class SchedulerModule {}
