import { Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
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

  constructor(private readonly emailService: EmailService) { }

} 
