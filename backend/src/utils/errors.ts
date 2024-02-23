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

export class TodoNotFound extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class SessionNotValid extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class TodoListRemovalError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class PasswordResetTokenNotValid extends Error {
  constructor(msg: string) {
    super(msg);
  }
}