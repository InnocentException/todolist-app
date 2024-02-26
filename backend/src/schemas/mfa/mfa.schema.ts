import { Schema } from 'mongoose';
import { AppMFAProps, MFAProps, MailMFAProps } from 'src/utils/types';

export function createMFASchema(): Schema<MFAProps> {
  return new Schema<MFAProps>({
    mail:createMailMFASchema(),
    app: createAppMFASchema(),
  });
}

export function createMailMFASchema(): Schema<MailMFAProps> {
  return new Schema<MailMFAProps>({
    enabled: {
      type: Boolean,
    },
    mailAddress: {
        type: String,
    }
  });
}

export function createAppMFASchema(): Schema<AppMFAProps> {
  return new Schema<AppMFAProps>({
    enabled: {
      type: Boolean,
    },
    secret: {
      type: String,
      unique: true,
    }
  });
}