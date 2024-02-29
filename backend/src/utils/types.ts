export interface TodoProps {
  uuid: string;
  text: string;
  done: boolean;
}

export interface TodoListProps {
  uuid: string;
  useruid: string;
  title: string;
  description: string;
  deadline: string;
  sharedUsers: string[];
  todos: TodoProps[];
}



export interface MailMFAProps {
  enabled: boolean;
  mailAddress: string;
}

export interface AppMFAProps {
  enabled: boolean;
  secret: string;
}

export interface MFAProps {
  mail: MailMFAProps;
  app: AppMFAProps;
}



export interface SessionProps {
  useruid: string;
  token: string;
  expires: Date;
}

export interface UserProps {
  uuid: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phonenumber: string;
  password: string;
  profile_picture: string;
  mfa: MFAProps;
}