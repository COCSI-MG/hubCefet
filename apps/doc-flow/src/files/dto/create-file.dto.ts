import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../enum/file-type.enum';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateFileDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(FileType)
  type: FileType;
}
