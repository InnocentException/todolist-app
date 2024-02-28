export class UserNotFoundError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

export class TodoListNotFoundError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class TodoNotFoundError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class SessionNotValidError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class TodoListRemovalError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class PasswordResetTokenNotValidError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class MailMFACodeNotValidError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}