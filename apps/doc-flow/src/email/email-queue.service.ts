import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { EmailJobData } from './email.processor';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async addClassCancellationEmailJob(
    classId: number,
    studentEmails: string[],
    className: string,
    subjectName: string,
    canceledDates: string[],
    reason: string,
    teacherName: string
  ): Promise<void> {
    try {
      const jobData: EmailJobData = {
        type: 'class-cancellation',
        classId,
        studentEmails,
        className,
        subjectName,
        canceledDates,
        reason,
        teacherName
      };

      const job = await this.emailQueue.add('send-class-cancellation', jobData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Job de email de cancelamento adicionado à fila. Job ID: ${job.id}, Aula: ${classId}, Emails: ${studentEmails.length}`);
    } catch (error) {
      this.logger.error(`Erro ao adicionar job de email à fila: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        this.emailQueue.getWaiting(),
        this.emailQueue.getActive(),
        this.emailQueue.getCompleted(),
        this.emailQueue.getFailed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    } catch (error) {
      this.logger.error(`Erro ao obter status da fila: ${error.message}`);
      throw error;
    }
  }

  async retryFailedJobs(): Promise<number> {
    try {
      const failedJobs = await this.emailQueue.getFailed();
      let retriedCount = 0;

      for (const job of failedJobs) {
        await job.retry();
        retriedCount++;
      }

      this.logger.log(`${retriedCount} jobs falhados foram reprocessados`);
      return retriedCount;
    } catch (error) {
      this.logger.error(`Erro ao reprocessar jobs falhados: ${error.message}`);
      throw error;
    }
  }
} 