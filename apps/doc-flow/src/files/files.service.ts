import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileRepository } from './repository/files.repository.interface';
import { FILE_REPOSITORY } from './repository/files-repository.token';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { FileToUpload } from './file-to-upload';
import { unlink } from 'node:fs/promises';
import { FileStatus } from './enum/file-status.enum';
import { createReadStream, existsSync } from 'node:fs';
import { Response } from 'express';
import { join } from 'node:path';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @Inject(FILE_REPOSITORY)
    private readonly fileRepository: FileRepository,
    @InjectQueue('file') private readonly fileQueue: Queue,
  ) { }

  async create(createFileDto: CreateFileDto, userId: string) {
    const existingFiles = await this.fileRepository.findByUserNameAndType(
      userId,
      createFileDto.name,
      createFileDto.type,
    );

    if (existingFiles.length > 0) {
      this.logger.log(
        `[PDF] Arquivo já existe para usuário ${userId}. Atualizando...`,
      );

      const existingFile = existingFiles[0];
      await this.fileRepository.update(existingFile.id, {
        name: createFileDto.name,
        url: createFileDto.url,
        type: createFileDto.type,
      });

      return await this.fileRepository.findOne(existingFile.id);
    }

    console.log('Creating new file record', createFileDto, userId);

    return await this.fileRepository.create(createFileDto, userId);
  }

  async findAll() {
    const files = await this.fileRepository.findAll();
    if (!files || files.length === 0) {
      throw new NotFoundException('Files not found');
    }

    return files
  }

  async findOne(id: string) {
    const file = await this.fileRepository.findOne(id);
    if (!file) {
      throw new NotFoundException('Arquivo nao encontrado')
    }

    return file
  }

  async findByPk(id: string) {
    return await this.fileRepository.findOne(id);
  }

  async findByUserId(id: string, limit: number, offset: number) {
    return await this.fileRepository.findByUserIdPaginate(id, limit, offset);
  }

  async update(id: string, updateFileDto: UpdateFileDto) {
    const file = await this.fileRepository.update(id, updateFileDto);
    return file;
  }

  async remove(id: string): Promise<void> {
    const fileData = await this.fileRepository.findOne(id);
    if (!fileData) {
      throw new NotFoundException('Arquivo nao encontrado');
    }

    if (fileData.status != FileStatus.STATUS_PROCESSING && fileData.url) {
      await unlink(fileData.url);
    }

    await this.fileRepository.remove(id);
  }

  async upload(file: Express.Multer.File, fileId: string): Promise<void> {
    const fileData = await this.fileRepository.findOne(fileId);
    if (!fileData) {
      throw new Error('Arquivo nao encontrado');
    }
    if (fileData.status !== FileStatus.STATUS_WAITING) {
      this.logger.error(
        `File status is ${fileData.status}, resource already exists or is being processed`,
      );
      throw new ConflictException(
        'Recurso ja exiiste ou esta sendo processado',
      );
    }
    const fileToUploadData: FileToUpload = {
      fileId: fileData.id,
      buffer: file.buffer.toString('base64'),
      filename: `${fileData.name}_${fileData.type}_${file.originalname}`,
      mimetype: file.mimetype,
      size: file.size,
    };
    await this.enqueueFileToSaveOnDisk(fileToUploadData);
  }

  async downloadFile(
    fileId: string,
    res: Response,
    userId: string,
  ): Promise<void> {
    const file = await this.fileRepository.findOne(fileId);
    if (!file) {
      this.logger.error(`File not found for id ${fileId}`);
      throw new NotFoundException('Arquivo nao encontrado');
    }

    if (userId !== file.user_id) {
      throw new ForbiddenException('Apenas o dono do arquivo pode visualiza-lo')
    }

    const uploadsDir = process.env.PDF_STORAGE_PATH || './storage/certificates';
    const fileName = file.url.replace('storage/certificates/', '');
    const filePath = join(uploadsDir, fileName);

    const fileExists = existsSync(filePath);
    if (!fileExists) {
      throw new BadRequestException('Arquivo nao encontrado no disco');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  private async enqueueFileToSaveOnDisk(file: FileToUpload): Promise<void> {
    await this.fileQueue.add('processFile', file);
  }
}
