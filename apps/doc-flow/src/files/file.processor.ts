import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { FilesService } from './files.service';
import { FileToUpload } from './file-to-upload';
import { FileStatus } from './enum/file-status.enum';

@Processor('file')
export class FileProcessor {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(private readonly filesService: FilesService) {}

  @Process('processFile')
  async handleProcessFile(job: Job<FileToUpload>) {
    this.logger.debug('Processing file...');

    const fileData = await this.filesService.findOne(job.data.fileId);
    if (!fileData) {
      this.logger.error(`File ${job.data.fileId} not found`);
      return;
    }
    this.logger.log(`File ${fileData.name} found`);

    const { filename, mimetype, buffer, size } = job.data;
    this.logger.log(
      `Processing file: ${filename} with size ${size} bytes and mimetype ${mimetype}`,
    );

    let filePath: string;
    let status: FileStatus;
    try {
      const fileBuffer = Buffer.from(buffer, 'base64');
      const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
      this.logger.debug(`Saving file ${filename} on disk, path ${uploadDir}`);

      if (!fs.existsSync(uploadDir)) {
        this.logger.error(`Upload directory ${uploadDir} not found`);
        return;
      }

      filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, fileBuffer);

      this.logger.debug(`File ${filename} saved on disk`);
      status = FileStatus.STATUS_DONE;
    } catch (error) {
      this.logger.error(`Error processing file ${filename}`);
      this.logger.error(error);
      status = FileStatus.STATUS_ERROR;
    } finally {
      // Atualiza o status do arquivo
      await this.filesService.update(job.data.fileId, {
        status,
        path: filePath,
      });
      this.logger.debug('File processed');
    }
  }
}
