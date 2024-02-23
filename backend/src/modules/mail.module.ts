import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.MAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.MAIL_USER || 'your-email@gmail.com',
          pass: process.env.MAIL_PASSWORD || 'your-email-password',
        },
      },
      defaults: {
        from: process.env.MAIL_FROM || 'your-email@gmail.com',
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [MailerModule],
})
export class MailModule {
  constructor() {
  }
}
