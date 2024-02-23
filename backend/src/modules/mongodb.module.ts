import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Session, SessionSchema } from "src/schemas/session.schema";
import { createTodoListSchema } from "src/schemas/todolist.schema";
import { User, UserSchema } from "src/schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forRoot(
      (process.env.MONGODB_HOST || 'mongodb://localhost') + '/todolists-app',
    ),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Session.name,
        schema: SessionSchema,
      },
      {
        name: 'TodoList',
        schema: createTodoListSchema(),
      },
    ]),
  ],
  controllers: [],
  providers: [],
  exports: [MongooseModule],
})
export class MongoDBModule {}
