import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({
    example: 'Programação Web',
    description: 'Nome da disciplina',
  })
  @IsNotEmpty({ message: 'O nome da disciplina é obrigatório' })
  @IsString({ message: 'O nome da disciplina deve ser uma string' })
  name: string;

  @ApiProperty({
    example: 'WEB001',
    description: 'Código da disciplina',
  })
  @IsNotEmpty({ message: 'O código da disciplina é obrigatório' })
  @IsString({ message: 'O código da disciplina deve ser uma string' })
  code: string;
} 