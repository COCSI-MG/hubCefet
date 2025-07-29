import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from './email.service';

export interface EmailJobData {
  type: 'class-cancellation';
  studentEmails: string[];
  className: string;
  subjectName: string;
  canceledDates: string[];
  reason: string;
  teacherName: string;
  classId: number;
}

@Processor('email')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send-class-cancellation')
  async handleClassCancellationEmail(job: Job<EmailJobData>) {
    this.logger.log(`Processando envio de email de cancelamento. Job ID: ${job.id}`);
    
    try {
      const { 
        studentEmails, 
        className, 
        subjectName, 
        canceledDates, 
        reason, 
        teacherName,
        classId 
      } = job.data;

      await job.progress(10);

      const emailSent = await this.emailService.sendClassCancellationEmail(
        studentEmails,
        className,
        subjectName,
        canceledDates,
        reason,
        teacherName
      );

      await job.progress(80);

      if (emailSent) {
        this.logger.log(`Emails de cancelamento enviados com sucesso para ${studentEmails.length} alunos da aula ${classId}`);
        
        await this.emailService.markCancellationsAsNotified(classId, canceledDates);
        
        await job.progress(100);
        return { success: true, emailsSent: studentEmails.length };
      } else {
        throw new Error('Falha ao enviar emails');
      }
    } catch (error) {
      this.logger.error(`Erro ao processar envio de email: ${error.message}`, error.stack);
      throw error;
    }
  }
} 