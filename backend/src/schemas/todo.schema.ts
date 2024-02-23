import { Schema } from "mongoose";
import { TodoProps } from "src/services/todo-lists/todo-lists.service";

export function createTodoSchema(): Schema<TodoProps> {
  return new Schema<TodoProps>({
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    done: {
      type: Boolean,
      required: true,
    },
  });
}