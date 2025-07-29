import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, Inject } from '@nestjs/common';
import { PdfGenerationJobData } from '../interfaces/pdf-generation-job.interface';
import { PdfGenerationService } from '../services/pdf-generation.service';
import { FilesService } from '../../files/files.service';
import { FileType } from '../../files/enum/file-type.enum';
import { FileStatus } from '../../files/enum/file-status.enum';

@Processor('pdf-generation')
export class PdfGenerationProcessor {
  private readonly logger = new Logger(PdfGenerationProcessor.name);

  constructor(
    private readonly pdfGenerationService: PdfGenerationService,
    private readonly filesService: FilesService,
  ) {}

  @Process('generate-certificate')
  async generateCertificate(job: Job<PdfGenerationJobData>) {
    const { data } = job;
    try {
      const filePath = await this.pdfGenerationService.generateCertificatePdf(data);
      this.logger.log(`[QUEUE] ✅ PDF gerado com sucesso: ${filePath}`);

      const fileName = `cert_${Date.now()}.pdf`;
      
      this.logger.log(`[QUEUE] 💾 Salvando no banco: ${fileName}`);
      await this.filesService.create({
        name: fileName,
        url: filePath,
        type: FileType.CERTIFICATE,
        eventId: data.eventId,
      }, data.userId);

      this.logger.log(`[QUEUE] ✅ Job PDF concluído com SUCESSO para presença ${data.presenceId}`);
      return { 
        success: true, 
        filePath, 
        fileName,
        processedAt: new Date().toISOString()
      };

    } catch (error) {
      this.logger.error(`[QUEUE] ❌ ERRO ao processar job PDF para presença ${data.presenceId}: ${error.message}`);
      throw error;
    }
  }
} 