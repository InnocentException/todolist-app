import { Schema } from 'mongoose';
import { createMFASchema } from './mfa/mfa.schema';
import { UserProps } from 'src/utils/types';

export function createUserSchema(): Schema<UserProps> {
  return new Schema<UserProps>({
    uuid: {
      type: String,
      unique: true,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phonenumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile_picture: {
      type: String,
    },
    mfa: {
      type: createMFASchema(),
      required: true,
    },
  });
}