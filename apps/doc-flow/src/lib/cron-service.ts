import { FileHandle, open } from 'node:fs/promises';
import * as path from 'path';

export abstract class CronService {
  constructor(protected cronName: string) {
    this.cronName = cronName;
  }

  private getFileName(cronJobName: string): string {
    return (
      new Date().toISOString().replace(/:/g, '-') +
      '-' +
      this.cronName +
      cronJobName +
      '.log'
    );
  }

  protected async initLogFile(cronJobName: string): Promise<FileHandle> {
    const fileName = this.getFileName(cronJobName);
    return await open(
      path.resolve(__dirname, '../../', 'log/cron/', fileName),
      'a',
    );
  }

  protected async writeLog(
    logFile: FileHandle,
    message: string,
  ): Promise<void> {
    if (logFile) {
      await logFile.write(
        `${new Date().toISOString()} - ${this.cronName}: ${message}\n`,
      );
    }
  }
}
