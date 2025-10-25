import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileUploadService {
  private readonly uploadsDir = process.env.PDF_STORAGE_PATH || './storage/certificates';

  constructor() {
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async saveCertificate(file: Express.Multer.File): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = join(this.uploadsDir, fileName);
    
    writeFileSync(filePath, file.buffer);
    
    return `certificates/${fileName}`;
  }

  validatePdfFile(file: Express.Multer.File): boolean {
    if (!file) {
      return false;
    }

    const allowedExtensions = ['.pdf'];
    const fileExtension = '.' + file.originalname.split('.').pop()?.toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return false;
    }

    const allowedMimeTypes = ['application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return false;
    }

    return true;
  }
} 
 
 