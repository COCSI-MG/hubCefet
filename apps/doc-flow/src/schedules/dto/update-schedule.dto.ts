import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateScheduleDto {
  @ApiProperty({
    example: 1,
    description: 'ID da aula',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ID da aula deve ser um número' })
  @Type(() => Number)
  classId?: number;

  @ApiProperty({
    example: 'Segunda-feira',
    description: 'Dia da semana',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O dia da semana deve ser uma string' })
  dayOfWeek?: string;

  @ApiProperty({
    example: 1,
    description: 'ID do TimeSlot que define início e fim do horário',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ID do TimeSlot deve ser um número' })
  @Type(() => Number)
  timeSlotId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID do bloco',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ID do bloco deve ser um número' })
  @Type(() => Number)
  buildingId?: number;

  @ApiProperty({
    example: 1,
    description: 'ID da sala',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'O ID da sala deve ser um número' })
  @Type(() => Number)
  roomId?: number;
} 