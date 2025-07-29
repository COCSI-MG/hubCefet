import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSubjectDto {
  @ApiProperty({
    example: 'Programação Web',
    description: 'Nome da disciplina',
  })
  @IsOptional()
  @IsString({ message: 'O nome da disciplina deve ser uma string' })
  name?: string;

  @ApiProperty({
    example: 'WEB001',
    description: 'Código da disciplina',
  })
  @IsOptional()
  @IsString({ message: 'O código da disciplina deve ser uma string' })
  code?: string;
} 