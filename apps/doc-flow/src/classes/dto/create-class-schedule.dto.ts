import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassScheduleDto {
  @ApiProperty({
    example: 1,
    description: 'ID da Aula',
  })
  @IsNotEmpty({ message: 'O ID da aula é obrigatório' })
  @IsNumber({}, { message: 'O ID da aula deve ser um número' })
  @Type(() => Number)
  class_id: number;

  @ApiProperty({
    example: 'Segunda-feira',
    description: 'Dia da semana',
  })
  @IsNotEmpty({ message: 'O dia da semana é obrigatório' })
  @IsString({ message: 'O dia da semana deve ser uma string' })
  day_of_week: string;

  @ApiProperty({
    example: '08:00',
    description: 'Hora de início',
  })
  @IsNotEmpty({ message: 'A hora de início é obrigatória' })
  @IsString({ message: 'A hora de início deve ser uma string' })
  start_time: string;

  @ApiProperty({
    example: '10:00',
    description: 'Hora de término',
  })
  @IsNotEmpty({ message: 'A hora de término é obrigatória' })
  @IsString({ message: 'A hora de término deve ser uma string' })
  end_time: string;

  @ApiProperty({
    example: 1,
    description: 'ID do Bloco',
  })
  @IsNotEmpty({ message: 'O ID do bloco é obrigatório' })
  @IsNumber({}, { message: 'O ID do bloco deve ser um número' })
  @Type(() => Number)
  building_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID da Sala',
  })
  @IsNotEmpty({ message: 'O ID da sala é obrigatório' })
  @IsNumber({}, { message: 'O ID da sala deve ser um número' })
  @Type(() => Number)
  room_id: number;
} 