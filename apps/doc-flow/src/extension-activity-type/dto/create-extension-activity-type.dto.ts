import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateExtensionActivityTypeDto {
  @ApiProperty({
    example: 'Projeto Social',
    description: 'Nome do tipo de atividade de extensão',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Atividades relacionadas a projetos sociais.',
    description: 'Descrição opcional do tipo de atividade de extensão',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
