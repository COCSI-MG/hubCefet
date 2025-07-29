import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScheduleDto {
  @ApiProperty({
    example: 1,
    description: 'ID da aula',
  })
  @IsNotEmpty({ message: 'O ID da aula é obrigatório' })
  @IsNumber({}, { message: 'O ID da aula deve ser um número' })
  @Type(() => Number)
  classId: number;

  @ApiProperty({
    example: 'Segunda-feira',
    description: 'Dia da semana',
  })
  @IsNotEmpty({ message: 'O dia da semana é obrigatório' })
  @IsString({ message: 'O dia da semana deve ser uma string' })
  dayOfWeek: string;

  @ApiProperty({
    example: 1,
    description: 'ID do TimeSlot que define início e fim do horário',
    required: true,
  })
  @IsNotEmpty({ message: 'O ID do TimeSlot é obrigatório' })
  @IsNumber({}, { message: 'O ID do TimeSlot deve ser um número' })
  @Type(() => Number)
  timeSlotId: number;

  @ApiProperty({
    example: 1,
    description: 'ID do bloco',
  })
  @IsNotEmpty({ message: 'O ID do bloco é obrigatório' })
  @IsNumber({}, { message: 'O ID do bloco deve ser um número' })
  @Type(() => Number)
  buildingId: number;

  @ApiProperty({
    example: 1,
    description: 'ID da sala',
  })
  @IsNotEmpty({ message: 'O ID da sala é obrigatório' })
  @IsNumber({}, { message: 'O ID da sala deve ser um número' })
  @Type(() => Number)
  roomId: number;
} 