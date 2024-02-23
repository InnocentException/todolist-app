import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { TodoListProps } from 'src/services/todo-lists/todo-lists.service';
import { Schema } from 'mongoose';
import { createTodoSchema } from './todo.schema';

export function createTodoListSchema(): Schema<TodoListProps> {
  return new Schema<TodoListProps>({
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    useruid: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    todos: [createTodoSchema()],
  });
}