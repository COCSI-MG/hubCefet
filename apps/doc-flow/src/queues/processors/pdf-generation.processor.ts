import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PdfGenerationJobData } from '../interfaces/pdf-generation-job.interface';
import { PdfGenerationService } from '../services/pdf-generation.service';
import { FilesService } from '../../files/files.service';
import { FileType } from '../../files/enum/file-type.enum';
import { ActivitiesService } from '../../activities/activities.service';

@Processor('pdf-generation')
export class PdfGenerationProcessor {
  private readonly logger = new Logger(PdfGenerationProcessor.name);

  constructor(
    private readonly pdfGenerationService: PdfGenerationService,
    private readonly filesService: FilesService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Process('generate-certificate')
  async generateCertificate(job: Job<PdfGenerationJobData>) {
    const { data } = job;
    try {
      const filePath =
        await this.pdfGenerationService.generateCertificatePdf(data);
      this.logger.log(`[QUEUE] ✅ PDF gerado com sucesso: ${filePath}`);

      const fileName = `cert_${Date.now()}.pdf`;

      this.logger.log(`[QUEUE] 💾 Salvando no banco: ${fileName}`);
      await this.filesService.create(
        {
          name: fileName,
          url: filePath,
          type: FileType.CERTIFICATE,
        },
        data.userId,
      );

      if (data.activityTypeId && data.activityHours) {
        try {
          const activity = await this.activitiesService.createApprovedFromEvent({
            userId: data.userId,
            eventName: data.eventName,
            certificateUrl: filePath,
            activityTypeId: data.activityTypeId,
            hours: data.activityHours,
            complementaryActivityTypeId: data.complementaryActivityTypeId,
            extensionActivityTypeId: data.extensionActivityTypeId,
          });
          this.logger.log(
            `[QUEUE] ✅ Atividade aprovada ${activity.id} criada a partir do evento ${data.eventId}`,
          );
        } catch (activityError) {
          this.logger.error(
            `[QUEUE] ❌ Falha ao criar atividade automática para presença ${data.presenceId}: ${activityError.message}`,
          );
        }
      }

      this.logger.log(
        `[QUEUE] ✅ Job PDF concluído com SUCESSO para presença ${data.presenceId}`,
      );
      return {
        success: true,
        filePath,
        fileName,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `[QUEUE] ❌ ERRO ao processar job PDF para presença ${data.presenceId}: ${error.message}`,
      );
      throw error;
    }
  }
}
