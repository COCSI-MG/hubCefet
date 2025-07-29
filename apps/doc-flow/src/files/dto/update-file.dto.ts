import { PartialType } from '@nestjs/mapped-types';
import { CreateFileDto } from './create-file.dto';
import { IsEnum, IsString } from 'class-validator';
import { FileStatus } from '../enum/file-status.enum';

export class UpdateFileDto extends PartialType(CreateFileDto) {
  @IsEnum(FileStatus)
  status?: string;
  @IsString()
  path?: string;
}
