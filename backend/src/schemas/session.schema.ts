import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Session {
  @Prop({ required: true })
  useruid: string;
  @Prop({ unique: true, required: true })
  token: string;
  @Prop({ required: true })
  expires: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
