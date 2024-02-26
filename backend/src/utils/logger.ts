import chalk from 'chalk';

export enum LoggerStatus {
  info = 0,
  warning = 1,
  error = 2,
  success = 3,
}

export class Logger {
  public static logsFolder: string | null;
  private prefix: string;
  constructor(prefix: string) {
    this.prefix = prefix;
  }

  write(status: LoggerStatus | null, msg: string, usePrefix: boolean) {
    if (status == 0) {
      console.log(`[INFO] | ${usePrefix ? this.prefix : ''} ${msg}`);
    } else if (status == 1) {
      console.warn(`[WARNING] ${usePrefix ? this.prefix : ''} ${msg}`);
    } else if (status == 2) {
      console.error(`[ERROR] ${usePrefix ? this.prefix : ''} ${msg}`);
    } else if (status == 3) {
      console.log(
        `[SUCCESS] ${usePrefix ? this.prefix : ''} ${chalk.green(msg)}`,
      );
    } else {
    }
  }
}
