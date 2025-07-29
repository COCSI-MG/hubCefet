import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailProcessor } from './email.processor';
import { EmailQueueService } from './email-queue.service';
import { ClassCancellation } from '../classes/entities/class-cancellation.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    SequelizeModule.forFeature([ClassCancellation]),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailProcessor, EmailQueueService],
  exports: [EmailService, EmailQueueService],
})
export class EmailModule {} 