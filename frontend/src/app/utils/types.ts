export interface MailMFAProps {
  enabled: boolean;
  mailAddress: string;
}

export interface AppMFAProps {
  enabled: boolean;
  token: string;
}

export interface MFAProps {
  mail: MailMFAProps;
  app: AppMFAProps;
}

export interface UserProps {
  uuid: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phonenumber: string;
  profile_picture: string;
  mfa: MFAProps;
}


export interface TodoProps {
  uuid: string;
  text: string;
  done: boolean;
}

export interface TodoListProps {
  uuid: string;
  title: string;
  description: string;
  todos: TodoProps[];
  deadline: string;
  sharedUsers: string[];
}

export interface Session {
  token: string,
  expires: Date,
};
