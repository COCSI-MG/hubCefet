import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateComplementaryActivityTypeDto {
  @ApiProperty({
    example: 'Extensão Universitária',
    description: 'Nome do tipo de atividade complementar',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Atividades relacionadas à extensão universitária.',
    description: 'Descrição opcional do tipo de atividade complementar',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

