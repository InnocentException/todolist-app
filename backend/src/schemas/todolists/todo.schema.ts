import { Schema } from "mongoose";
import { TodoProps } from "src/utils/types";

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