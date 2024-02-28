import { Schema } from 'mongoose';
import { createTodoSchema } from './todo.schema';
import { TodoListProps } from 'src/utils/types';

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
    deadline: {
      type: String,
    },
    sharedUsers: {
      type: [String],
    },
    todos: [createTodoSchema()],
  });
}