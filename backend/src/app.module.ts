import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongoDBModule } from './modules/mongodb.module';
import { SchedulerModule } from './modules/scheduler.module';
import { TasksService } from './services/tasks/tasks.service';
import { TodoListsService } from './services/todo-lists/todo-lists.service';
import { UserService } from './services/user/user.service';
import { AuthService } from './services/auth/auth.service';
import { MailModule } from './modules/mail.module';
import { MailService } from './services/mail/mail.service';

@Module({
  imports: [MongoDBModule, MailModule, SchedulerModule],
  controllers: [AppController],
  providers: [
    AuthService,
    UserService,
    TodoListsService,
    TasksService,
    MailService,
  ],
})
export class AppModule {}
