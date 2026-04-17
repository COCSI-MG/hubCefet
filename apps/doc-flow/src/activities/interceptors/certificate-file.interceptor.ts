import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

export function CertificateFileInterceptor() {
  return FileInterceptor('certificate', {
    storage: memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.pdf$/i)) {
        return cb(new BadRequestException('Apenas arquivos PDF são permitidos'), false);
      }

      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Apenas arquivos PDF são permitidos'), false);
      }

      cb(null, true);
    },
  });
}
