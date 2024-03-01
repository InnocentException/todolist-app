import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Session, SessionSchema } from "src/schemas/session.schema";
import { createTodoListSchema } from "src/schemas/todolists/todolist.schema";
import { createUserSchema } from "src/schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forRoot(
     "mongodb://" + (process.env.MONGODB_HOST || 'localhost') + '/todolists-app',
    ),
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: createUserSchema(),
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
