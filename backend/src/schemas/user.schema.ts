import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {
  @Prop({ unique: true, required: true })
  uuid: string;
  @Prop({ required: true })
  firstname: string;
  @Prop({ required: true })
  lastname: string;
  @Prop({ unique: true, required: true })
  email: string;
  @Prop({ unique: true, required: true })
  phonenumber: string;
  @Prop({ unique: true, required: true })
  username: string;
  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
