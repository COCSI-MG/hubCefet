import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { PdfGenerationProcessor } from './processors/pdf-generation.processor';
import { PdfGenerationService } from './services/pdf-generation.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
    FilesModule,
  ],
  providers: [
    PdfGenerationProcessor,
    PdfGenerationService,
  ],
  exports: [
    BullModule,
  ],
})
export class QueuesModule {} 