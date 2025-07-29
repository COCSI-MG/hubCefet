import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { EmailQueueService } from './email-queue.service';
import { Profiles } from '../profile/decorators/profile.decorator';
import { Profile } from '../profile/enum/profile.enum';

class TestEmailDto {
  email: string;
}

@ApiTags('email')
@Controller('email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(
    private readonly emailQueueService: EmailQueueService
  ) {}

  @Get('queue-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter status da fila de emails' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status da fila obtido com sucesso' })
  @Profiles(Profile.Admin)
  async getQueueStatus(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    try {
      return await this.emailQueueService.getQueueStatus();
    } catch (error) {
      this.logger.error(`Erro ao obter status da fila: ${error.message}`);
      throw error;
    }
  }

  @Post('retry-failed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reprocessar jobs de email falhados' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jobs falhados reprocessados' })
  @Profiles(Profile.Admin)
  async retryFailedJobs(): Promise<{ retriedCount: number; message: string }> {
    try {
      const retriedCount = await this.emailQueueService.retryFailedJobs();
      return {
        retriedCount,
        message: `${retriedCount} jobs falhados foram reprocessados`
      };
    } catch (error) {
      this.logger.error(`Erro ao reprocessar jobs falhados: ${error.message}`);
      return {
        retriedCount: 0,
        message: `Erro ao reprocessar jobs: ${error.message}`
      };
    }
  }

} 