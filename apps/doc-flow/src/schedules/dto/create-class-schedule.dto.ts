import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassScheduleDto {
  @ApiProperty({
    example: 1,
    description: 'ID da Aula',
    required: false
  })
  @IsInt({ message: 'O ID da aula deve ser um número inteiro' })
  @IsOptional()
  @Type(() => Number)
  class_id?: number;

  @ApiProperty({
    example: 1,
    description: 'ID do Horário',
  })
  @IsInt({ message: 'O ID do horário deve ser um número inteiro' })
  @IsNotEmpty({ message: 'O ID do horário é obrigatório' })
  @Type(() => Number)
  time_slot_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID da Sala',
  })
  @IsInt({ message: 'O ID da sala deve ser um número inteiro' })
  @IsNotEmpty({ message: 'O ID da sala é obrigatório' })
  @Type(() => Number)
  room_id: number;

  @ApiProperty({
    example: 1,
    description: 'ID do Bloco (opcional, será obtido da sala se não fornecido)',
    required: false,
  })
  @IsInt({ message: 'O ID do bloco deve ser um número inteiro' })
  @IsOptional()
  @Type(() => Number)
  building_id?: number;
} 