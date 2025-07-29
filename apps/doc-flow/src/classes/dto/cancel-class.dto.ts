import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, Validate, IsDateString } from 'class-validator';

export class CancelClassDto {
  @ApiProperty({
    example: ['2023-06-15', '2023-06-22'],
    description: 'Lista de datas a serem canceladas',
  })
  @IsArray({ message: 'O campo dates deve ser um array' })
  @IsDateString({}, { each: true, message: 'Cada data deve estar no formato YYYY-MM-DD' })
  dates: string[];

  @ApiProperty({
    example: 'Feriado nacional',
    description: 'Motivo do cancelamento',
  })
  @IsString({ message: 'O motivo deve ser uma string' })
  @IsNotEmpty({ message: 'O motivo do cancelamento é obrigatório' })
  reason: string;
} 
